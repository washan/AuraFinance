import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    create(req: any, createAssetDto: CreateAssetDto): Promise<{
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
    findAll(req: any): Promise<{
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
    findOne(req: any, id: string): Promise<{
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
    update(req: any, id: string, updateAssetDto: UpdateAssetDto): Promise<{
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
    remove(req: any, id: string): Promise<{
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
