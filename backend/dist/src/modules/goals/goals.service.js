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
exports.GoalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GoalsService = class GoalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(householdId) {
        const goals = await this.prisma.goal.findMany({
            where: { householdId },
            include: {
                transactions: true,
            },
            orderBy: { title: 'asc' }
        });
        return goals.map(g => {
            const currentAmount = g.transactions.reduce((acc, t) => {
                const amt = Number(t.amountBase);
                if (g.type === 'expense') {
                    return acc + Math.abs(amt);
                }
                return acc + amt;
            }, 0);
            const { transactions, ...goalData } = g;
            return {
                ...goalData,
                currentAmount
            };
        });
    }
    async create(householdId, data) {
        return this.prisma.goal.create({
            data: {
                householdId,
                title: data.title,
                description: data.description,
                type: data.type || 'savings',
                targetAmount: data.targetAmount,
                targetDate: data.targetDate ? new Date(data.targetDate) : null,
            }
        });
    }
    async update(householdId, id, data) {
        if (data.targetDate)
            data.targetDate = new Date(data.targetDate);
        const goal = await this.prisma.goal.findFirst({ where: { id, householdId } });
        if (!goal)
            throw new common_1.NotFoundException('La meta no existe.');
        return this.prisma.goal.update({
            where: { id },
            data
        });
    }
    async remove(householdId, id) {
        const goal = await this.prisma.goal.findFirst({ where: { id, householdId } });
        if (!goal)
            throw new common_1.NotFoundException('La meta no existe.');
        await this.prisma.transaction.updateMany({
            where: { goalId: id, user: { householdId } },
            data: { goalId: null }
        });
        return this.prisma.goal.delete({
            where: { id }
        });
    }
};
exports.GoalsService = GoalsService;
exports.GoalsService = GoalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoalsService);
//# sourceMappingURL=goals.service.js.map