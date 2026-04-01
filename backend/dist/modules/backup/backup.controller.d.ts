import { BackupService } from './backup.service';
export declare class BackupController {
    private readonly backupService;
    constructor(backupService: BackupService);
    exportData(req: any): Promise<{
        backupDate: string;
        version: string;
        data: {
            user: {
                name: string;
                id: string;
                householdId: string;
                email: string;
                role: string;
                passwordHash: string;
                isBlocked: boolean;
            } | null;
            currencies: {
                symbol: string;
                householdId: string;
                code: string;
                isLocalBase: boolean;
                isActive: boolean;
            }[];
            categories: ({
                items: {
                    name: string;
                    id: string;
                    categoryId: string;
                }[];
            } & {
                name: string;
                id: string;
                householdId: string;
                type: string;
                icon: string | null;
            })[];
            accounts: {
                name: string;
                id: string;
                householdId: string;
                type: string;
                currencyCode: string;
                balance: import("@prisma/client/runtime/library").Decimal;
            }[];
            projects: {
                name: string;
                id: string;
                householdId: string;
                description: string | null;
            }[];
            goals: ({
                tasks: {
                    id: string;
                    goalId: string;
                    description: string;
                    isCompleted: boolean;
                }[];
            } & {
                id: string;
                householdId: string;
                type: string;
                status: string;
                title: string;
                description: string | null;
                targetAmount: import("@prisma/client/runtime/library").Decimal | null;
                targetDate: Date | null;
            })[];
            budgets: {
                id: string;
                householdId: string;
                categoryId: string;
                limitAmount: import("@prisma/client/runtime/library").Decimal;
                period: string;
            }[];
            inboxRules: {
                name: string;
                id: string;
                householdId: string;
                accountId: string | null;
                itemId: string | null;
                projectId: string | null;
                goalId: string | null;
                createdAt: Date;
                matchValue: string;
                matchType: string;
            }[];
            recurringEvents: {
                currency: string;
                name: string;
                id: string;
                householdId: string;
                isActive: boolean;
                merchant: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                accountInfo: string | null;
                createdAt: Date;
                frequency: string;
                dayOfMonth: number | null;
                dayOfMonth2: number | null;
                dayOfWeek: number | null;
                monthOfYear: number | null;
                lastGeneratedAt: Date | null;
            }[];
            parameters: {
                code: string;
                userId: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                value: string;
            }[];
            transactions: {
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
            }[];
            plannedTransactions: {
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
            }[];
            assets: {
                currency: string;
                category: string | null;
                name: string;
                id: string;
                householdId: string;
                isActive: boolean;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
            }[];
            instruments: {
                symbol: string;
                currency: string;
                name: string;
                id: string;
                householdId: string;
                type: string;
            }[];
            investmentTransactions: {
                currency: string;
                id: string;
                type: string;
                accountId: string;
                notes: string | null;
                date: Date;
                createdAt: Date;
                updatedAt: Date;
                quantity: import("@prisma/client/runtime/library").Decimal;
                instrumentId: string;
                price: import("@prisma/client/runtime/library").Decimal;
                commission: import("@prisma/client/runtime/library").Decimal;
            }[];
        };
    }>;
    importData(req: any, file: Express.Multer.File): Promise<{
        message: string;
    }>;
}
