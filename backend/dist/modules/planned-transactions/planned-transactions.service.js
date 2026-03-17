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
exports.PlannedTransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const transactions_service_1 = require("../transactions/transactions.service");
let PlannedTransactionsService = class PlannedTransactionsService {
    prisma;
    transactionsService;
    constructor(prisma, transactionsService) {
        this.prisma = prisma;
        this.transactionsService = transactionsService;
    }
    async create(userId, householdId, data) {
        return this.prisma.plannedTransaction.create({
            data: {
                userId,
                accountId: data.accountId || null,
                itemId: data.itemId || null,
                projectId: data.projectId || null,
                goalId: data.goalId || null,
                type: data.type || 'expense',
                amount: parseFloat(data.amount),
                currency: data.currency,
                plannedDate: new Date(data.plannedDate),
                status: 'PENDING',
                notes: data.notes || null,
            },
            include: {
                item: { include: { category: true } },
                project: true
            }
        });
    }
    async findAll(userId, householdId, month, status) {
        const whereClause = {
            user: { householdId }
        };
        if (status) {
            whereClause.status = status;
        }
        if (month && /^\d{4}-\d{2}$/.test(month)) {
            const [y, m] = month.split('-').map(Number);
            const refMonth = m - 1;
            const mStart = new Date(Date.UTC(y, refMonth, 1, 0, 0, 0, 0));
            const nextMo = refMonth === 11 ? 0 : refMonth + 1;
            const nextYr = refMonth === 11 ? y + 1 : y;
            const mEnd = new Date(Date.UTC(nextYr, nextMo, 1, 0, 0, 0, 0) - 1);
            whereClause.plannedDate = { gte: mStart, lte: mEnd };
        }
        return this.prisma.plannedTransaction.findMany({
            where: whereClause,
            include: {
                account: { select: { id: true, name: true, currencyCode: true } },
                goal: { select: { id: true, title: true } },
                item: { select: { id: true, name: true, categoryId: true, category: { select: { id: true, name: true, icon: true } } } },
                project: { select: { id: true, name: true } }
            },
            orderBy: { plannedDate: 'asc' },
        });
    }
    async update(userId, householdId, plannedTransactionId, data) {
        const pt = await this.prisma.plannedTransaction.findFirst({
            where: { id: plannedTransactionId, user: { householdId } }
        });
        if (!pt)
            throw new common_1.NotFoundException('Transacción planeada no encontrada');
        return this.prisma.plannedTransaction.update({
            where: { id: plannedTransactionId },
            data: {
                accountId: data.accountId !== undefined ? data.accountId : pt.accountId,
                itemId: data.itemId !== undefined ? data.itemId : pt.itemId,
                projectId: data.projectId !== undefined ? data.projectId : pt.projectId,
                goalId: data.goalId !== undefined ? data.goalId : pt.goalId,
                type: data.type || pt.type,
                amount: data.amount ? parseFloat(data.amount) : pt.amount,
                currency: data.currency || pt.currency,
                plannedDate: data.plannedDate ? new Date(data.plannedDate) : pt.plannedDate,
                status: data.status || pt.status,
                notes: data.notes !== undefined ? data.notes : pt.notes,
            },
            include: {
                item: { include: { category: true } },
                project: true
            }
        });
    }
    async remove(householdId, plannedTransactionId) {
        const pt = await this.prisma.plannedTransaction.findFirst({
            where: { id: plannedTransactionId, user: { householdId } }
        });
        if (!pt)
            throw new common_1.NotFoundException('Transacción planeada no encontrada');
        return this.prisma.plannedTransaction.delete({
            where: { id: plannedTransactionId }
        });
    }
    async realize(userId, householdId, plannedTransactionId, realizeData) {
        const pt = await this.prisma.plannedTransaction.findFirst({
            where: { id: plannedTransactionId, user: { householdId } }
        });
        if (!pt)
            throw new common_1.NotFoundException('Transacción planeada no encontrada');
        if (pt.status === 'COMPLETED')
            throw new common_1.BadRequestException('Esta transacción ya fue completada');
        const transaction = await this.transactionsService.create(userId, householdId, {
            accountId: realizeData.accountId,
            destinationAccountId: realizeData.destinationAccountId,
            goalId: realizeData.goalId || pt.goalId,
            type: pt.type,
            itemId: realizeData.itemId || pt.itemId,
            projectId: realizeData.projectId || pt.projectId,
            amountOriginal: realizeData.amountOriginal || pt.amount.toString(),
            currencyOriginal: realizeData.currencyOriginal || pt.currency,
            exchangeRate: realizeData.exchangeRate || '1.0000',
            amountBase: realizeData.amountBase || pt.amount.toString(),
            transactionDate: realizeData.transactionDate || new Date().toISOString(),
            notes: realizeData.notes || pt.notes,
        });
        const updatedPt = await this.prisma.plannedTransaction.update({
            where: { id: plannedTransactionId },
            data: {
                status: 'COMPLETED',
                transactionId: transaction.id
            }
        });
        return { plannedTransaction: updatedPt, transaction };
    }
};
exports.PlannedTransactionsService = PlannedTransactionsService;
exports.PlannedTransactionsService = PlannedTransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transactions_service_1.TransactionsService])
], PlannedTransactionsService);
//# sourceMappingURL=planned-transactions.service.js.map