"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboxService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const imap_service_1 = require("./services/imap.service");
const inbox_rules_service_1 = require("../inbox-rules/inbox-rules.service");
let InboxService = class InboxService {
    prisma;
    imapService;
    inboxRulesService;
    constructor(prisma, imapService, inboxRulesService) {
        this.prisma = prisma;
        this.imapService = imapService;
        this.inboxRulesService = inboxRulesService;
    }
    async getPendingTransactions(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { householdId: true }
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const transactions = await this.prisma.inboxTransaction.findMany({
            where: {
                status: 'PENDING',
                OR: [
                    { bankConnection: { householdId: user.householdId } },
                    { source: 'RECURRING', recurringEvent: { householdId: user.householdId } }
                ]
            },
            orderBy: { date: 'desc' }
        });
        const enriched = await Promise.all(transactions.map(async (tx) => {
            const matchedRule = await this.inboxRulesService.applyRules(user.householdId, tx.merchant);
            return { ...tx, matchedRule };
        }));
        return enriched;
    }
    async updateStatus(id, userId, status) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { householdId: true }
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const transaction = await this.prisma.inboxTransaction.findUnique({
            where: { id },
            include: {
                bankConnection: { select: { householdId: true } },
                recurringEvent: { select: { householdId: true } }
            }
        });
        const txHouseholdId = transaction?.bankConnection?.householdId || transaction?.recurringEvent?.householdId;
        if (!transaction || txHouseholdId !== user.householdId) {
            throw new common_1.NotFoundException('Inbox transaction not found');
        }
        return this.prisma.inboxTransaction.update({
            where: { id },
            data: { status }
        });
    }
    async syncEmails(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { householdId: true }
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const connections = await this.prisma.bankConnection.findMany({
            where: { householdId: user.householdId, isActive: true },
        });
        let syncPromises = [];
        for (const connection of connections) {
            if (connection.provider === 'GMAIL') {
                syncPromises.push(this.imapService.syncForConnection(connection));
            }
        }
        await Promise.allSettled(syncPromises);
        return { success: true, syncedConnections: connections.length };
    }
    async getConnections(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { householdId: true }
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const connections = await this.prisma.bankConnection.findMany({
            where: { householdId: user.householdId },
            select: { id: true, provider: true, emailAddress: true, isActive: true, lastSyncAt: true, createdAt: true }
        });
        return connections;
    }
    async createConnection(userId, data) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { householdId: true }
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.prisma.bankConnection.create({
            data: {
                householdId: user.householdId,
                userId: userId,
                provider: data.provider || 'GMAIL',
                emailAddress: data.emailAddress,
                appPassword: data.appPassword,
                isActive: true
            }
        });
    }
    async deleteConnection(userId, connectionId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { householdId: true }
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const connection = await this.prisma.bankConnection.findUnique({
            where: { id: connectionId }
        });
        if (!connection || connection.householdId !== user.householdId) {
            throw new common_1.NotFoundException('Connection not found');
        }
        await this.prisma.inboxTransaction.deleteMany({
            where: { bankConnectionId: connectionId }
        });
        return this.prisma.bankConnection.delete({
            where: { id: connectionId }
        });
    }
};
exports.InboxService = InboxService;
exports.InboxService = InboxService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        imap_service_1.ImapService,
        inbox_rules_service_1.InboxRulesService])
], InboxService);
//# sourceMappingURL=inbox.service.js.map