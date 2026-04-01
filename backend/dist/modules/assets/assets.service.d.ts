import { PrismaService } from '../../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(householdId: string, createAssetDto: CreateAssetDto): Promise<{
        currency: string;
        category: string | null;
        name: string;
        id: string;
        householdId: string;
        isActive: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(householdId: string): Promise<{
        currency: string;
        category: string | null;
        name: string;
        id: string;
        householdId: string;
        isActive: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    findOne(id: string, householdId: string): Promise<{
        currency: string;
        category: string | null;
        name: string;
        id: string;
        householdId: string;
        isActive: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, householdId: string, updateAssetDto: UpdateAssetDto): Promise<{
        currency: string;
        category: string | null;
        name: string;
        id: string;
        householdId: string;
        isActive: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: string, householdId: string): Promise<{
        currency: string;
        category: string | null;
        name: string;
        id: string;
        householdId: string;
        isActive: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    hardRemove(id: string, householdId: string): Promise<{
        currency: string;
        category: string | null;
        name: string;
        id: string;
        householdId: string;
        isActive: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
    }>;
}
