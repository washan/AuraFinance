import { PrismaService } from '../../prisma/prisma.service';
export declare class CurrenciesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(householdId: string): Promise<{
        householdId: string;
        code: string;
        isLocalBase: boolean;
        isActive: boolean;
    }[]>;
    create(householdId: string, data: {
        code: string;
        isLocalBase?: boolean;
        isActive?: boolean;
    }): Promise<{
        householdId: string;
        code: string;
        isLocalBase: boolean;
        isActive: boolean;
    }>;
    update(householdId: string, code: string, data: {
        isLocalBase?: boolean;
        isActive?: boolean;
    }): Promise<{
        householdId: string;
        code: string;
        isLocalBase: boolean;
        isActive: boolean;
    }>;
    remove(householdId: string, code: string): Promise<{
        householdId: string;
        code: string;
        isLocalBase: boolean;
        isActive: boolean;
    }>;
}
