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
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BackupService = class BackupService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async exportData(userId, householdId) {
        const [user, currencies, categories, accounts, projects, goals, budgets, inboxRules, recurringEvents, parameters, transactions, plannedTransactions, assets, instruments, investmentTransactions] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: userId } }),
            this.prisma.currency.findMany({ where: { householdId } }),
            this.prisma.category.findMany({ where: { householdId }, include: { items: true } }),
            this.prisma.account.findMany({ where: { householdId } }),
            this.prisma.project.findMany({ where: { householdId } }),
            this.prisma.goal.findMany({ where: { householdId }, include: { tasks: true } }),
            this.prisma.budget.findMany({ where: { householdId } }),
            this.prisma.inboxRule.findMany({ where: { householdId } }),
            this.prisma.recurringEvent.findMany({ where: { householdId } }),
            this.prisma.parameter.findMany({ where: { userId } }),
            this.prisma.transaction.findMany({ where: { user: { householdId } } }),
            this.prisma.plannedTransaction.findMany({ where: { user: { householdId } } }),
            this.prisma.asset.findMany({ where: { householdId } }),
            this.prisma.instrument.findMany({ where: { householdId } }),
            this.prisma.investmentTransaction.findMany({ where: { account: { householdId } } })
        ]);
        return {
            backupDate: new Date().toISOString(),
            version: '1.1',
            data: {
                user,
                currencies,
                categories,
                accounts,
                projects,
                goals,
                budgets,
                inboxRules,
                recurringEvents,
                parameters,
                transactions,
                plannedTransactions,
                assets,
                instruments,
                investmentTransactions
            }
        };
    }
    async importData(userId, householdId, backupData) {
        if (!backupData || !['1.0', '1.1'].includes(backupData.version) || !backupData.data) {
            throw new common_1.BadRequestException('Formato de backup inválido o versión no soportada.');
        }
        const data = backupData.data;
        return this.prisma.$transaction(async (tx) => {
            await tx.investmentTransaction.deleteMany({ where: { account: { householdId } } });
            await tx.plannedTransaction.deleteMany({ where: { user: { householdId } } });
            await tx.transaction.deleteMany({ where: { user: { householdId } } });
            await tx.inboxRule.deleteMany({ where: { householdId } });
            await tx.recurringEvent.deleteMany({ where: { householdId } });
            await tx.budget.deleteMany({ where: { householdId } });
            await tx.goalTask.deleteMany({ where: { goal: { householdId } } });
            await tx.goal.deleteMany({ where: { householdId } });
            await tx.project.deleteMany({ where: { householdId } });
            await tx.item.deleteMany({ where: { category: { householdId } } });
            await tx.category.deleteMany({ where: { householdId } });
            await tx.asset.deleteMany({ where: { householdId } });
            await tx.instrument.deleteMany({ where: { householdId } });
            await tx.account.deleteMany({ where: { householdId } });
            await tx.currency.deleteMany({ where: { householdId } });
            await tx.parameter.deleteMany({ where: { userId } });
            if (data.currencies?.length) {
                await tx.currency.createMany({ data: data.currencies });
            }
            if (data.categories?.length) {
                const cats = data.categories.map((c) => {
                    const { items, ...rest } = c;
                    return rest;
                });
                await tx.category.createMany({ data: cats });
                const items = data.categories.flatMap((c) => c.items || []);
                if (items.length) {
                    await tx.item.createMany({ data: items });
                }
            }
            if (data.accounts?.length) {
                await tx.account.createMany({ data: data.accounts });
            }
            if (data.projects?.length) {
                await tx.project.createMany({ data: data.projects });
            }
            if (data.goals?.length) {
                const goals = data.goals.map((g) => {
                    const { tasks, ...rest } = g;
                    return rest;
                });
                await tx.goal.createMany({ data: goals });
                const tasks = data.goals.flatMap((g) => g.tasks || []);
                if (tasks.length) {
                    await tx.goalTask.createMany({ data: tasks });
                }
            }
            if (data.budgets?.length) {
                await tx.budget.createMany({ data: data.budgets });
            }
            if (data.inboxRules?.length) {
                await tx.inboxRule.createMany({ data: data.inboxRules });
            }
            if (data.recurringEvents?.length) {
                await tx.recurringEvent.createMany({ data: data.recurringEvents });
            }
            if (data.parameters?.length) {
                await tx.parameter.createMany({ data: data.parameters });
            }
            if (data.transactions?.length) {
                await tx.transaction.createMany({ data: data.transactions });
            }
            if (data.plannedTransactions?.length) {
                await tx.plannedTransaction.createMany({ data: data.plannedTransactions });
            }
            if (data.assets?.length) {
                await tx.asset.createMany({ data: data.assets });
            }
            if (data.instruments?.length) {
                await tx.instrument.createMany({ data: data.instruments });
            }
            if (data.investmentTransactions?.length) {
                await tx.investmentTransaction.createMany({ data: data.investmentTransactions });
            }
            return { message: 'Restauración completada con éxito.' };
        });
    }
};
exports.BackupService = BackupService;
exports.BackupService = BackupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BackupService);
//# sourceMappingURL=backup.service.js.map