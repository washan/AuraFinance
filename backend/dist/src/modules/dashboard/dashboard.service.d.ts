import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardMetrics(householdId: string, projectId?: string, month?: string): Promise<{
        currencySymbol: string;
        activeSavings: number;
        totalBalance: {
            amount: number;
            trend: number;
            trendUp: boolean;
            trendText: string;
        };
        monthlyIncome: {
            amount: number;
            trend: number;
            trendUp: boolean;
            trendText: string;
        };
        monthlyExpenses: {
            amount: number;
            trend: number;
            trendUp: boolean;
            trendText: string;
        };
        cashFlow: {
            m: string;
            inc: number;
            exp: number;
        }[];
        goalsProgress: any[];
        incomeBreakdown: {
            byCategory: any[];
            byItem: any[];
        };
        expenseBreakdown: {
            byCategory: any[];
            byItem: any[];
        };
    }>;
    getTrendData(householdId: string, categoryId?: string, months?: number): Promise<{
        month: string;
        year: number;
        inc: number;
        exp: number;
    }[]>;
    private calculatePercentageChange;
}
