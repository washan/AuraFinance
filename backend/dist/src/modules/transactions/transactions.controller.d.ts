import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(req: any, body: any): Promise<{
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
    findAll(req: any, accountId?: string, projectId?: string, month?: string, take?: string, skip?: string): Promise<({
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
    update(req: any, id: string, body: any): Promise<{
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
    remove(req: any, id: string): Promise<{
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
