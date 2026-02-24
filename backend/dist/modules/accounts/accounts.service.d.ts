import { PrismaService } from '../../prisma/prisma.service';
export declare class AccountsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(householdId: string): Promise<({
        currency: {
            householdId: string;
            code: string;
            isLocalBase: boolean;
            isActive: boolean;
        };
    } & {
        id: string;
        householdId: string;
        name: string;
        type: string;
        currencyCode: string;
        balance: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    create(householdId: string, data: {
        name: string;
        type: string;
        currencyCode: string;
        balance: number;
    }): Promise<{
        currency: {
            householdId: string;
            code: string;
            isLocalBase: boolean;
            isActive: boolean;
        };
    } & {
        id: string;
        householdId: string;
        name: string;
        type: string;
        currencyCode: string;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(householdId: string, id: string, data: {
        name?: string;
        type?: string;
        currencyCode?: string;
        balance?: number;
    }): Promise<{
        currency: {
            householdId: string;
            code: string;
            isLocalBase: boolean;
            isActive: boolean;
        };
    } & {
        id: string;
        householdId: string;
        name: string;
        type: string;
        currencyCode: string;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(householdId: string, id: string): Promise<{
        id: string;
        householdId: string;
        name: string;
        type: string;
        currencyCode: string;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
}
