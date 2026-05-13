import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode';
import { ParametersService } from '../parameters/parameters.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WhatsAppService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(WhatsAppService.name);
    private client: Client;
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
            await this.client.destroy();
        }
    }

    private initializeClient() {
        this.logger.log('Initializing WhatsApp client...');
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }
        });

        this.client.on('qr', async (qr) => {
            this.logger.log('WhatsApp QR Code received. Awaiting scan...');
            this.status = 'QR_READY';
            try {
                this.qrCodeDataUrl = await qrcode.toDataURL(qr);
            } catch (err) {
                this.logger.error('Failed to generate QR Code Data URL', err);
            }
        });

        this.client.on('ready', () => {
            this.logger.log('WhatsApp client is ready and connected!');
            this.status = 'CONNECTED';
            this.qrCodeDataUrl = null;
        });

        this.client.on('disconnected', async (reason) => {
            this.logger.warn(`WhatsApp client disconnected: ${reason}`);
            this.status = 'DISCONNECTED';
            this.qrCodeDataUrl = null;
            
            try {
                // IMPORTANT: Destroy the client to kill the background Chrome process and free RAM
                this.logger.log('Destroying WhatsApp client to free resources...');
                await this.client.destroy();
            } catch (err) {
                this.logger.error('Error while destroying WhatsApp client', err);
            }

            // Auto-restart after disconnection by completely re-initializing
            setTimeout(() => {
                this.status = 'INITIALIZING';
                // Re-create the client and bind events from scratch
                this.initializeClient();
            }, 5000);
        });

        this.client.initialize().catch(err => {
            this.logger.error('Failed to initialize WhatsApp client. Check if Chrome path is correct.', err);
        });
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
        if (this.status !== 'CONNECTED') {
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
                const formattedNumber = `${number}@c.us`;
                try {
                    await this.client.sendMessage(formattedNumber, message);
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
