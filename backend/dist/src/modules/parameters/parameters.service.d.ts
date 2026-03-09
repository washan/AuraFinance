import { PrismaService } from '../../prisma/prisma.service';
export declare class ParametersService {
    private prisma;
    constructor(prisma: PrismaService);
    getParameter(userId: string, code: string): Promise<{
        description: string | null;
        userId: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
    }>;
    upsertParameter(userId: string, code: string, value: string, description?: string): Promise<{
        description: string | null;
        userId: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
    }>;
    getAllParameters(userId: string): Promise<{
        description: string | null;
        userId: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
    }[]>;
}
