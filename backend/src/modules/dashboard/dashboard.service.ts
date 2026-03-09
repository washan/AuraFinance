import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { format } from 'date-fns';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getDashboardMetrics(householdId: string, projectId?: string, month?: string) {
        if (!householdId) {
            throw new BadRequestException('Household ID is required');
        }

        const txWhereClause: any = { user: { householdId } };
        if (projectId === '__none__') {
            txWhereClause.projectId = null;
        } else if (projectId) {
            txWhereClause.projectId = projectId;
        }

        const today = new Date();

        // Determine reference month: use `month` param (format YYYY-MM) or current month
        let refYear: number;
        let refMonth: number; // 0-based
        if (month && /^\d{4}-\d{2}$/.test(month)) {
            const [y, m] = month.split('-').map(Number);
            refYear = y;
            refMonth = m - 1; // convert to 0-based
        } else {
            refYear = today.getUTCFullYear();
            refMonth = today.getUTCMonth();
        }

        // Build UTC month boundaries for the selected month
        const firstDayOfMonth = new Date(Date.UTC(refYear, refMonth, 1, 0, 0, 0, 0));
        const nextMo = refMonth === 11 ? 0 : refMonth + 1;
        const nextYr = refMonth === 11 ? refYear + 1 : refYear;
        const lastDayOfMonth = new Date(Date.UTC(nextYr, nextMo, 1, 0, 0, 0, 0) - 1);

        // 1. Total Balance calculation
        let totalBalance = 0;
        if (projectId) {
            const projectTxs = await this.prisma.transaction.findMany({
                where: txWhereClause
            });
            projectTxs.forEach(tx => totalBalance += parseFloat(tx.amountBase.toString()));
        } else {
            const accounts = await this.prisma.account.findMany({
                where: { householdId }
            });
            accounts.forEach(acc => {
                totalBalance += parseFloat(acc.balance.toString());
            });
        }

        // 2 & 3. Income and Expenses for the Current Month
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
            if (tx.type === 'transfer') return; // Ignore transfers for P&L
            const amount = parseFloat(tx.amountBase.toString());
            if (amount > 0) currentMonthIncome += amount;
            else currentMonthExpenses += Math.abs(amount);
        });

        // 7. Income and Expense Breakdowns (by Category and by Item)
        const incomeByCategory: Record<string, { name: string; icon: string; amount: number }> = {};
        const incomeByItem: Record<string, { name: string; categoryName: string; icon: string; amount: number }> = {};
        const expenseByCategory: Record<string, { name: string; icon: string; amount: number }> = {};
        const expenseByItem: Record<string, { name: string; categoryName: string; icon: string; amount: number }> = {};

        currentMonthTransactions.forEach(tx => {
            if (tx.type === 'transfer') return;
            const amount = Math.abs(parseFloat(tx.amountBase.toString()));
            const isIncome = parseFloat(tx.amountBase.toString()) > 0;

            const categoryName = tx.item?.category?.name || 'Sin clasificar';
            const categoryIcon = tx.item?.category?.icon || '📦';
            const categoryId = tx.item?.category?.id || '__uncategorized__';
            const itemName = tx.item?.name || 'Sin clasificar';
            const itemId = tx.item?.id || '__uncategorized__';

            const catMap = isIncome ? incomeByCategory : expenseByCategory;
            const itemMap = isIncome ? incomeByItem : expenseByItem;

            if (!catMap[categoryId]) catMap[categoryId] = { name: categoryName, icon: categoryIcon, amount: 0 };
            catMap[categoryId].amount += amount;

            if (!itemMap[itemId]) itemMap[itemId] = { name: itemName, categoryName, icon: categoryIcon, amount: 0 };
            itemMap[itemId].amount += amount;
        });

        const sortBreakdown = (map: Record<string, any>) =>
            Object.values(map).sort((a: any, b: any) => b.amount - a.amount);

        const incomeBreakdown = {
            byCategory: sortBreakdown(incomeByCategory),
            byItem: sortBreakdown(incomeByItem),
        };
        const expenseBreakdown = {
            byCategory: sortBreakdown(expenseByCategory),
            byItem: sortBreakdown(expenseByItem),
        };

        // 4. Monthly changes (Comparing selected month against its previous month)
        let prevMonthIdx = refMonth - 1;
        let prevYear = refYear;
        if (prevMonthIdx < 0) { prevMonthIdx = 11; prevYear--; }
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
            if (tx.type === 'transfer') return; // Ignore transfers for P&L
            const amount = parseFloat(tx.amountBase.toString());
            if (amount > 0) prevMonthIncome += amount;
            else prevMonthExpenses += Math.abs(amount);
        });

        const incomeTrend = this.calculatePercentageChange(prevMonthIncome, currentMonthIncome);
        const expenseTrend = this.calculatePercentageChange(prevMonthExpenses, currentMonthExpenses);

        // Let's approximate a balance trend - not perfect as balance is continuous, but good enough for MVP
        // we can take totalBalance - net flow this month to guess prev balance.
        const netFlowCurrentMonth = currentMonthIncome - currentMonthExpenses;
        const estimatedPrevBalance = totalBalance - netFlowCurrentMonth;
        const balanceTrend = this.calculatePercentageChange(estimatedPrevBalance, totalBalance);

        // 5. Cash Flow last 6 months (dynamic window)
        // Find the latest transaction month to ensure future-dated transactions are included
        const latestTx = await this.prisma.transaction.findFirst({
            where: txWhereClause,
            orderBy: { transactionDate: 'desc' },
            select: { transactionDate: true }
        });

        // The end month is the later of: current month OR the month of the latest transaction
        let endMonth = today;
        if (latestTx && latestTx.transactionDate > today) {
            endMonth = latestTx.transactionDate;
        }

        // Determine the end reference in UTC (year, month)
        const endYear = endMonth.getUTCFullYear();
        const endMonthIdx = endMonth.getUTCMonth(); // 0-based

        const cashFlow = [];
        for (let i = 5; i >= 0; i--) {
            // Pure UTC month arithmetic
            let mMonth = endMonthIdx - i;
            let mYear = endYear;
            while (mMonth < 0) { mMonth += 12; mYear--; }

            const mStart = new Date(Date.UTC(mYear, mMonth, 1, 0, 0, 0, 0));
            // End of month: go to 1st of next month, subtract 1ms
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
                if (tx.type === 'transfer') return;
                const amount = parseFloat(tx.amountBase.toString());
                if (amount > 0) mInc += amount;
                else mExp += Math.abs(amount);
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

        // 6. Active Savings (Sum of all Goals and Investment Accounts)
        // Note: Project filter does not affect global active savings by design

        let activeSavings = 0;

        // Add investment accounts balance
        const investmentAccounts = await this.prisma.account.findMany({
            where: { householdId, type: 'investment' }
        });
        const invAccountIds = investmentAccounts.map(a => a.id);

        investmentAccounts.forEach(acc => {
            activeSavings += parseFloat(acc.balance.toString());
        });

        // Add goals and compile goalsProgress array
        const goals = await this.prisma.goal.findMany({
            where: { householdId },
            include: { transactions: true }
        });

        const goalsProgress: any[] = [];

        goals.forEach(g => {
            let currentAmount = 0;
            g.transactions.forEach((t: any) => {
                if (g.type === 'expense') {
                    // Expense goals: accumulate absolute value of expenses paid
                    currentAmount += Math.abs(parseFloat(t.amountBase.toString()));
                    // Do NOT add to activeSavings — these are payments, not savings
                    return;
                }

                // Savings goals: original logic
                // Prevenir que una transferencia a una cuenta de inversion se cuente doble 
                // ya que su balance se leyó completo en el paso anterior.
                if (t.type === 'transfer' && t.destinationAccountId && invAccountIds.includes(t.destinationAccountId)) {
                    // However, we still want to count it towards the GOAL's currentAmount.
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

        // Add pure savings transactions (those unassigned to a goal but categorized as savings)
        const savingsTransactions = await this.prisma.transaction.findMany({
            where: {
                user: { householdId },
                goalId: null, // Avoid double counting if already linked to a goal
                item: { category: { type: 'ahorro' } }
            }
        });

        savingsTransactions.forEach(tx => {
            if (tx.type === 'transfer' && tx.destinationAccountId && invAccountIds.includes(tx.destinationAccountId)) return;
            if (tx.type === 'income' && tx.accountId && invAccountIds.includes(tx.accountId)) return;

            // For transfers, the 'amountBase' is positive indicating the deposit to the asset.
            // For standard expenses marked as 'ahorro' the 'amountBase' is negative (money left the checking account)
            // However, from an asset-tracking perspective, buying a bond (expense=ahorro) increases your assets.
            // So we accumulate the absolute value for 'savings/investments' globally.
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


    async getTrendData(householdId: string, categoryId?: string, months: number = 6) {
        if (!householdId) {
            throw new BadRequestException('Household ID is required');
        }

        const today = new Date();
        const endYear = today.getUTCFullYear();
        const endMonthIdx = today.getUTCMonth(); // 0-based

        const result = [];

        for (let i = months - 1; i >= 0; i--) {
            let mMonth = endMonthIdx - i;
            let mYear = endYear;
            while (mMonth < 0) { mMonth += 12; mYear--; }

            const mStart = new Date(Date.UTC(mYear, mMonth, 1, 0, 0, 0, 0));
            const nextMo = mMonth === 11 ? 0 : mMonth + 1;
            const nextYr = mMonth === 11 ? mYear + 1 : mYear;
            const mEnd = new Date(Date.UTC(nextYr, nextMo, 1, 0, 0, 0, 0) - 1);

            const whereClause: any = {
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
                if (amount > 0) inc += amount;
                else exp += Math.abs(amount);
            });

            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            result.push({ month: monthNames[mMonth], year: mYear, inc, exp });
        }

        return result;
    }

    private calculatePercentageChange(oldValue: number, newValue: number) {
        if (oldValue === 0) {
            // If old was 0, any new value > 0 is +100%, otherwise 0%
            return { pct: newValue > 0 ? 100 : 0, up: newValue >= 0 };
        }
        const change = ((newValue - oldValue) / Math.abs(oldValue)) * 100;
        return {
            pct: change,
            up: change >= 0
        };
    }
}
