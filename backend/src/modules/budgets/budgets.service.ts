import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { startOfMonth, endOfMonth, parse } from 'date-fns';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async upsertBudget(householdId: string, dto: CreateBudgetDto) {
    if (!dto.isBase && !dto.period) {
      throw new BadRequestException('Debe especificar un periodo (MM-YYYY) si no es un presupuesto base.');
    }

    // Buscar si ya existe para este item y periodo (o si es base)
    const existing = await this.prisma.budget.findFirst({
      where: {
        householdId,
        itemId: dto.itemId,
        isBase: dto.isBase || false,
        period: dto.isBase ? null : dto.period,
      }
    });

    if (existing) {
      return this.prisma.budget.update({
        where: { id: existing.id },
        data: {
          limitAmount: dto.limitAmount,
          currency: dto.currency || 'CRC'
        }
      });
    }

    return this.prisma.budget.create({
      data: {
        householdId,
        itemId: dto.itemId,
        limitAmount: dto.limitAmount,
        isBase: dto.isBase || false,
        period: dto.isBase ? null : dto.period,
        currency: dto.currency || 'CRC'
      }
    });
  }

  async getBudgetSummary(householdId: string, period: string) {
    // period is MM-YYYY
    const parsedDate = parse(period, 'MM-yyyy', new Date());
    const startDate = startOfMonth(parsedDate);
    const endDate = endOfMonth(parsedDate);

    // 1. Fetch all expense items for this household
    const categories = await this.prisma.category.findMany({
      where: { householdId, type: 'expense' },
      include: { items: true }
    });

    const expenseItems = categories.flatMap((c: any) => c.items.map((i: any) => ({ ...i, categoryName: c.name })));
    const itemIds = expenseItems.map((i: any) => i.id);

    if (itemIds.length === 0) return [];

    // 2. Fetch all budgets (base and specific for this period)
    const budgets = await this.prisma.budget.findMany({
      where: {
        householdId,
        itemId: { in: itemIds },
        OR: [
          { isBase: true },
          { period: period, isBase: false }
        ]
      }
    });

    // 3. Fetch all expenses for this period
    const transactions = await this.prisma.transaction.findMany({
      where: {
        account: { householdId },
        itemId: { in: itemIds },
        type: 'expense',
        transactionDate: {
          gte: startDate,
          lte: endDate
        },
        status: { not: 'PENDING' } // Include CLASSIFIED, RECONCILED
      }
    });

    // 4. Calculate consumed amount per item
    const consumedMap = new Map<string, number>();
    transactions.forEach((t: any) => {
      const current = consumedMap.get(t.itemId!) || 0;
      consumedMap.set(t.itemId!, current + Math.abs(Number(t.amountBase)));
    });

    // 5. Build response
    const results = expenseItems.map((item: any) => {
      // Find base budget
      const baseBudget = budgets.find((b: any) => b.itemId === item.id && b.isBase);
      // Find specific budget
      const specificBudget = budgets.find((b: any) => b.itemId === item.id && !b.isBase && b.period === period);

      const baseAmount = baseBudget ? Number(baseBudget.limitAmount) : 0;
      const extraAmount = specificBudget ? Number(specificBudget.limitAmount) : 0;
      const formulated = baseAmount + extraAmount;
      const consumed = consumedMap.get(item.id) || 0;

      let status = 'OK';
      if (formulated > 0) {
        if (consumed > formulated) status = 'EXCEEDED';
        else if (consumed > formulated * 0.8) status = 'WARNING';
      }

      return {
        itemId: item.id,
        itemName: item.name,
        categoryName: item.categoryName,
        baseAmount,
        extraAmount,
        formulated,
        consumed,
        status,
        currency: baseBudget?.currency || specificBudget?.currency || 'CRC'
      };
    });

    // Sort by category name then item name
    return results.sort((a: any, b: any) => {
      if (a.categoryName === b.categoryName) {
         return a.itemName.localeCompare(b.itemName);
      }
      return a.categoryName.localeCompare(b.categoryName);
    });
  }
}
