import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    create(req: any, createAssetDto: CreateAssetDto): Promise<{
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
    findAll(req: any): Promise<{
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
    findOne(req: any, id: string): Promise<{
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
    update(req: any, id: string, updateAssetDto: UpdateAssetDto): Promise<{
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
    remove(req: any, id: string): Promise<{
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
