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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardMetrics(householdId, projectId, month) {
        if (!householdId) {
            throw new common_1.BadRequestException('Household ID is required');
        }
        const txWhereClause = { user: { householdId } };
        if (projectId === '__none__') {
            txWhereClause.projectId = null;
        }
        else if (projectId) {
            txWhereClause.projectId = projectId;
        }
        const today = new Date();
        let refYear;
        let refMonth;
        if (month && /^\d{4}-\d{2}$/.test(month)) {
            const [y, m] = month.split('-').map(Number);
            refYear = y;
            refMonth = m - 1;
        }
        else {
            refYear = today.getUTCFullYear();
            refMonth = today.getUTCMonth();
        }
        const firstDayOfMonth = new Date(Date.UTC(refYear, refMonth, 1, 0, 0, 0, 0));
        const nextMo = refMonth === 11 ? 0 : refMonth + 1;
        const nextYr = refMonth === 11 ? refYear + 1 : refYear;
        const lastDayOfMonth = new Date(Date.UTC(nextYr, nextMo, 1, 0, 0, 0, 0) - 1);
        let totalBalance = 0;
        if (projectId) {
            const projectTxs = await this.prisma.transaction.findMany({
                where: txWhereClause
            });
            projectTxs.forEach(tx => totalBalance += parseFloat(tx.amountBase.toString()));
        }
        else {
            const accounts = await this.prisma.account.findMany({
                where: { householdId }
            });
            accounts.forEach(acc => {
                totalBalance += parseFloat(acc.balance.toString());
            });
        }
        const currentMonthTransactions = await this.prisma.transaction.findMany({
            where: {
                ...txWhereClause,
                transactionDate: {
                    gte: firstDayOfMonth,
                    lte: lastDayOfMonth
                }
            },
            include: {
                item: { include: { category: true } }
            }
        });
        let currentMonthIncome = 0;
        let currentMonthExpenses = 0;
        currentMonthTransactions.forEach(tx => {
            if (tx.type === 'transfer')
                return;
            const amount = parseFloat(tx.amountBase.toString());
            if (amount > 0)
                currentMonthIncome += amount;
            else
                currentMonthExpenses += Math.abs(amount);
        });
        const incomeByCategory = {};
        const incomeByItem = {};
        const expenseByCategory = {};
        const expenseByItem = {};
        currentMonthTransactions.forEach(tx => {
            if (tx.type === 'transfer')
                return;
            const amount = Math.abs(parseFloat(tx.amountBase.toString()));
            const isIncome = parseFloat(tx.amountBase.toString()) > 0;
            const categoryName = tx.item?.category?.name || 'Sin clasificar';
            const categoryIcon = tx.item?.category?.icon || '📦';
            const categoryId = tx.item?.category?.id || '__uncategorized__';
            const itemName = tx.item?.name || 'Sin clasificar';
            const itemId = tx.item?.id || '__uncategorized__';
            const catMap = isIncome ? incomeByCategory : expenseByCategory;
            const itemMap = isIncome ? incomeByItem : expenseByItem;
            if (!catMap[categoryId])
                catMap[categoryId] = { name: categoryName, icon: categoryIcon, amount: 0 };
            catMap[categoryId].amount += amount;
            if (!itemMap[itemId])
                itemMap[itemId] = { name: itemName, categoryName, icon: categoryIcon, amount: 0 };
            itemMap[itemId].amount += amount;
        });
        const sortBreakdown = (map) => Object.values(map).sort((a, b) => b.amount - a.amount);
        const incomeBreakdown = {
            byCategory: sortBreakdown(incomeByCategory),
            byItem: sortBreakdown(incomeByItem),
        };
        const expenseBreakdown = {
            byCategory: sortBreakdown(expenseByCategory),
            byItem: sortBreakdown(expenseByItem),
        };
        let prevMonthIdx = refMonth - 1;
        let prevYear = refYear;
        if (prevMonthIdx < 0) {
            prevMonthIdx = 11;
            prevYear--;
        }
        const firstDayOfPreviousMonth = new Date(Date.UTC(prevYear, prevMonthIdx, 1, 0, 0, 0, 0));
        const prevNextMo = prevMonthIdx === 11 ? 0 : prevMonthIdx + 1;
        const prevNextYr = prevMonthIdx === 11 ? prevYear + 1 : prevYear;
        const lastDayOfPreviousMonth = new Date(Date.UTC(prevNextYr, prevNextMo, 1, 0, 0, 0, 0) - 1);
        const previousMonthTransactions = await this.prisma.transaction.findMany({
            where: {
                ...txWhereClause,
                transactionDate: {
                    gte: firstDayOfPreviousMonth,
                    lte: lastDayOfPreviousMonth
                }
            },
            include: {
                item: { include: { category: true } }
            }
        });
        let prevMonthIncome = 0;
        let prevMonthExpenses = 0;
        previousMonthTransactions.forEach(tx => {
            if (tx.type === 'transfer')
                return;
            const amount = parseFloat(tx.amountBase.toString());
            if (amount > 0)
                prevMonthIncome += amount;
            else
                prevMonthExpenses += Math.abs(amount);
        });
        const incomeTrend = this.calculatePercentageChange(prevMonthIncome, currentMonthIncome);
        const expenseTrend = this.calculatePercentageChange(prevMonthExpenses, currentMonthExpenses);
        const netFlowCurrentMonth = currentMonthIncome - currentMonthExpenses;
        const estimatedPrevBalance = totalBalance - netFlowCurrentMonth;
        const balanceTrend = this.calculatePercentageChange(estimatedPrevBalance, totalBalance);
        const latestTx = await this.prisma.transaction.findFirst({
            where: txWhereClause,
            orderBy: { transactionDate: 'desc' },
            select: { transactionDate: true }
        });
        let endMonth = today;
        if (latestTx && latestTx.transactionDate > today) {
            endMonth = latestTx.transactionDate;
        }
        const endYear = endMonth.getUTCFullYear();
        const endMonthIdx = endMonth.getUTCMonth();
        const cashFlow = [];
        for (let i = 5; i >= 0; i--) {
            let mMonth = endMonthIdx - i;
            let mYear = endYear;
            while (mMonth < 0) {
                mMonth += 12;
                mYear--;
            }
            const mStart = new Date(Date.UTC(mYear, mMonth, 1, 0, 0, 0, 0));
            const nextMonth = mMonth === 11 ? 0 : mMonth + 1;
            const nextYear = mMonth === 11 ? mYear + 1 : mYear;
            const mEnd = new Date(Date.UTC(nextYear, nextMonth, 1, 0, 0, 0, 0) - 1);
            const monthTx = await this.prisma.transaction.findMany({
                where: {
                    ...txWhereClause,
                    transactionDate: { gte: mStart, lte: mEnd }
                },
                include: { item: { include: { category: true } } }
            });
            let mInc = 0;
            let mExp = 0;
            monthTx.forEach(tx => {
                if (tx.type === 'transfer')
                    return;
                const amount = parseFloat(tx.amountBase.toString());
                if (amount > 0)
                    mInc += amount;
                else
                    mExp += Math.abs(amount);
            });
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            cashFlow.push({
                m: monthNames[mMonth],
                inc: mInc,
                exp: mExp
            });
        }
        const baseCurrency = await this.prisma.currency.findFirst({
            where: { householdId, isLocalBase: true }
        });
        const currencySymbol = baseCurrency?.symbol || '$';
        let activeSavings = 0;
        const investmentAccounts = await this.prisma.account.findMany({
            where: { householdId, type: 'investment' }
        });
        const invAccountIds = investmentAccounts.map(a => a.id);
        investmentAccounts.forEach(acc => {
            activeSavings += parseFloat(acc.balance.toString());
        });
        const goals = await this.prisma.goal.findMany({
            where: { householdId },
            include: { transactions: true }
        });
        const goalsProgress = [];
        goals.forEach(g => {
            let currentAmount = 0;
            g.transactions.forEach((t) => {
                if (g.type === 'expense') {
                    currentAmount += Math.abs(parseFloat(t.amountBase.toString()));
                    return;
                }
                if (t.type === 'transfer' && t.destinationAccountId && invAccountIds.includes(t.destinationAccountId)) {
                    currentAmount += parseFloat(t.amountBase.toString());
                    return;
                }
                if (t.type === 'income' && t.accountId && invAccountIds.includes(t.accountId)) {
                    currentAmount += parseFloat(t.amountBase.toString());
                    return;
                }
                const amt = parseFloat(t.amountBase.toString());
                currentAmount += amt;
                activeSavings += amt;
            });
            goalsProgress.push({
                id: g.id,
                title: g.title,
                type: g.type || 'savings',
                targetAmount: g.targetAmount ? parseFloat(g.targetAmount.toString()) : null,
                currentAmount: currentAmount,
                targetDate: g.targetDate
            });
        });
        const savingsTransactions = await this.prisma.transaction.findMany({
            where: {
                user: { householdId },
                goalId: null,
                item: { category: { type: 'ahorro' } }
            }
        });
        savingsTransactions.forEach(tx => {
            if (tx.type === 'transfer' && tx.destinationAccountId && invAccountIds.includes(tx.destinationAccountId))
                return;
            if (tx.type === 'income' && tx.accountId && invAccountIds.includes(tx.accountId))
                return;
            activeSavings += Math.abs(parseFloat(tx.amountBase.toString()));
        });
        return {
            currencySymbol,
            activeSavings,
            totalBalance: {
                amount: totalBalance,
                trend: balanceTrend.pct,
                trendUp: balanceTrend.up,
                trendText: `${balanceTrend.pct >= 0 ? '+' : ''}${balanceTrend.pct.toFixed(1)}% desde el mes pasado`
            },
            monthlyIncome: {
                amount: currentMonthIncome,
                trend: incomeTrend.pct,
                trendUp: incomeTrend.up,
                trendText: `${incomeTrend.pct >= 0 ? '+' : ''}${incomeTrend.pct.toFixed(1)}% desde el mes pasado`
            },
            monthlyExpenses: {
                amount: currentMonthExpenses,
                trend: expenseTrend.pct,
                trendUp: expenseTrend.up,
                trendText: `${expenseTrend.pct >= 0 ? '+' : ''}${expenseTrend.pct.toFixed(1)}% desde el mes pasado`
            },
            cashFlow,
            goalsProgress,
            incomeBreakdown,
            expenseBreakdown
        };
    }
    async getTrendData(householdId, categoryId, months = 6) {
        if (!householdId) {
            throw new common_1.BadRequestException('Household ID is required');
        }
        const today = new Date();
        const endYear = today.getUTCFullYear();
        const endMonthIdx = today.getUTCMonth();
        const result = [];
        for (let i = months - 1; i >= 0; i--) {
            let mMonth = endMonthIdx - i;
            let mYear = endYear;
            while (mMonth < 0) {
                mMonth += 12;
                mYear--;
            }
            const mStart = new Date(Date.UTC(mYear, mMonth, 1, 0, 0, 0, 0));
            const nextMo = mMonth === 11 ? 0 : mMonth + 1;
            const nextYr = mMonth === 11 ? mYear + 1 : mYear;
            const mEnd = new Date(Date.UTC(nextYr, nextMo, 1, 0, 0, 0, 0) - 1);
            const whereClause = {
                user: { householdId },
                transactionDate: { gte: mStart, lte: mEnd },
                NOT: { type: 'transfer' },
            };
            if (categoryId) {
                whereClause.item = { categoryId };
            }
            const txs = await this.prisma.transaction.findMany({ where: whereClause });
            let inc = 0;
            let exp = 0;
            txs.forEach(tx => {
                const amount = parseFloat(tx.amountBase.toString());
                if (amount > 0)
                    inc += amount;
                else
                    exp += Math.abs(amount);
            });
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            result.push({ month: monthNames[mMonth], year: mYear, inc, exp });
        }
        return result;
    }
    calculatePercentageChange(oldValue, newValue) {
        if (oldValue === 0) {
            return { pct: newValue > 0 ? 100 : 0, up: newValue >= 0 };
        }
        const change = ((newValue - oldValue) / Math.abs(oldValue)) * 100;
        return {
            pct: change,
            up: change >= 0
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map