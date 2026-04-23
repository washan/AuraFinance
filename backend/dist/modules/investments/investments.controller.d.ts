import { InvestmentsService } from './investments.service';
import { CreateInvestmentTransactionDto } from './dto/create-investment.dto';
import { UpdateInvestmentTransactionDto } from './dto/update-investment.dto';
export declare class InvestmentsController {
    private readonly investmentsService;
    constructor(investmentsService: InvestmentsService);
    getPortfolio(req: any): Promise<{
        totalMarketValue: number;
        totalInvested: number;
        totalUnrealizedPl: number;
        positions: {
            instrumentId: string;
            symbol: string;
            name: string;
            position: number;
            avgPrice: number;
            costBasis: number;
            currentPrice: number;
            marketValue: number;
            unrealizedPl: number;
            unrealizedPlPct: number;
            totalCommissions: number;
        }[];
    }>;
    createTransaction(req: any, dto: CreateInvestmentTransactionDto): Promise<{
        currency: string;
        id: string;
        type: string;
        accountId: string;
        notes: string | null;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client/runtime/library").Decimal;
        instrumentId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        commission: import("@prisma/client/runtime/library").Decimal;
    }>;
    getHistory(req: any): Promise<{
        date: Date;
        invested: number;
        marketValue: number;
        monthLabel: string;
    }[]>;
    getAiInsights(req: any): Promise<{
        analysis: string | undefined;
    }>;
    getTransactions(req: any): Promise<({
        account: {
            name: string;
            id: string;
        };
        instrument: {
            symbol: string;
            currency: string;
            name: string;
            id: string;
            householdId: string;
            type: string;
        };
    } & {
        currency: string;
        id: string;
        type: string;
        accountId: string;
        notes: string | null;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client/runtime/library").Decimal;
        instrumentId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        commission: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    updateTransaction(req: any, id: string, dto: UpdateInvestmentTransactionDto): Promise<{
        currency: string;
        id: string;
        type: string;
        accountId: string;
        notes: string | null;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client/runtime/library").Decimal;
        instrumentId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        commission: import("@prisma/client/runtime/library").Decimal;
    }>;
    deleteTransaction(req: any, id: string): Promise<{
        currency: string;
        id: string;
        type: string;
        accountId: string;
        notes: string | null;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client/runtime/library").Decimal;
        instrumentId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        commission: import("@prisma/client/runtime/library").Decimal;
    }>;
}
