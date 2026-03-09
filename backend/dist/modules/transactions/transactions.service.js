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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TransactionsService = class TransactionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(householdId, accountId, projectId, month, take = 50, skip = 0) {
        const whereClause = {
            user: { householdId }
        };
        if (accountId) {
            whereClause.accountId = accountId;
        }
        if (projectId === '__none__') {
            whereClause.projectId = null;
        }
        else if (projectId) {
            whereClause.projectId = projectId;
        }
        if (month && /^\d{4}-\d{2}$/.test(month)) {
            const [y, m] = month.split('-').map(Number);
            const refMonth = m - 1;
            const mStart = new Date(Date.UTC(y, refMonth, 1, 0, 0, 0, 0));
            const nextMo = refMonth === 11 ? 0 : refMonth + 1;
            const nextYr = refMonth === 11 ? y + 1 : y;
            const mEnd = new Date(Date.UTC(nextYr, nextMo, 1, 0, 0, 0, 0) - 1);
            whereClause.transactionDate = { gte: mStart, lte: mEnd };
        }
        return this.prisma.transaction.findMany({
            where: whereClause,
            include: {
                account: { select: { id: true, name: true, currencyCode: true } },
                destinationAccount: { select: { id: true, name: true, currencyCode: true } },
                goal: { select: { id: true, title: true } },
                item: { select: { id: true, name: true, categoryId: true, category: { select: { id: true, name: true, icon: true } } } }
            },
            orderBy: { transactionDate: 'desc' },
            take,
            skip
        });
    }
    async create(userId, householdId, data) {
        const account = await this.prisma.account.findFirst({
            where: { id: data.accountId, householdId }
        });
        if (!account)
            throw new common_1.NotFoundException(`La cuenta de origen no existe o no pertenece a tu entorno.`);
        if (data.type === 'transfer') {
            if (!data.destinationAccountId)
                throw new common_1.BadRequestException(`Falta cuenta de destino para la transferencia.`);
            if (data.accountId === data.destinationAccountId)
                throw new common_1.BadRequestException(`No puedes transferir a la misma cuenta.`);
            const destAccount = await this.prisma.account.findFirst({
                where: { id: data.destinationAccountId, householdId }
            });
            if (!destAccount)
                throw new common_1.NotFoundException(`La cuenta de destino no existe en tu entorno.`);
        }
        return this.prisma.$transaction(async (tx) => {
            const amountBaseNum = parseFloat(data.amountBase);
            const absAmount = Math.abs(amountBaseNum);
            const resolvedType = data.type || 'expense';
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    accountId: data.accountId,
                    destinationAccountId: resolvedType === 'transfer' ? data.destinationAccountId : null,
                    goalId: data.goalId || null,
                    type: resolvedType,
                    itemId: data.itemId || null,
                    projectId: resolvedType === 'transfer' ? null : (data.projectId || null),
                    amountOriginal: parseFloat(data.amountOriginal),
                    currencyOriginal: data.currencyOriginal,
                    exchangeRate: parseFloat(data.exchangeRate),
                    amountBase: resolvedType === 'transfer' ? absAmount : amountBaseNum,
                    transactionDate: new Date(data.transactionDate),
                    notes: data.notes || null,
                    status: 'CLASSIFIED'
                },
                include: {
                    account: true, destinationAccount: true, goal: true,
                    item: { include: { category: true } }
                }
            });
            if (resolvedType === 'transfer') {
                await tx.account.update({
                    where: { id: data.accountId },
                    data: { balance: { decrement: absAmount } }
                });
                await tx.account.update({
                    where: { id: data.destinationAccountId },
                    data: { balance: { increment: absAmount } }
                });
            }
            else {
                await tx.account.update({
                    where: { id: data.accountId },
                    data: { balance: { increment: amountBaseNum } }
                });
            }
            if (data.inboxTransactionId) {
                await tx.inboxTransaction.update({
                    where: { id: data.inboxTransactionId },
                    data: { status: 'PROCESSED', transactionId: transaction.id }
                });
            }
            if (data.currencyOriginal !== account.currencyCode && parseFloat(data.exchangeRate) !== 1.0) {
                await tx.parameter.upsert({
                    where: {
                        code_userId: {
                            code: 'LAST_EXCHANGE_RATE',
                            userId
                        }
                    },
                    update: { value: data.exchangeRate },
                    create: { code: 'LAST_EXCHANGE_RATE', userId, value: data.exchangeRate, description: 'Último tipo de cambio ingresado por el usuario' }
                });
            }
            return transaction;
        });
    }
    async update(userId, householdId, transactionId, data) {
        const oldT = await this.prisma.transaction.findFirst({
            where: { id: transactionId, user: { householdId } }
        });
        if (!oldT)
            throw new common_1.NotFoundException(`Transacción no encontrada`);
        if (data.type === 'transfer' && data.accountId === data.destinationAccountId) {
            throw new common_1.BadRequestException(`No puedes transferir a la misma cuenta.`);
        }
        return this.prisma.$transaction(async (tx) => {
            if (oldT.type === 'transfer' && oldT.destinationAccountId) {
                const oldAbs = Math.abs(Number(oldT.amountBase));
                await tx.account.update({
                    where: { id: oldT.accountId },
                    data: { balance: { increment: oldAbs } }
                });
                await tx.account.update({
                    where: { id: oldT.destinationAccountId },
                    data: { balance: { decrement: oldAbs } }
                });
            }
            else {
                await tx.account.update({
                    where: { id: oldT.accountId },
                    data: { balance: { decrement: oldT.amountBase } }
                });
            }
            const newAmountBaseNum = parseFloat(data.amountBase);
            const absAmount = Math.abs(newAmountBaseNum);
            const resType = data.type || oldT.type;
            if (resType === 'transfer') {
                await tx.account.update({
                    where: { id: data.accountId },
                    data: { balance: { decrement: absAmount } }
                });
                await tx.account.update({
                    where: { id: data.destinationAccountId },
                    data: { balance: { increment: absAmount } }
                });
            }
            else {
                await tx.account.update({
                    where: { id: data.accountId },
                    data: { balance: { increment: newAmountBaseNum } }
                });
            }
            const transaction = await tx.transaction.update({
                where: { id: transactionId },
                data: {
                    accountId: data.accountId,
                    destinationAccountId: resType === 'transfer' ? data.destinationAccountId : null,
                    goalId: data.goalId || null,
                    type: resType,
                    itemId: data.itemId || null,
                    projectId: resType === 'transfer' ? null : (data.projectId || null),
                    amountOriginal: parseFloat(data.amountOriginal),
                    currencyOriginal: data.currencyOriginal,
                    exchangeRate: parseFloat(data.exchangeRate),
                    amountBase: resType === 'transfer' ? absAmount : newAmountBaseNum,
                    transactionDate: new Date(data.transactionDate),
                    notes: data.notes || null,
                }
            });
            const account = await tx.account.findUnique({ where: { id: data.accountId } });
            if (account && data.currencyOriginal !== account.currencyCode && parseFloat(data.exchangeRate) !== 1.0) {
                await tx.parameter.upsert({
                    where: {
                        code_userId: {
                            code: 'LAST_EXCHANGE_RATE',
                            userId
                        }
                    },
                    update: { value: data.exchangeRate },
                    create: { code: 'LAST_EXCHANGE_RATE', userId, value: data.exchangeRate, description: 'Último tipo de cambio ingresado por el usuario' }
                });
            }
            return transaction;
        });
    }
    async remove(householdId, transactionId) {
        const oldT = await this.prisma.transaction.findFirst({
            where: { id: transactionId, user: { householdId } }
        });
        if (!oldT)
            throw new common_1.NotFoundException(`La transacción no existe.`);
        return this.prisma.$transaction(async (tx) => {
            if (oldT.type === 'transfer' && oldT.destinationAccountId) {
                const oldAbs = Math.abs(Number(oldT.amountBase));
                await tx.account.update({
                    where: { id: oldT.accountId },
                    data: { balance: { increment: oldAbs } }
                });
                await tx.account.update({
                    where: { id: oldT.destinationAccountId },
                    data: { balance: { decrement: oldAbs } }
                });
            }
            else {
                await tx.account.update({
                    where: { id: oldT.accountId },
                    data: { balance: { decrement: oldT.amountBase } }
                });
            }
            return tx.transaction.delete({
                where: { id: transactionId }
            });
        });
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map