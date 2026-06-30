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
exports.BudgetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const date_fns_1 = require("date-fns");
let BudgetsService = class BudgetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertBudget(householdId, dto) {
        if (!dto.isBase && !dto.period) {
            throw new common_1.BadRequestException('Debe especificar un periodo (MM-YYYY) si no es un presupuesto base.');
        }
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
    async getBudgetSummary(householdId, period) {
        const parsedDate = (0, date_fns_1.parse)(period, 'MM-yyyy', new Date());
        const startDate = (0, date_fns_1.startOfMonth)(parsedDate);
        const endDate = (0, date_fns_1.endOfMonth)(parsedDate);
        const categories = await this.prisma.category.findMany({
            where: { householdId, type: 'expense' },
            include: { items: true }
        });
        const expenseItems = categories.flatMap((c) => c.items.map((i) => ({ ...i, categoryName: c.name })));
        const itemIds = expenseItems.map((i) => i.id);
        if (itemIds.length === 0)
            return [];
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
        const transactions = await this.prisma.transaction.findMany({
            where: {
                account: { householdId },
                itemId: { in: itemIds },
                type: 'expense',
                transactionDate: {
                    gte: startDate,
                    lte: endDate
                },
                status: { not: 'PENDING' }
            }
        });
        const consumedMap = new Map();
        transactions.forEach((t) => {
            const current = consumedMap.get(t.itemId) || 0;
            consumedMap.set(t.itemId, current + Math.abs(Number(t.amountBase)));
        });
        const results = expenseItems.map((item) => {
            const baseBudget = budgets.find((b) => b.itemId === item.id && b.isBase);
            const specificBudget = budgets.find((b) => b.itemId === item.id && !b.isBase && b.period === period);
            const baseAmount = baseBudget ? Number(baseBudget.limitAmount) : 0;
            const extraAmount = specificBudget ? Number(specificBudget.limitAmount) : 0;
            const formulated = baseAmount + extraAmount;
            const consumed = consumedMap.get(item.id) || 0;
            let status = 'OK';
            if (formulated > 0) {
                if (consumed > formulated)
                    status = 'EXCEEDED';
                else if (consumed > formulated * 0.8)
                    status = 'WARNING';
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
        return results.sort((a, b) => {
            if (a.categoryName === b.categoryName) {
                return a.itemName.localeCompare(b.itemName);
            }
            return a.categoryName.localeCompare(b.categoryName);
        });
    }
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map