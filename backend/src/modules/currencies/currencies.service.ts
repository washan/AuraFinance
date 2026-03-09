import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CurrenciesService {
    constructor(private prisma: PrismaService) { }

    async findAll(householdId: string) {
        return this.prisma.currency.findMany({
            where: { householdId },
            orderBy: { code: 'asc' },
        });
    }

    async create(householdId: string, data: { code: string; isLocalBase?: boolean; isActive?: boolean; symbol?: string }) {
        const existing = await this.prisma.currency.findFirst({
            where: { householdId, code: data.code.toUpperCase() }
        });

        if (existing) {
            throw new ConflictException(`La moneda ${data.code} ya existe en esta familia.`);
        }

        // If this is set as local base, unset others
        if (data.isLocalBase) {
            await this.prisma.currency.updateMany({
                where: { householdId, isLocalBase: true },
                data: { isLocalBase: false }
            });
        }

        return this.prisma.currency.create({
            data: {
                code: data.code.toUpperCase(),
                symbol: data.symbol || '$',
                householdId,
                isLocalBase: data.isLocalBase ?? false,
                isActive: data.isActive ?? true,
            },
        });
    }

    async update(householdId: string, code: string, data: { isLocalBase?: boolean; isActive?: boolean; symbol?: string }) {
        const currency = await this.prisma.currency.findFirst({
            where: { householdId, code: code.toUpperCase() }
        });

        if (!currency) {
            throw new NotFoundException(`La moneda ${code} no fue encontrada.`);
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

    async remove(householdId: string, code: string) {
        const currency = await this.prisma.currency.findFirst({
            where: { householdId, code: code.toUpperCase() }
        });

        if (!currency) {
            throw new NotFoundException(`La moneda ${code} no fue encontrada.`);
        }

        // Check if there are accounts using this currency
        const linkedAccounts = await this.prisma.account.count({
            where: { householdId, currencyCode: code.toUpperCase() }
        });

        if (linkedAccounts > 0) {
            throw new ConflictException(`No se puede eliminar la moneda porque hay ${linkedAccounts} cuentas asociadas. Considérala marcarla como inactiva.`);
        }

        return this.prisma.currency.delete({
            where: { code: code.toUpperCase() }
        });
    }
}
