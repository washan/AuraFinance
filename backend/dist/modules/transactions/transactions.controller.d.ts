import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(req: any, body: any): Promise<{
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
    findAll(req: any, accountId?: string, projectId?: string, month?: string, take?: string, skip?: string): Promise<({
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
    update(req: any, id: string, body: any): Promise<{
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
    remove(req: any, id: string): Promise<{
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
