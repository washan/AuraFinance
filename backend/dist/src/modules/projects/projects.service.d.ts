import { PrismaService } from '../../prisma/prisma.service';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(householdId: string): Promise<{
        id: string;
        name: string;
        householdId: string;
        description: string | null;
    }[]>;
    create(householdId: string, data: {
        name: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        householdId: string;
        description: string | null;
    }>;
    update(householdId: string, id: string, data: {
        name?: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        householdId: string;
        description: string | null;
    }>;
    remove(householdId: string, id: string): Promise<{
        id: string;
        name: string;
        householdId: string;
        description: string | null;
    }>;
}
