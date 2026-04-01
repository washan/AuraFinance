import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvestmentTransactionDto } from './dto/create-investment.dto';
import yahooFinance from 'yahoo-finance2';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService) {}

  async getPortfolio(householdId: string) {
    const instruments = await this.prisma.instrument.findMany({
      where: { householdId },
      include: {
        transactions: true,
      },
    });

    const portfolio = [];
    let totalMarketValue = 0;
    let totalInvested = 0;

    for (const inst of instruments) {
      let position = 0;
      let costBasis = 0;
      let totalCommissions = 0;

      for (const t of inst.transactions) {
        const qty = Number(t.quantity);
        const price = Number(t.price);
        const comm = Number(t.commission);

        totalCommissions += comm;

        if (t.type === 'BUY') {
          position += qty;
          costBasis += (qty * price) + comm;
        } else if (t.type === 'SELL') {
          if (position > 0) {
            const avgCost = costBasis / position;
            position -= qty;
            costBasis -= avgCost * qty;
          }
        }
      }

        if (position > 0) {
        let currentPrice = 0;
        try {
          const res = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${inst.symbol}`, {
             headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
             }
          });
          const data = await res.json();
          currentPrice = data?.chart?.result?.[0]?.meta?.regularMarketPrice || 0;
        } catch (error: any) {
           console.error(`Failed to fetch price for ${inst.symbol}`, error.message);
        }

        const marketValue = position * currentPrice;
        const avgPrice = costBasis / position;
        const unrealizedPl = marketValue - costBasis;
        const unrealizedPlPct = costBasis > 0 ? (unrealizedPl / costBasis) * 100 : 0;

        totalMarketValue += marketValue;
        totalInvested += costBasis;

        portfolio.push({
          instrumentId: inst.id,
          symbol: inst.symbol,
          name: inst.name,
          position,
          avgPrice,
          costBasis,
          currentPrice,
          marketValue,
          unrealizedPl,
          unrealizedPlPct,
          totalCommissions
        });
      }
    }

    return {
      totalMarketValue,
      totalInvested,
      totalUnrealizedPl: totalMarketValue - totalInvested,
      positions: portfolio,
    };
  }

  async createTransaction(householdId: string, userId: string, dto: CreateInvestmentTransactionDto) {
    let instrument = await this.prisma.instrument.findUnique({
      where: {
        householdId_symbol: { householdId, symbol: dto.symbol }
      }
    });

    if (!instrument) {
      let name = dto.symbol;
      try {
        const res = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${dto.symbol}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const data = await res.json();
        const shortName = data?.chart?.result?.[0]?.meta?.shortName;
        const longName = data?.chart?.result?.[0]?.meta?.longName;
        if (shortName || longName) {
            name = shortName || longName;
        }
      } catch(error: any) {
        console.error(`Failed to fetch name for ${dto.symbol}`);
      }

      instrument = await this.prisma.instrument.create({
        data: {
          householdId,
          symbol: dto.symbol,
          name,
          currency: dto.currency || 'USD',
        }
      });
    }

    const account = await this.prisma.account.findFirst({
      where: { id: dto.accountId, householdId }
    });
    if (!account) throw new NotFoundException('Account not found');

    return this.prisma.investmentTransaction.create({
      data: {
        accountId: account.id,
        instrumentId: instrument.id,
        type: dto.type.toUpperCase(),
        quantity: dto.quantity,
        price: dto.price,
        commission: dto.commission || 0,
        currency: dto.currency || 'USD',
        date: new Date(dto.date),
        notes: dto.notes,
      }
    });
  }

  async getAiInsights(householdId: string, userId: string) {
    try {
      const param = await this.prisma.parameter.findUnique({
        where: { code_userId: { code: 'GEMINI_API_KEY', userId } },
      });

      if (!param || !param.value) {
        throw new BadRequestException('GEMINI_API_KEY no ha sido configurado. Ve a Cuenta -> Integraciones.');
      }

      const ai = new GoogleGenAI({ apiKey: param.value });
      const portfolio = await this.getPortfolio(householdId);

      const prompt = `
You are a financial advisor. Here is my current investment portfolio details:
Total Market Value: $${portfolio.totalMarketValue}
Total Invested: $${portfolio.totalInvested}
Unrealized P&L: $${portfolio.totalUnrealizedPl}
Positions: ${JSON.stringify(portfolio.positions, null, 2)}

Provide a very brief (2-3 paragraphs max) analysis of this portfolio. Mention any concentration risks, performance highlights, and a piece of general advice.
Write the response natively in Spanish. Format in markdown avoiding complex layout. Focus on the actual numbers shown in the prompt.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return { analysis: response.text };
    } catch (error: any) {
      console.error('Gemini fatal error:', error);
      throw new BadRequestException('Error detallado: ' + (error.message || error.toString()));
    }
  }
  async getTransactions(householdId: string) {
    return this.prisma.investmentTransaction.findMany({
      where: {
        account: {
          householdId
        }
      },
      include: {
        instrument: true,
        account: { select: { id: true, name: true } }
      },
      orderBy: { date: 'desc' }
    });
  }

  async updateTransaction(householdId: string, id: string, dto: any) {
    const existing = await this.prisma.investmentTransaction.findUnique({
      where: { id },
      include: { account: true, instrument: true }
    });

    if (!existing || existing.account.householdId !== householdId) {
      throw new NotFoundException('Transaction not found');
    }

    const updateData: any = { ...dto };
    if (dto.date) {
      updateData.date = new Date(dto.date);
    }
    if (dto.type) {
      updateData.type = dto.type.toUpperCase();
    }

    return this.prisma.investmentTransaction.update({
      where: { id },
      data: updateData
    });
  }

  async deleteTransaction(householdId: string, id: string) {
    const existing = await this.prisma.investmentTransaction.findUnique({
      where: { id },
      include: { account: true }
    });

    if (!existing || existing.account.householdId !== householdId) {
      throw new NotFoundException('Transaction not found');
    }

    return this.prisma.investmentTransaction.delete({
      where: { id }
    });
  }
}
