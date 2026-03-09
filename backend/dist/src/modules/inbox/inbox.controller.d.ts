import { InboxService } from './inbox.service';
import type { Request } from 'express';
export declare class InboxController {
    private readonly inboxService;
    constructor(inboxService: InboxService);
    getPendingTransactions(req: Request): Promise<{
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
    processTransaction(id: string, req: Request): Promise<{
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
    dismissTransaction(id: string, req: Request): Promise<{
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
    syncEmails(req: Request): Promise<{
        success: boolean;
        syncedConnections: number;
    }>;
    getConnections(req: Request): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        provider: string;
        emailAddress: string;
        lastSyncAt: Date | null;
    }[]>;
    createConnection(req: Request): Promise<{
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
    deleteConnection(id: string, req: Request): Promise<{
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
