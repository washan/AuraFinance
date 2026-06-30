"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WhatsAppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const baileys_1 = require("@whiskeysockets/baileys");
const qrcode = __importStar(require("qrcode"));
const pino_1 = __importDefault(require("pino"));
const parameters_service_1 = require("../parameters/parameters.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let WhatsAppService = WhatsAppService_1 = class WhatsAppService {
    parametersService;
    prisma;
    logger = new common_1.Logger(WhatsAppService_1.name);
    client;
    qrCodeDataUrl = null;
    status = 'INITIALIZING';
    constructor(parametersService, prisma) {
        this.parametersService = parametersService;
        this.prisma = prisma;
    }
    async onModuleInit() {
        this.initializeClient();
    }
    async onModuleDestroy() {
        if (this.client) {
            this.client.end(undefined);
        }
    }
    async usePrismaAuthState() {
        const readData = async (key) => {
            try {
                const row = await this.prisma.whatsAppSession.findUnique({ where: { key } });
                if (!row)
                    return null;
                return JSON.parse(row.data, baileys_1.BufferJSON.reviver);
            }
            catch (err) {
                this.logger.error(`Error reading ${key} from DB`, err);
                return null;
            }
        };
        const writeData = async (data, key) => {
            try {
                const dataStr = JSON.stringify(data, baileys_1.BufferJSON.replacer);
                await this.prisma.whatsAppSession.upsert({
                    where: { key },
                    update: { data: dataStr },
                    create: { key, data: dataStr },
                });
            }
            catch (err) {
                this.logger.error(`Error writing ${key} to DB`, err);
            }
        };
        const removeData = async (key) => {
            try {
                await this.prisma.whatsAppSession.delete({ where: { key } });
            }
            catch {
            }
        };
        const creds = await readData('creds') || (0, baileys_1.initAuthCreds)();
        return {
            state: {
                creds,
                keys: {
                    get: async (type, ids) => {
                        const data = {};
                        for (const id of ids) {
                            let value = await readData(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                            }
                            data[id] = value;
                        }
                        return data;
                    },
                    set: async (data) => {
                        const tasks = [];
                        for (const category in data) {
                            for (const id in data[category]) {
                                const value = data[category][id];
                                const key = `${category}-${id}`;
                                tasks.push(() => value ? writeData(value, key) : removeData(key));
                            }
                        }
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
    async initializeClient() {
        this.logger.log('Initializing WhatsApp client (Baileys)...');
        this.status = 'INITIALIZING';
        try {
            const { state, saveCreds } = await this.usePrismaAuthState();
            const pinoLogger = (0, pino_1.default)({ level: 'silent' });
            this.client = (0, baileys_1.makeWASocket)({
                auth: state,
                printQRInTerminal: false,
                logger: pinoLogger,
                browser: ['Aura Finance', 'Chrome', '10.0'],
            });
            this.client.ev.on('creds.update', saveCreds);
            this.client.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    this.logger.log('WhatsApp QR Code received. Awaiting scan...');
                    this.status = 'QR_READY';
                    try {
                        this.qrCodeDataUrl = await qrcode.toDataURL(qr);
                    }
                    catch (err) {
                        this.logger.error('Failed to generate QR Code Data URL', err);
                    }
                }
                if (connection === 'close') {
                    this.status = 'DISCONNECTED';
                    this.qrCodeDataUrl = null;
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== baileys_1.DisconnectReason.loggedOut;
                    this.logger.warn(`WhatsApp connection closed due to: ${lastDisconnect?.error}. Reconnecting: ${shouldReconnect}`);
                    if (!shouldReconnect) {
                        this.logger.warn('User logged out. Clearing auth state from database.');
                        await this.prisma.whatsAppSession.deleteMany({});
                    }
                    setTimeout(() => {
                        this.initializeClient();
                    }, 5000);
                }
                else if (connection === 'open') {
                    this.logger.log('WhatsApp client is ready and connected!');
                    this.status = 'CONNECTED';
                    this.qrCodeDataUrl = null;
                }
            });
        }
        catch (error) {
            this.logger.error('Failed to initialize WhatsApp client', error);
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
    async sendMessageToConfiguredNumbers(userId, message) {
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
                const formattedNumber = `${number}@s.whatsapp.net`;
                try {
                    await this.client.sendMessage(formattedNumber, { text: message });
                    this.logger.log(`WhatsApp message sent to ${number}`);
                }
                catch (sendErr) {
                    this.logger.error(`Failed to send WhatsApp to ${number}`, sendErr);
                    success = false;
                }
            }
            return success;
        }
        catch (error) {
            this.logger.error('Failed to send WhatsApp message', error);
            return false;
        }
    }
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = WhatsAppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [parameters_service_1.ParametersService,
        prisma_service_1.PrismaService])
], WhatsAppService);
//# sourceMappingURL=whatsapp.service.js.map