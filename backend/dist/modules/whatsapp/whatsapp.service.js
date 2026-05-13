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
var WhatsAppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode = __importStar(require("qrcode"));
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
            await this.client.destroy();
        }
    }
    initializeClient() {
        this.logger.log('Initializing WhatsApp client...');
        this.client = new whatsapp_web_js_1.Client({
            authStrategy: new whatsapp_web_js_1.LocalAuth(),
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
            }
            catch (err) {
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
                this.logger.log('Destroying WhatsApp client to free resources...');
                await this.client.destroy();
            }
            catch (err) {
                this.logger.error('Error while destroying WhatsApp client', err);
            }
            setTimeout(() => {
                this.status = 'INITIALIZING';
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
    async sendMessageToConfiguredNumbers(userId, message) {
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