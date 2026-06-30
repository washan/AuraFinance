import { PrismaService } from '../../prisma/prisma.service';
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(householdId: string, accountId?: string, projectId?: string, month?: string, goalId?: string, itemId?: string, take?: number, skip?: number): Promise<({
        account: {
            id: string;
            name: string;
            currencyCode: string;
        };
        destinationAccount: {
            id: string;
            name: string;
            currencyCode: string;
        } | null;
        goal: {
            id: string;
            title: string;
        } | null;
        item: {
            id: string;
            name: string;
            categoryId: string;
            category: {
                id: string;
                name: string;
                icon: string | null;
            };
        } | null;
    } & {
        id: string;
        userId: string;
        accountId: string;
        destinationAccountId: string | null;
        payeeId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        type: string;
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
            id: string;
            type: string;
            householdId: string;
            name: string;
            currencyCode: string;
            balance: import("@prisma/client/runtime/library").Decimal;
        };
        destinationAccount: {
            id: string;
            type: string;
            householdId: string;
            name: string;
            currencyCode: string;
            balance: import("@prisma/client/runtime/library").Decimal;
        } | null;
        goal: {
            id: string;
            type: string;
            status: string;
            householdId: string;
            title: string;
            description: string | null;
            targetAmount: import("@prisma/client/runtime/library").Decimal | null;
            targetDate: Date | null;
        } | null;
        item: ({
            category: {
                id: string;
                type: string;
                householdId: string;
                name: string;
                icon: string | null;
            };
        } & {
            id: string;
            name: string;
            categoryId: string;
        }) | null;
    } & {
        id: string;
        userId: string;
        accountId: string;
        destinationAccountId: string | null;
        payeeId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        type: string;
        amountOriginal: import("@prisma/client/runtime/library").Decimal;
        currencyOriginal: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
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
        id: string;
        userId: string;
        accountId: string;
        destinationAccountId: string | null;
        payeeId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        type: string;
        amountOriginal: import("@prisma/client/runtime/library").Decimal;
        currencyOriginal: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        amountBase: import("@prisma/client/runtime/library").Decimal;
        transactionDate: Date;
        status: string;
        notes: string | null;
    }>;
    remove(householdId: string, transactionId: string): Promise<{
        id: string;
        userId: string;
        accountId: string;
        destinationAccountId: string | null;
        payeeId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        type: string;
        amountOriginal: import("@prisma/client/runtime/library").Decimal;
        currencyOriginal: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        amountBase: import("@prisma/client/runtime/library").Decimal;
        transactionDate: Date;
        status: string;
        notes: string | null;
    }>;
}
