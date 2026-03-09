import { PrismaService } from '../../prisma/prisma.service';
export declare class BackupService {
    private prisma;
    constructor(prisma: PrismaService);
    exportData(userId: string, householdId: string): Promise<{
        backupDate: string;
        version: string;
        data: {
            user: {
                id: string;
                name: string;
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
                    id: string;
                    name: string;
                    categoryId: string;
                }[];
            } & {
                id: string;
                name: string;
                householdId: string;
                type: string;
                icon: string | null;
            })[];
            accounts: {
                id: string;
                name: string;
                householdId: string;
                type: string;
                currencyCode: string;
                balance: import("@prisma/client/runtime/library").Decimal;
            }[];
            projects: {
                id: string;
                name: string;
                householdId: string;
                description: string | null;
            }[];
            goals: ({
                tasks: {
                    id: string;
                    description: string;
                    goalId: string;
                    isCompleted: boolean;
                }[];
            } & {
                id: string;
                householdId: string;
                type: string;
                title: string;
                description: string | null;
                targetAmount: import("@prisma/client/runtime/library").Decimal | null;
                targetDate: Date | null;
                status: string;
            })[];
            budgets: {
                id: string;
                householdId: string;
                categoryId: string;
                limitAmount: import("@prisma/client/runtime/library").Decimal;
                period: string;
            }[];
            inboxRules: {
                id: string;
                name: string;
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
                id: string;
                name: string;
                householdId: string;
                currency: string;
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
                description: string | null;
                userId: string;
                code: string;
                createdAt: Date;
                updatedAt: Date;
                value: string;
            }[];
            transactions: {
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
            }[];
        };
    }>;
    importData(userId: string, householdId: string, backupData: any): Promise<{
        message: string;
    }>;
}
