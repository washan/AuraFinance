import { PrismaService } from '../../prisma/prisma.service';
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(householdId: string, accountId?: string, projectId?: string, month?: string, take?: number, skip?: number): Promise<({
        account: {
            name: string;
            id: string;
            currencyCode: string;
        };
        item: {
            category: {
                name: string;
                id: string;
                icon: string | null;
            };
            name: string;
            id: string;
            categoryId: string;
        } | null;
        goal: {
            id: string;
            title: string;
        } | null;
        destinationAccount: {
            name: string;
            id: string;
            currencyCode: string;
        } | null;
    } & {
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        id: string;
        type: string;
        accountId: string;
        userId: string;
        destinationAccountId: string | null;
        payeeId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        amountOriginal: import("@prisma/client/runtime/library").Decimal;
        currencyOriginal: string;
        amountBase: import("@prisma/client/runtime/library").Decimal;
        transactionDate: Date;
        status: string;
        notes: string | null;
    })[]>;
    create(userId: string, householdId: string, data: {
        accountId: string;
        destinationAccountId?: string;
        goalId?: string;
        type?: string;
        itemId?: string;
        projectId?: string;
        amountOriginal: string;
        currencyOriginal: string;
        exchangeRate: string;
        amountBase: string;
        transactionDate: string;
        notes?: string;
        inboxTransactionId?: string;
    }): Promise<{
        account: {
            name: string;
            id: string;
            householdId: string;
            type: string;
            currencyCode: string;
            balance: import("@prisma/client/runtime/library").Decimal;
        };
        item: ({
            category: {
                name: string;
                id: string;
                householdId: string;
                type: string;
                icon: string | null;
            };
        } & {
            name: string;
            id: string;
            categoryId: string;
        }) | null;
        goal: {
            id: string;
            householdId: string;
            type: string;
            status: string;
            title: string;
            description: string | null;
            targetAmount: import("@prisma/client/runtime/library").Decimal | null;
            targetDate: Date | null;
        } | null;
        destinationAccount: {
            name: string;
            id: string;
            householdId: string;
            type: string;
            currencyCode: string;
            balance: import("@prisma/client/runtime/library").Decimal;
        } | null;
    } & {
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        id: string;
        type: string;
        accountId: string;
        userId: string;
        destinationAccountId: string | null;
        payeeId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        amountOriginal: import("@prisma/client/runtime/library").Decimal;
        currencyOriginal: string;
        amountBase: import("@prisma/client/runtime/library").Decimal;
        transactionDate: Date;
        status: string;
        notes: string | null;
    }>;
    update(userId: string, householdId: string, transactionId: string, data: {
        accountId: string;
        destinationAccountId?: string;
        goalId?: string;
        type?: string;
        itemId?: string;
        projectId?: string;
        amountOriginal: string;
        currencyOriginal: string;
        exchangeRate: string;
        amountBase: string;
        transactionDate: string;
        notes?: string;
    }): Promise<{
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        id: string;
        type: string;
        accountId: string;
        userId: string;
        destinationAccountId: string | null;
        payeeId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        amountOriginal: import("@prisma/client/runtime/library").Decimal;
        currencyOriginal: string;
        amountBase: import("@prisma/client/runtime/library").Decimal;
        transactionDate: Date;
        status: string;
        notes: string | null;
    }>;
    remove(householdId: string, transactionId: string): Promise<{
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        id: string;
        type: string;
        accountId: string;
        userId: string;
        destinationAccountId: string | null;
        payeeId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        amountOriginal: import("@prisma/client/runtime/library").Decimal;
        currencyOriginal: string;
        amountBase: import("@prisma/client/runtime/library").Decimal;
        transactionDate: Date;
        status: string;
        notes: string | null;
    }>;
}
