import { PrismaService } from '../../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(householdId: string, createAssetDto: CreateAssetDto): Promise<{
        id: string;
        name: string;
        category: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        notes: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        householdId: string;
    }>;
    findAll(householdId: string): Promise<{
        id: string;
        name: string;
        category: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        notes: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        householdId: string;
    }[]>;
    findOne(id: string, householdId: string): Promise<{
        id: string;
        name: string;
        category: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        notes: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        householdId: string;
    }>;
    update(id: string, householdId: string, updateAssetDto: UpdateAssetDto): Promise<{
        id: string;
        name: string;
        category: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        notes: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        householdId: string;
    }>;
    remove(id: string, householdId: string): Promise<{
        id: string;
        name: string;
        category: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        notes: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        householdId: string;
    }>;
    hardRemove(id: string, householdId: string): Promise<{
        id: string;
        name: string;
        category: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        notes: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        householdId: string;
    }>;
}
