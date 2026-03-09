import { GoalsService } from './goals.service';
export declare class GoalsController {
    private readonly goalsService;
    constructor(goalsService: GoalsService);
    findAll(req: any): Promise<{
        currentAmount: number;
        id: string;
        householdId: string;
        type: string;
        status: string;
        title: string;
        description: string | null;
        targetAmount: import("@prisma/client/runtime/library").Decimal | null;
        targetDate: Date | null;
    }[]>;
    create(req: any, data: {
        title: string;
        description?: string;
        targetAmount?: number;
        targetDate?: string;
    }): Promise<{
        id: string;
        householdId: string;
        type: string;
        status: string;
        title: string;
        description: string | null;
        targetAmount: import("@prisma/client/runtime/library").Decimal | null;
        targetDate: Date | null;
    }>;
    update(req: any, id: string, data: any): Promise<{
        id: string;
        householdId: string;
        type: string;
        status: string;
        title: string;
        description: string | null;
        targetAmount: import("@prisma/client/runtime/library").Decimal | null;
        targetDate: Date | null;
    }>;
    remove(req: any, id: string): Promise<{
        id: string;
        householdId: string;
        type: string;
        status: string;
        title: string;
        description: string | null;
        targetAmount: import("@prisma/client/runtime/library").Decimal | null;
        targetDate: Date | null;
    }>;
}
