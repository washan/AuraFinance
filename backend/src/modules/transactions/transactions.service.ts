import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    async findAll(householdId: string, accountId?: string, take: number = 50, skip: number = 0) {
        const whereClause: any = {
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

    async create(
        userId: string,
        householdId: string,
        data: {
            accountId: string;
            itemId?: string;
            projectId?: string;
            amountOriginal: string;
            currencyOriginal: string;
            exchangeRate: string;
            amountBase: string;
            transactionDate: string;
            notes?: string;
        }
    ) {
        // Validate account belongs to household
        const account = await this.prisma.account.findFirst({
            where: { id: data.accountId, householdId }
        });

        if (!account) {
            throw new NotFoundException(`La cuenta no existe o no pertenece a tu entorno.`);
        }

        // We use Prisma Transactions to ensure atomicity (both the tx is created AND balance updated)
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

            // Update account balance
            // If amountBase is negative (expense), this subtracts. If positive (income), adds.
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
}
