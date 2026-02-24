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
exports.CurrenciesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CurrenciesService = class CurrenciesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(householdId) {
        return this.prisma.currency.findMany({
            where: { householdId },
            orderBy: { code: 'asc' },
        });
    }
    async create(householdId, data) {
        const existing = await this.prisma.currency.findFirst({
            where: { householdId, code: data.code.toUpperCase() }
        });
        if (existing) {
            throw new common_1.ConflictException(`La moneda ${data.code} ya existe en esta familia.`);
        }
        if (data.isLocalBase) {
            await this.prisma.currency.updateMany({
                where: { householdId, isLocalBase: true },
                data: { isLocalBase: false }
            });
        }
        return this.prisma.currency.create({
            data: {
                code: data.code.toUpperCase(),
                householdId,
                isLocalBase: data.isLocalBase ?? false,
                isActive: data.isActive ?? true,
            },
        });
    }
    async update(householdId, code, data) {
        const currency = await this.prisma.currency.findFirst({
            where: { householdId, code: code.toUpperCase() }
        });
        if (!currency) {
            throw new common_1.NotFoundException(`La moneda ${code} no fue encontrada.`);
        }
        if (data.isLocalBase) {
            await this.prisma.currency.updateMany({
                where: { householdId, isLocalBase: true },
                data: { isLocalBase: false }
            });
        }
        return this.prisma.currency.update({
            where: { code: code.toUpperCase() },
            data,
        });
    }
    async remove(householdId, code) {
        const currency = await this.prisma.currency.findFirst({
            where: { householdId, code: code.toUpperCase() }
        });
        if (!currency) {
            throw new common_1.NotFoundException(`La moneda ${code} no fue encontrada.`);
        }
        const linkedAccounts = await this.prisma.account.count({
            where: { householdId, currencyCode: code.toUpperCase() }
        });
        if (linkedAccounts > 0) {
            throw new common_1.ConflictException(`No se puede eliminar la moneda porque hay ${linkedAccounts} cuentas asociadas. Considérala marcarla como inactiva.`);
        }
        return this.prisma.currency.delete({
            where: { code: code.toUpperCase() }
        });
    }
};
exports.CurrenciesService = CurrenciesService;
exports.CurrenciesService = CurrenciesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CurrenciesService);
//# sourceMappingURL=currencies.service.js.map