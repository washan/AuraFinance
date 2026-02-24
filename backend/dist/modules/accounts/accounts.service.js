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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AccountsService = class AccountsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(householdId) {
        return this.prisma.account.findMany({
            where: { householdId },
            include: { currency: true },
            orderBy: { name: 'asc' },
        });
    }
    async create(householdId, data) {
        return this.prisma.account.create({
            data: {
                name: data.name,
                type: data.type,
                currencyCode: data.currencyCode,
                balance: data.balance,
                householdId,
            },
            include: { currency: true }
        });
    }
    async update(householdId, id, data) {
        const account = await this.prisma.account.findFirst({
            where: { id, householdId }
        });
        if (!account) {
            throw new common_1.NotFoundException(`La cuenta no fue encontrada.`);
        }
        return this.prisma.account.update({
            where: { id },
            data,
            include: { currency: true }
        });
    }
    async remove(householdId, id) {
        const account = await this.prisma.account.findFirst({
            where: { id, householdId }
        });
        if (!account) {
            throw new common_1.NotFoundException(`La cuenta no fue encontrada.`);
        }
        const linkedTransactions = await this.prisma.transaction.count({
            where: { accountId: id }
        });
        if (linkedTransactions > 0) {
            throw new common_1.ConflictException(`No se puede eliminar la cuenta porque tiene ${linkedTransactions} transacciones. Considera desactivarla o vaciarla primero.`);
        }
        return this.prisma.account.delete({
            where: { id }
        });
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map