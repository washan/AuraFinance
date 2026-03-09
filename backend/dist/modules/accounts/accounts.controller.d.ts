import { AccountsService } from './accounts.service';
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    create(req: any, body: {
        name: string;
        type: string;
        currencyCode: string;
        balance: number;
    }): Promise<{
        currency: {
            symbol: string;
            householdId: string;
            code: string;
            isLocalBase: boolean;
            isActive: boolean;
        };
    } & {
        name: string;
        id: string;
        householdId: string;
        type: string;
        currencyCode: string;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(req: any): Promise<({
        currency: {
            symbol: string;
            householdId: string;
            code: string;
            isLocalBase: boolean;
            isActive: boolean;
        };
    } & {
        name: string;
        id: string;
        householdId: string;
        type: string;
        currencyCode: string;
        balance: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    update(req: any, id: string, body: {
        name?: string;
        type?: string;
        currencyCode?: string;
        balance?: number;
    }): Promise<{
        currency: {
            symbol: string;
            householdId: string;
            code: string;
            isLocalBase: boolean;
            isActive: boolean;
        };
    } & {
        name: string;
        id: string;
        householdId: string;
        type: string;
        currencyCode: string;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(req: any, id: string): Promise<{
        name: string;
        id: string;
        householdId: string;
        type: string;
        currencyCode: string;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
}
