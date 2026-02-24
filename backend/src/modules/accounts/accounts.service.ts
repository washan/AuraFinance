import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccountsService {
    constructor(private prisma: PrismaService) { }

    async findAll(householdId: string) {
        return this.prisma.account.findMany({
            where: { householdId },
            include: { currency: true },
            orderBy: { name: 'asc' },
        });
    }

    async create(householdId: string, data: { name: string; type: string; currencyCode: string; balance: number }) {
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

    async update(householdId: string, id: string, data: { name?: string; type?: string; currencyCode?: string; balance?: number }) {
        const account = await this.prisma.account.findFirst({
            where: { id, householdId }
        });

        if (!account) {
            throw new NotFoundException(`La cuenta no fue encontrada.`);
        }

        return this.prisma.account.update({
            where: { id },
            data,
            include: { currency: true }
        });
    }

    async remove(householdId: string, id: string) {
        const account = await this.prisma.account.findFirst({
            where: { id, householdId }
        });

        if (!account) {
            throw new NotFoundException(`La cuenta no fue encontrada.`);
        }

        const linkedTransactions = await this.prisma.transaction.count({
            where: { accountId: id }
        });

        if (linkedTransactions > 0) {
            throw new ConflictException(`No se puede eliminar la cuenta porque tiene ${linkedTransactions} transacciones. Considera desactivarla o vaciarla primero.`);
        }

        return this.prisma.account.delete({
            where: { id }
        });
    }
}
