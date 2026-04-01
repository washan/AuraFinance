export declare class CreateInvestmentTransactionDto {
    accountId: string;
    symbol: string;
    type: string;
    quantity: number;
    price: number;
    commission?: number;
    currency?: string;
    date: string;
    notes?: string;
}
