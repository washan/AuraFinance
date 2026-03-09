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
var ImapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImapService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const imaps = __importStar(require("imap-simple"));
const mailparser_1 = require("mailparser");
const parser_service_1 = require("./parser.service");
let ImapService = ImapService_1 = class ImapService {
    prisma;
    parserService;
    logger = new common_1.Logger(ImapService_1.name);
    constructor(prisma, parserService) {
        this.prisma = prisma;
        this.parserService = parserService;
    }
    async syncAllActiveConnections() {
        this.logger.log('Starting global IMAP sync for active connections...');
        const connections = await this.prisma.bankConnection.findMany({
            where: { isActive: true },
        });
        for (const connection of connections) {
            if (connection.provider === 'GMAIL') {
                try {
                    await this.syncForConnection(connection);
                }
                catch (error) {
                    this.logger.error(`Failed to sync connection ${connection.id}: ${error.message}`);
                }
            }
        }
        this.logger.log('Finished global IMAP sync.');
    }
    async syncForConnection(connection) {
        this.logger.log(`Syncing connection for email: ${connection.emailAddress}`);
        const config = {
            imap: {
                user: connection.emailAddress,
                password: connection.appPassword,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                authTimeout: 3000,
                tlsOptions: { rejectUnauthorized: false }
            }
        };
        let imapConnection;
        try {
            imapConnection = await imaps.connect(config);
            await imapConnection.openBox('INBOX');
            const searchCriteria = ['UNSEEN', ['FROM', 'notificacionesbaccr.com']];
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT', ''],
                markSeen: true,
                struct: true
            };
            this.logger.log(`Searching IMAP with criteria: ${JSON.stringify(searchCriteria)}`);
            const messages = await imapConnection.search(searchCriteria, fetchOptions);
            this.logger.log(`Found ${messages.length} new messages from BAC Credomatic.`);
            for (const item of messages) {
                const all = item.parts.find((p) => p.which === '');
                if (!all)
                    continue;
                const id = item.attributes.uid;
                const idHeader = 'Imap-Id: ' + id + '\r\n';
                let mail;
                try {
                    mail = await (0, mailparser_1.simpleParser)(idHeader + all.body);
                }
                catch (e) {
                    this.logger.error(`Failed to parse mail ID ${id}:`, e);
                    continue;
                }
                const rawContent = mail.text || mail.html || '';
                this.logger.log(`Parsing email from: ${mail.from?.text || 'unknown'}, Subject: ${mail.subject}`);
                const parsedData = this.parserService.parseBacEmail(rawContent, mail.subject);
                if (parsedData) {
                    const messageId = mail.messageId || String(id);
                    const existing = await this.prisma.inboxTransaction.findFirst({
                        where: { sourceId: messageId, bankConnectionId: connection.id }
                    });
                    if (!existing) {
                        await this.prisma.inboxTransaction.create({
                            data: {
                                bankConnectionId: connection.id,
                                sourceId: messageId,
                                date: parsedData.date,
                                merchant: parsedData.merchant,
                                amount: parsedData.amount,
                                currency: parsedData.currency,
                                accountInfo: parsedData.accountInfo,
                                transactionType: parsedData.transactionType,
                                rawContent: rawContent.substring(0, 2000),
                                status: 'PENDING',
                            }
                        });
                        this.logger.log(`Created new pending transaction for merchant: ${parsedData.merchant}`);
                    }
                }
                else {
                    this.logger.warn(`Could not extract transaction data from email ID ${id}`);
                }
            }
            await this.prisma.bankConnection.update({
                where: { id: connection.id },
                data: { lastSyncAt: new Date() }
            });
        }
        catch (error) {
            this.logger.error(`IMAP sync error for ${connection.emailAddress}:`, error);
            throw error;
        }
        finally {
            if (imapConnection) {
                imapConnection.end();
            }
        }
    }
};
exports.ImapService = ImapService;
exports.ImapService = ImapService = ImapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        parser_service_1.ParserService])
], ImapService);
//# sourceMappingURL=imap.service.js.map