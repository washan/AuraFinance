import { PrismaService } from '../../prisma/prisma.service';
export declare class GoalsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(householdId: string): Promise<{
        currentAmount: number;
        id: string;
        householdId: string;
        type: string;
        title: string;
        description: string | null;
        targetAmount: import("@prisma/client/runtime/library").Decimal | null;
        targetDate: Date | null;
        status: string;
    }[]>;
    create(householdId: string, data: {
        title: string;
        description?: string;
        type?: string;
        targetAmount?: number;
        targetDate?: string;
    }): Promise<{
        id: string;
        householdId: string;
        type: string;
        title: string;
        description: string | null;
        targetAmount: import("@prisma/client/runtime/library").Decimal | null;
        targetDate: Date | null;
        status: string;
    }>;
    update(householdId: string, id: string, data: any): Promise<{
        id: string;
        householdId: string;
        type: string;
        title: string;
        description: string | null;
        targetAmount: import("@prisma/client/runtime/library").Decimal | null;
        targetDate: Date | null;
        status: string;
    }>;
    remove(householdId: string, id: string): Promise<{
        id: string;
        householdId: string;
        type: string;
        title: string;
        description: string | null;
        targetAmount: import("@prisma/client/runtime/library").Decimal | null;
        targetDate: Date | null;
        status: string;
    }>;
}
