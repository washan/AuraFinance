import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { makeWASocket, DisconnectReason, BufferJSON, initAuthCreds, SignalDataTypeMap, AuthenticationState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as qrcode from 'qrcode';
import pino from 'pino';
import { ParametersService } from '../parameters/parameters.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WhatsAppService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(WhatsAppService.name);
    private client: any;
    private qrCodeDataUrl: string | null = null;
    private status: 'INITIALIZING' | 'QR_READY' | 'CONNECTED' | 'DISCONNECTED' = 'INITIALIZING';

    constructor(
        private parametersService: ParametersService,
        private prisma: PrismaService,
    ) { }

    async onModuleInit() {
        this.initializeClient();
    }

    async onModuleDestroy() {
        if (this.client) {
            this.client.end(undefined);
        }
    }

    private async usePrismaAuthState(): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> {
        const readData = async (key: string) => {
            try {
                const row = await this.prisma.whatsAppSession.findUnique({ where: { key } });
                if (!row) return null;
                return JSON.parse(row.data, BufferJSON.reviver);
            } catch (err) {
                this.logger.error(`Error reading ${key} from DB`, err);
                return null;
            }
        };
        const writeData = async (data: any, key: string) => {
            try {
                const dataStr = JSON.stringify(data, BufferJSON.replacer);
                await this.prisma.whatsAppSession.upsert({
                    where: { key },
                    update: { data: dataStr },
                    create: { key, data: dataStr },
                });
            } catch (err) {
                this.logger.error(`Error writing ${key} to DB`, err);
            }
        };
        const removeData = async (key: string) => {
            try {
                await this.prisma.whatsAppSession.delete({ where: { key } });
            } catch {
                // Ignore if doesn't exist
            }
        };

        const creds = await readData('creds') || initAuthCreds();

        return {
            state: {
                creds,
                keys: {
                    get: async (type, ids) => {
                        const data: { [id: string]: SignalDataTypeMap[typeof type] } = {};
                        for (const id of ids) {
                            let value = await readData(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                                // Baileys auto-handles app-state-sync-key parsing if structured right,
                                // but we rely on BufferJSON for safety
                            }
                            data[id] = value;
                        }
                        return data;
                    },
                    set: async (data: any) => {
                        const tasks: (() => Promise<any>)[] = [];
                        for (const category in data) {
                            for (const id in data[category]) {
                                const value = data[category][id];
                                const key = `${category}-${id}`;
                                tasks.push(() => value ? writeData(value, key) : removeData(key));
                            }
                        }
                        // Process in small batches to avoid exhausting the DB connection pool
                        const BATCH_SIZE = 5;
                        for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
                            const batch = tasks.slice(i, i + BATCH_SIZE).map(fn => fn());
                            await Promise.all(batch);
                        }
                    }
                }
            },
            saveCreds: () => writeData(creds, 'creds')
        };
    }

    private async initializeClient() {
        this.logger.log('Initializing WhatsApp client (Baileys)...');
        this.status = 'INITIALIZING';

        try {
            const { state, saveCreds } = await this.usePrismaAuthState();
            
            const pinoLogger = pino({ level: 'silent' });

            this.client = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pinoLogger,
                browser: ['Aura Finance', 'Chrome', '10.0'],
            });

            this.client.ev.on('creds.update', saveCreds);

            this.client.ev.on('connection.update', async (update: any) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    this.logger.log('WhatsApp QR Code received. Awaiting scan...');
                    this.status = 'QR_READY';
                    try {
                        this.qrCodeDataUrl = await qrcode.toDataURL(qr);
                    } catch (err) {
                        this.logger.error('Failed to generate QR Code Data URL', err);
                    }
                }

                if (connection === 'close') {
                    this.status = 'DISCONNECTED';
                    this.qrCodeDataUrl = null;
                    const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                    
                    this.logger.warn(`WhatsApp connection closed due to: ${lastDisconnect?.error}. Reconnecting: ${shouldReconnect}`);
                    
                    // If logged out, clear DB state
                    if (!shouldReconnect) {
                        this.logger.warn('User logged out. Clearing auth state from database.');
                        await this.prisma.whatsAppSession.deleteMany({});
                    }
                    
                    // Always reconnect (if logged out, it will generate a new QR)
                    setTimeout(() => {
                        this.initializeClient();
                    }, 5000);
                } else if (connection === 'open') {
                    this.logger.log('WhatsApp client is ready and connected!');
                    this.status = 'CONNECTED';
                    this.qrCodeDataUrl = null;
                }
            });
        } catch (error) {
            this.logger.error('Failed to initialize WhatsApp client', error);
            // Retry later
            setTimeout(() => {
                this.initializeClient();
            }, 5000);
        }
    }

    getStatus() {
        return {
            status: this.status,
            qrCode: this.qrCodeDataUrl
        };
    }

    /**
     * Helper to send generic messages to configured users.
     */
    async sendMessageToConfiguredNumbers(userId: string, message: string) {
        if (this.status !== 'CONNECTED' || !this.client) {
            this.logger.warn('Cannot send WhatsApp message: Client is not connected');
            return false;
        }

        try {
            const param = await this.parametersService.getParameter(userId, 'WHATSAPP_NOTIFY_NUMBERS');
            if (!param || !param.value) {
                this.logger.warn(`No WhatsApp numbers configured for user ${userId}`);
                return false;
            }

            const numbers = param.value.split(',').map(n => n.trim()).filter(n => n.length > 0);
            
            let success = true;
            for (const number of numbers) {
                // Baileys format: [countrycode][number]@s.whatsapp.net
                const formattedNumber = `${number}@s.whatsapp.net`;
                try {
                    await this.client.sendMessage(formattedNumber, { text: message });
                    this.logger.log(`WhatsApp message sent to ${number}`);
                } catch (sendErr) {
                    this.logger.error(`Failed to send WhatsApp to ${number}`, sendErr);
                    success = false;
                }
            }

            return success;
        } catch (error) {
            this.logger.error('Failed to send WhatsApp message', error);
            return false;
        }
    }
}
