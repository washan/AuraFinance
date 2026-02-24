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
    findAll(req: any): Promise<({
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
    update(req: any, id: string, body: {
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
    remove(req: any, id: string): Promise<{
        id: string;
        householdId: string;
        name: string;
        type: string;
        currencyCode: string;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
}
