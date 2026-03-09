import { PrismaService } from '../../prisma/prisma.service';
import { ImapService } from './services/imap.service';
import { InboxRulesService } from '../inbox-rules/inbox-rules.service';
export declare class InboxService {
    private prisma;
    private imapService;
    private inboxRulesService;
    constructor(prisma: PrismaService, imapService: ImapService, inboxRulesService: InboxRulesService);
    getPendingTransactions(userId: string): Promise<{
        matchedRule: {
            name: string;
            accountId: string | null;
            itemId: string | null;
            projectId: string | null;
            goalId: string | null;
        } | null;
        id: string;
        currency: string;
        status: string;
        bankConnectionId: string | null;
        recurringEventId: string | null;
        source: string;
        sourceId: string | null;
        date: Date;
        merchant: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        accountInfo: string | null;
        transactionType: string | null;
        rawContent: string | null;
        transactionId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    updateStatus(id: string, userId: string, status: 'PROCESSED' | 'DISMISSED'): Promise<{
        id: string;
        currency: string;
        status: string;
        bankConnectionId: string | null;
        recurringEventId: string | null;
        source: string;
        sourceId: string | null;
        date: Date;
        merchant: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        accountInfo: string | null;
        transactionType: string | null;
        rawContent: string | null;
        transactionId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    syncEmails(userId: string): Promise<{
        success: boolean;
        syncedConnections: number;
    }>;
    getConnections(userId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        provider: string;
        emailAddress: string;
        lastSyncAt: Date | null;
    }[]>;
    createConnection(userId: string, data: {
        provider: string;
        emailAddress: string;
        appPassword: string;
    }): Promise<{
        id: string;
        householdId: string;
        userId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        provider: string;
        emailAddress: string;
        appPassword: string;
        lastSyncAt: Date | null;
    }>;
    deleteConnection(userId: string, connectionId: string): Promise<{
        id: string;
        householdId: string;
        userId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        provider: string;
        emailAddress: string;
        appPassword: string;
        lastSyncAt: Date | null;
    }>;
}
