import { CurrenciesService } from './currencies.service';
export declare class CurrenciesController {
    private readonly currenciesService;
    constructor(currenciesService: CurrenciesService);
    create(req: any, createCurrencyDto: {
        code: string;
        isLocalBase?: boolean;
        isActive?: boolean;
        symbol?: string;
    }): Promise<{
        symbol: string;
        householdId: string;
        code: string;
        isLocalBase: boolean;
        isActive: boolean;
    }>;
    findAll(req: any): Promise<{
        symbol: string;
        householdId: string;
        code: string;
        isLocalBase: boolean;
        isActive: boolean;
    }[]>;
    update(req: any, code: string, updateCurrencyDto: {
        isLocalBase?: boolean;
        isActive?: boolean;
        symbol?: string;
    }): Promise<{
        symbol: string;
        householdId: string;
        code: string;
        isLocalBase: boolean;
        isActive: boolean;
    }>;
    remove(req: any, code: string): Promise<{
        symbol: string;
        householdId: string;
        code: string;
        isLocalBase: boolean;
        isActive: boolean;
    }>;
}
