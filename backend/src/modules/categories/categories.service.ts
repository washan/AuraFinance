import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    // --- CATEGORIES ---

    async findAllCategories(householdId: string) {
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

    async createCategory(householdId: string, data: { name: string; icon?: string }) {
        return this.prisma.category.create({
            data: {
                ...data,
                householdId,
            }
        });
    }

    async updateCategory(householdId: string, categoryId: string, data: { name?: string; icon?: string }) {
        const category = await this.prisma.category.findFirst({
            where: { id: categoryId, householdId }
        });

        if (!category) {
            throw new NotFoundException('Categoría no encontrada');
        }

        return this.prisma.category.update({
            where: { id: categoryId },
            data,
        });
    }

    async deleteCategory(householdId: string, categoryId: string) {
        const category = await this.prisma.category.findFirst({
            where: { id: categoryId, householdId },
            include: { _count: { select: { items: true, budgets: true } } }
        });

        if (!category) {
            throw new NotFoundException('Categoría no encontrada');
        }

        if (category._count.items > 0 || category._count.budgets > 0) {
            throw new ConflictException('No se puede eliminar la categoría porque tiene elementos o presupuestos asociados.');
        }

        return this.prisma.category.delete({
            where: { id: categoryId }
        });
    }

    // --- ITEMS ---

    async createItem(householdId: string, categoryId: string, data: { name: string }) {
        const category = await this.prisma.category.findFirst({
            where: { id: categoryId, householdId }
        });

        if (!category) {
            throw new NotFoundException('Categoría no encontrada');
        }

        return this.prisma.item.create({
            data: {
                name: data.name,
                categoryId,
            }
        });
    }

    async updateItem(householdId: string, categoryId: string, itemId: string, data: { name: string }) {
        const item = await this.prisma.item.findFirst({
            where: { id: itemId, categoryId, category: { householdId } }
        });

        if (!item) {
            throw new NotFoundException('Ítem no encontrado');
        }

        return this.prisma.item.update({
            where: { id: itemId },
            data,
        });
    }

    async deleteItem(householdId: string, categoryId: string, itemId: string) {
        const item = await this.prisma.item.findFirst({
            where: { id: itemId, categoryId, category: { householdId } },
            include: { _count: { select: { transactions: true } } }
        });

        if (!item) {
            throw new NotFoundException('Ítem no encontrado');
        }

        if (item._count.transactions > 0) {
            throw new ConflictException('No se puede eliminar el ítem porque tiene transacciones asociadas.');
        }

        return this.prisma.item.delete({
            where: { id: itemId }
        });
    }
}
