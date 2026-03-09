import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ImapService } from './services/imap.service';
import { InboxRulesService } from '../inbox-rules/inbox-rules.service';

@Injectable()
export class InboxService {
    constructor(
        private prisma: PrismaService,
        private imapService: ImapService,
        private inboxRulesService: InboxRulesService
    ) { }

    async getPendingTransactions(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { householdId: true }
        });

        if (!user) throw new NotFoundException('User not found');

        // Fetch both email-sourced (via bankConnection) and recurring-sourced transactions
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

        // Enrich each transaction with matched rule
        const enriched = await Promise.all(
            transactions.map(async (tx) => {
                const matchedRule = await this.inboxRulesService.applyRules(user.householdId, tx.merchant);
                return { ...tx, matchedRule };
            })
        );

        return enriched;
    }

    async updateStatus(id: string, userId: string, status: 'PROCESSED' | 'DISMISSED') {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { householdId: true }
        });

        if (!user) throw new NotFoundException('User not found');

        const transaction = await this.prisma.inboxTransaction.findUnique({
            where: { id },
            include: {
                bankConnection: { select: { householdId: true } },
                recurringEvent: { select: { householdId: true } }
            }
        });

        const txHouseholdId = transaction?.bankConnection?.householdId || transaction?.recurringEvent?.householdId;
        if (!transaction || txHouseholdId !== user.householdId) {
            throw new NotFoundException('Inbox transaction not found');
        }

        return this.prisma.inboxTransaction.update({
            where: { id },
            data: { status }
        });
    }

    async syncEmails(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { householdId: true }
        });

        if (!user) throw new NotFoundException('User not found');

        // Manda a llamar el servicio IMAP para las conexiones activas del hogar
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

    async getConnections(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { householdId: true }
        });

        if (!user) throw new NotFoundException('User not found');

        const connections = await this.prisma.bankConnection.findMany({
            where: { householdId: user.householdId },
            select: { id: true, provider: true, emailAddress: true, isActive: true, lastSyncAt: true, createdAt: true }
        });

        return connections;
    }

    async createConnection(userId: string, data: { provider: string, emailAddress: string, appPassword: string }) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { householdId: true }
        });

        if (!user) throw new NotFoundException('User not found');

        return this.prisma.bankConnection.create({
            data: {
                householdId: user.householdId,
                userId: userId,
                provider: data.provider || 'GMAIL',
                emailAddress: data.emailAddress,
                appPassword: data.appPassword, // Plain text for now, could be encrypted
                isActive: true
            }
        });
    }

    async deleteConnection(userId: string, connectionId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { householdId: true }
        });

        if (!user) throw new NotFoundException('User not found');

        const connection = await this.prisma.bankConnection.findUnique({
            where: { id: connectionId }
        });

        if (!connection || connection.householdId !== user.householdId) {
            throw new NotFoundException('Connection not found');
        }

        // Delete associated inbox transactions first
        await this.prisma.inboxTransaction.deleteMany({
            where: { bankConnectionId: connectionId }
        });

        return this.prisma.bankConnection.delete({
            where: { id: connectionId }
        });
    }
}
