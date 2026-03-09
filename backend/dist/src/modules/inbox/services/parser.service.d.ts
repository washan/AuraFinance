interface ParsedTransaction {
    date: Date;
    merchant: string;
    amount: number;
    currency: string;
    accountInfo: string;
    transactionType: string;
}
export declare class ParserService {
    private readonly logger;
    parseBacEmail(rawContent: string, subject?: string): ParsedTransaction | null;
}
export {};
