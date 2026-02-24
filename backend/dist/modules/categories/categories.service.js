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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllCategories(householdId) {
        return this.prisma.category.findMany({
            where: { householdId },
            include: {
                items: {
                    orderBy: { name: 'asc' }
                }
            },
            orderBy: { name: 'asc' },
        });
    }
    async createCategory(householdId, data) {
        return this.prisma.category.create({
            data: {
                ...data,
                householdId,
            }
        });
    }
    async updateCategory(householdId, categoryId, data) {
        const category = await this.prisma.category.findFirst({
            where: { id: categoryId, householdId }
        });
        if (!category) {
            throw new common_1.NotFoundException('Categoría no encontrada');
        }
        return this.prisma.category.update({
            where: { id: categoryId },
            data,
        });
    }
    async deleteCategory(householdId, categoryId) {
        const category = await this.prisma.category.findFirst({
            where: { id: categoryId, householdId },
            include: { _count: { select: { items: true, budgets: true } } }
        });
        if (!category) {
            throw new common_1.NotFoundException('Categoría no encontrada');
        }
        if (category._count.items > 0 || category._count.budgets > 0) {
            throw new common_1.ConflictException('No se puede eliminar la categoría porque tiene elementos o presupuestos asociados.');
        }
        return this.prisma.category.delete({
            where: { id: categoryId }
        });
    }
    async createItem(householdId, categoryId, data) {
        const category = await this.prisma.category.findFirst({
            where: { id: categoryId, householdId }
        });
        if (!category) {
            throw new common_1.NotFoundException('Categoría no encontrada');
        }
        return this.prisma.item.create({
            data: {
                name: data.name,
                categoryId,
            }
        });
    }
    async updateItem(householdId, categoryId, itemId, data) {
        const item = await this.prisma.item.findFirst({
            where: { id: itemId, categoryId, category: { householdId } }
        });
        if (!item) {
            throw new common_1.NotFoundException('Ítem no encontrado');
        }
        return this.prisma.item.update({
            where: { id: itemId },
            data,
        });
    }
    async deleteItem(householdId, categoryId, itemId) {
        const item = await this.prisma.item.findFirst({
            where: { id: itemId, categoryId, category: { householdId } },
            include: { _count: { select: { transactions: true } } }
        });
        if (!item) {
            throw new common_1.NotFoundException('Ítem no encontrado');
        }
        if (item._count.transactions > 0) {
            throw new common_1.ConflictException('No se puede eliminar el ítem porque tiene transacciones asociadas.');
        }
        return this.prisma.item.delete({
            where: { id: itemId }
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map