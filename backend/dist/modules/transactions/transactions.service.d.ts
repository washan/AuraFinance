import { PrismaService } from '../../prisma/prisma.service';
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(householdId: string, accountId?: string, take?: number, skip?: number): Promise<({
        account: {
            name: string;
            currencyCode: string;
        };
        item: {
            name: string;
            category: {
                name: string;
                icon: string | null;
            };
        } | null;
    } & {
        id: string;
        userId: string;
        accountId: string;
        payeeId: string | null;
        itemId: string | null;
        projectId: string | null;
        amountOriginal: import("@prisma/client/runtime/library").Decimal;
        currencyOriginal: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        amountBase: import("@prisma/client/runtime/library").Decimal;
        transactionDate: Date;
        status: string;
        notes: string | null;
    })[]>;
    create(userId: string, householdId: string, data: {
        accountId: string;
        itemId?: string;
        projectId?: string;
        amountOriginal: string;
        currencyOriginal: string;
        exchangeRate: string;
        amountBase: string;
        transactionDate: string;
        notes?: string;
    }): Promise<{
        account: {
            name: string;
            currencyCode: string;
        };
        item: {
            name: string;
            category: {
                name: string;
                icon: string | null;
            };
        } | null;
    } & {
        id: string;
        userId: string;
        accountId: string;
        payeeId: string | null;
        itemId: string | null;
        projectId: string | null;
        amountOriginal: import("@prisma/client/runtime/library").Decimal;
        currencyOriginal: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        amountBase: import("@prisma/client/runtime/library").Decimal;
        transactionDate: Date;
        status: string;
        notes: string | null;
    }>;
}
