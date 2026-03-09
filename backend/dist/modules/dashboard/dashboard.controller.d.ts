import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(req: any, projectId?: string, month?: string): Promise<{
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
    getTrend(req: any, categoryId?: string, months?: string): Promise<{
        month: string;
        year: number;
        inc: number;
        exp: number;
    }[]>;
}
