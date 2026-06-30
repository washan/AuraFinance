import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
export declare class BudgetsController {
    private readonly budgetsService;
    constructor(budgetsService: BudgetsService);
    getBudgetSummary(req: any, period: string): Promise<{
        itemId: any;
        itemName: any;
        categoryName: any;
        baseAmount: number;
        extraAmount: number;
        formulated: number;
        consumed: number;
        status: string;
        currency: string;
    }[]>;
    upsertBudget(req: any, createBudgetDto: CreateBudgetDto): Promise<{
        id: string;
        householdId: string;
        itemId: string;
        limitAmount: import("@prisma/client/runtime/library").Decimal;
        isBase: boolean;
        period: string | null;
        currency: string;
    }>;
}
