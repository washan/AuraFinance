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
    async findAll(householdId, accountId, take = 50, skip = 0) {
        const whereClause = {
            user: { householdId }
        };
        if (accountId) {
            whereClause.accountId = accountId;
        }
        return this.prisma.transaction.findMany({
            where: whereClause,
            include: {
                account: { select: { name: true, currencyCode: true } },
                item: { select: { name: true, category: { select: { name: true, icon: true } } } }
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
        if (!account) {
            throw new common_1.NotFoundException(`La cuenta no existe o no pertenece a tu entorno.`);
        }
        return this.prisma.$transaction(async (tx) => {
            const amountBaseNum = parseFloat(data.amountBase);
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    accountId: data.accountId,
                    itemId: data.itemId,
                    projectId: data.projectId,
                    amountOriginal: parseFloat(data.amountOriginal),
                    currencyOriginal: data.currencyOriginal,
                    exchangeRate: parseFloat(data.exchangeRate),
                    amountBase: amountBaseNum,
                    transactionDate: new Date(data.transactionDate),
                    notes: data.notes,
                    status: 'CLASSIFIED'
                },
                include: {
                    account: { select: { name: true, currencyCode: true } },
                    item: { select: { name: true, category: { select: { name: true, icon: true } } } }
                }
            });
            await tx.account.update({
                where: { id: data.accountId },
                data: {
                    balance: {
                        increment: amountBaseNum
                    }
                }
            });
            return transaction;
        });
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map