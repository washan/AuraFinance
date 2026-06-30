import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
export declare class BudgetsService {
    private prisma;
    constructor(prisma: PrismaService);
    upsertBudget(householdId: string, dto: CreateBudgetDto): Promise<{
        id: string;
        householdId: string;
        itemId: string;
        limitAmount: import("@prisma/client/runtime/library").Decimal;
        isBase: boolean;
        period: string | null;
        currency: string;
    }>;
    getBudgetSummary(householdId: string, period: string): Promise<{
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
}
