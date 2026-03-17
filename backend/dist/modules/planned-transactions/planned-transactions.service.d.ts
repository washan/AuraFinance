import { PrismaService } from '../../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
export declare class PlannedTransactionsService {
    private prisma;
    private transactionsService;
    constructor(prisma: PrismaService, transactionsService: TransactionsService);
    create(userId: string, householdId: string, data: any): Promise<{
        project: {
            name: string;
            id: string;
            householdId: string;
            description: string | null;
        } | null;
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
    } & {
        currency: string;
        id: string;
        type: string;
        accountId: string | null;
        userId: string;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        status: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string | null;
        createdAt: Date;
        updatedAt: Date;
        plannedDate: Date;
    }>;
    findAll(userId: string, householdId: string, month?: string, status?: string): Promise<({
        account: {
            name: string;
            id: string;
            currencyCode: string;
        } | null;
        project: {
            name: string;
            id: string;
        } | null;
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
    } & {
        currency: string;
        id: string;
        type: string;
        accountId: string | null;
        userId: string;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        status: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string | null;
        createdAt: Date;
        updatedAt: Date;
        plannedDate: Date;
    })[]>;
    update(userId: string, householdId: string, plannedTransactionId: string, data: any): Promise<{
        project: {
            name: string;
            id: string;
            householdId: string;
            description: string | null;
        } | null;
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
    } & {
        currency: string;
        id: string;
        type: string;
        accountId: string | null;
        userId: string;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        status: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string | null;
        createdAt: Date;
        updatedAt: Date;
        plannedDate: Date;
    }>;
    remove(householdId: string, plannedTransactionId: string): Promise<{
        currency: string;
        id: string;
        type: string;
        accountId: string | null;
        userId: string;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        status: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string | null;
        createdAt: Date;
        updatedAt: Date;
        plannedDate: Date;
    }>;
    realize(userId: string, householdId: string, plannedTransactionId: string, realizeData: any): Promise<{
        plannedTransaction: {
            currency: string;
            id: string;
            type: string;
            accountId: string | null;
            userId: string;
            itemId: string | null;
            projectId: string | null;
            goalId: string | null;
            status: string;
            notes: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            transactionId: string | null;
            createdAt: Date;
            updatedAt: Date;
            plannedDate: Date;
        };
        transaction: {
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
        };
    }>;
}
