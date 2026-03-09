import { PrismaService } from '../../prisma/prisma.service';
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(householdId: string, accountId?: string, projectId?: string, month?: string, take?: number, skip?: number): Promise<({
        account: {
            id: string;
            name: string;
            currencyCode: string;
        };
        goal: {
            id: string;
            title: string;
        } | null;
        destinationAccount: {
            id: string;
            name: string;
            currencyCode: string;
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
        type: string;
        status: string;
        userId: string;
        accountId: string;
        destinationAccountId: string | null;
        payeeId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        amountOriginal: import("@prisma/client/runtime/library").Decimal;
        currencyOriginal: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        amountBase: import("@prisma/client/runtime/library").Decimal;
        transactionDate: Date;
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
            name: string;
            householdId: string;
            type: string;
            currencyCode: string;
            balance: import("@prisma/client/runtime/library").Decimal;
        };
        goal: {
            id: string;
            householdId: string;
            type: string;
            title: string;
            description: string | null;
            targetAmount: import("@prisma/client/runtime/library").Decimal | null;
            targetDate: Date | null;
            status: string;
        } | null;
        destinationAccount: {
            id: string;
            name: string;
            householdId: string;
            type: string;
            currencyCode: string;
            balance: import("@prisma/client/runtime/library").Decimal;
        } | null;
        item: ({
            category: {
                id: string;
                name: string;
                householdId: string;
                type: string;
                icon: string | null;
            };
        } & {
            id: string;
            name: string;
            categoryId: string;
        }) | null;
    } & {
        id: string;
        type: string;
        status: string;
        userId: string;
        accountId: string;
        destinationAccountId: string | null;
        payeeId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        amountOriginal: import("@prisma/client/runtime/library").Decimal;
        currencyOriginal: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        amountBase: import("@prisma/client/runtime/library").Decimal;
        transactionDate: Date;
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
        type: string;
        status: string;
        userId: string;
        accountId: string;
        destinationAccountId: string | null;
        payeeId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        amountOriginal: import("@prisma/client/runtime/library").Decimal;
        currencyOriginal: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        amountBase: import("@prisma/client/runtime/library").Decimal;
        transactionDate: Date;
        notes: string | null;
    }>;
    remove(householdId: string, transactionId: string): Promise<{
        id: string;
        type: string;
        status: string;
        userId: string;
        accountId: string;
        destinationAccountId: string | null;
        payeeId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        amountOriginal: import("@prisma/client/runtime/library").Decimal;
        currencyOriginal: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        amountBase: import("@prisma/client/runtime/library").Decimal;
        transactionDate: Date;
        notes: string | null;
    }>;
}
