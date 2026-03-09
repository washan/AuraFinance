import { PrismaService } from '../../prisma/prisma.service';
export declare class ParametersService {
    private prisma;
    constructor(prisma: PrismaService);
    getParameter(userId: string, code: string): Promise<{
        code: string;
        userId: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        value: string;
    }>;
    upsertParameter(userId: string, code: string, value: string, description?: string): Promise<{
        code: string;
        userId: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        value: string;
    }>;
    getAllParameters(userId: string): Promise<{
        code: string;
        userId: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        value: string;
    }[]>;
}
