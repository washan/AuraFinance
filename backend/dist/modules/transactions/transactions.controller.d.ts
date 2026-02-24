import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(req: any, body: {
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
    findAll(req: any, accountId?: string, take?: string, skip?: string): Promise<({
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
}
