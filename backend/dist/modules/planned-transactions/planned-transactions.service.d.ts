import { PrismaService } from '../../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
export declare class PlannedTransactionsService {
    private prisma;
    private transactionsService;
    constructor(prisma: PrismaService, transactionsService: TransactionsService);
    create(userId: string, householdId: string, data: any): Promise<{
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
        project: {
            id: string;
            householdId: string;
            name: string;
            description: string | null;
        } | null;
    } & {
        id: string;
        userId: string;
        accountId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        type: string;
        status: string;
        notes: string | null;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string | null;
        createdAt: Date;
        updatedAt: Date;
        plannedDate: Date;
    }>;
    findAll(userId: string, householdId: string, month?: string, status?: string): Promise<({
        account: {
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
        project: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        userId: string;
        accountId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        type: string;
        status: string;
        notes: string | null;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string | null;
        createdAt: Date;
        updatedAt: Date;
        plannedDate: Date;
    })[]>;
    update(userId: string, householdId: string, plannedTransactionId: string, data: any): Promise<{
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
        project: {
            id: string;
            householdId: string;
            name: string;
            description: string | null;
        } | null;
    } & {
        id: string;
        userId: string;
        accountId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        type: string;
        status: string;
        notes: string | null;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string | null;
        createdAt: Date;
        updatedAt: Date;
        plannedDate: Date;
    }>;
    remove(householdId: string, plannedTransactionId: string): Promise<{
        id: string;
        userId: string;
        accountId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        type: string;
        status: string;
        notes: string | null;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string | null;
        createdAt: Date;
        updatedAt: Date;
        plannedDate: Date;
    }>;
    realize(userId: string, householdId: string, plannedTransactionId: string, realizeData: any): Promise<{
        plannedTransaction: {
            id: string;
            userId: string;
            accountId: string | null;
            itemId: string | null;
            projectId: string | null;
            goalId: string | null;
            type: string;
            status: string;
            notes: string | null;
            currency: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            transactionId: string | null;
            createdAt: Date;
            updatedAt: Date;
            plannedDate: Date;
        };
        transaction: {
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
        };
    }>;
}
