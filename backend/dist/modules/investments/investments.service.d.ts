import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvestmentTransactionDto } from './dto/create-investment.dto';
export declare class InvestmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    getPortfolio(householdId: string): Promise<{
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
    createTransaction(householdId: string, userId: string, dto: CreateInvestmentTransactionDto): Promise<{
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
    getAiInsights(householdId: string, userId: string): Promise<{
        analysis: string | undefined;
    }>;
    getTransactions(householdId: string): Promise<({
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
    updateTransaction(householdId: string, id: string, dto: any): Promise<{
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
    deleteTransaction(householdId: string, id: string): Promise<{
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
