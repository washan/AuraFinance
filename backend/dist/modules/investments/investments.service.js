"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const genai_1 = require("@google/genai");
let InvestmentsService = class InvestmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPortfolio(householdId) {
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
                }
                else if (t.type === 'SELL') {
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
                }
                catch (error) {
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
    async createTransaction(householdId, userId, dto) {
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
            }
            catch (error) {
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
        if (!account)
            throw new common_1.NotFoundException('Account not found');
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
    async getAiInsights(householdId, userId) {
        try {
            const param = await this.prisma.parameter.findUnique({
                where: { code_userId: { code: 'GEMINI_API_KEY', userId } },
            });
            if (!param || !param.value) {
                throw new common_1.BadRequestException('GEMINI_API_KEY no ha sido configurado. Ve a Cuenta -> Integraciones.');
            }
            const ai = new genai_1.GoogleGenAI({ apiKey: param.value });
            const portfolio = await this.getPortfolio(householdId);
            let newsContext = '';
            try {
                const uniqueSymbols = Array.from(new Set(portfolio.positions.map((p) => p.symbol)));
                const specificNewsPromises = uniqueSymbols.slice(0, 3).map(async (symbol) => {
                    const res = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=3`, {
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });
                    const data = await res.json();
                    const news = data?.news || [];
                    if (news.length > 0) {
                        return `Noticias para ${symbol}:\n` + news.map((n) => `- ${n.title}`).join('\n');
                    }
                    return '';
                });
                const macroNewsPromise = fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=SPY&newsCount=5`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                }).then(res => res.json()).then(data => {
                    const news = data?.news || [];
                    if (news.length > 0) {
                        return `Noticias Generales del Mercado y S&P 500:\n` + news.map((n) => `- ${n.title}`).join('\n');
                    }
                    return '';
                });
                const allPromises = [...specificNewsPromises, macroNewsPromise];
                const newsResults = await Promise.all(allPromises);
                const validNews = newsResults.filter((n) => n.length > 0);
                if (validNews.length > 0) {
                    newsContext = `\n--- CONTEXTO DE MERCADO EN TIEMPO REAL ---\n${validNews.join('\n\n')}\n------------------------------------------\n`;
                }
            }
            catch (error) {
                console.error('Failed to fetch news context', error);
            }
            const prompt = `
You are a financial advisor. Here is my current investment portfolio details:
Total Market Value: $${portfolio.totalMarketValue}
Total Invested: $${portfolio.totalInvested}
Unrealized P&L: $${portfolio.totalUnrealizedPl}
Positions: ${JSON.stringify(portfolio.positions, null, 2)}
${newsContext}

Provide a brief (2-3 paragraphs max) analysis of this portfolio. Mention any concentration risks, performance highlights, and a piece of general advice. 
IMPORTANT: Use the provided "CONTEXTO DE MERCADO EN TIEMPO REAL" to explain potential reasons for current market movements or the portfolio's performance. Often, specific ticker news might be irrelevant or noisy; if so, rely entirely on the "Noticias Generales del Mercado y S&P 500" to explain macroeconomic trends (e.g., interest rates, geopolitical events running the market broadly). Connect the macro news to the portfolio's performance.

Write the response natively in Spanish. Format in markdown avoiding complex layout. Focus on the actual numbers shown in the prompt and the provided news context.
      `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return { analysis: response.text };
        }
        catch (error) {
            console.error('Gemini fatal error:', error);
            throw new common_1.BadRequestException('Error detallado: ' + (error.message || error.toString()));
        }
    }
    async getHistory(householdId) {
        const instruments = await this.prisma.instrument.findMany({
            where: { householdId },
            include: {
                transactions: { orderBy: { date: 'asc' } },
            },
        });
        const history = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            history.push({
                date: d,
                invested: 0,
                marketValue: 0,
                monthLabel: d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
            });
        }
        for (const inst of instruments) {
            if (inst.transactions.length === 0)
                continue;
            let historicalQuotes = [];
            try {
                const res = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${inst.symbol}?interval=1mo&range=1y`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                const data = await res.json();
                const timestamps = data?.chart?.result?.[0]?.timestamp || [];
                const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
                historicalQuotes = timestamps.map((ts, i) => ({
                    date: new Date(ts * 1000),
                    close: closes[i]
                })).filter((q) => q.close !== null && q.close !== undefined);
            }
            catch (error) {
                console.error(`Failed to fetch history for ${inst.symbol}`, error.message);
            }
            for (let h of history) {
                let position = 0;
                let costBasis = 0;
                for (const t of inst.transactions) {
                    if (t.date <= h.date) {
                        const qty = Number(t.quantity);
                        const price = Number(t.price);
                        const comm = Number(t.commission);
                        if (t.type === 'BUY') {
                            position += qty;
                            costBasis += (qty * price) + comm;
                        }
                        else if (t.type === 'SELL') {
                            if (position > 0) {
                                const avgCost = costBasis / position;
                                position -= qty;
                                costBasis -= avgCost * qty;
                            }
                        }
                    }
                }
                if (position > 0) {
                    h.invested += costBasis;
                    let price = 0;
                    const quote = historicalQuotes.find(q => q.date.getMonth() === h.date.getMonth() &&
                        q.date.getFullYear() === h.date.getFullYear());
                    if (quote) {
                        price = quote.close;
                    }
                    else if (historicalQuotes.length > 0) {
                        const lastQuote = historicalQuotes[historicalQuotes.length - 1];
                        price = lastQuote.close;
                    }
                    else {
                        price = costBasis / position;
                    }
                    h.marketValue += position * price;
                }
            }
        }
        return history;
    }
    async getTransactions(householdId) {
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
    async updateTransaction(householdId, id, dto) {
        const existing = await this.prisma.investmentTransaction.findUnique({
            where: { id },
            include: { account: true, instrument: true }
        });
        if (!existing || existing.account.householdId !== householdId) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        const updateData = { ...dto };
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
    async deleteTransaction(householdId, id) {
        const existing = await this.prisma.investmentTransaction.findUnique({
            where: { id },
            include: { account: true }
        });
        if (!existing || existing.account.householdId !== householdId) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return this.prisma.investmentTransaction.delete({
            where: { id }
        });
    }
};
exports.InvestmentsService = InvestmentsService;
exports.InvestmentsService = InvestmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvestmentsService);
//# sourceMappingURL=investments.service.js.map