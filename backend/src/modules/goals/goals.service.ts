import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GoalsService {
    constructor(private prisma: PrismaService) { }

    async findAll(householdId: string) {
        // Fetch goals with all their transactions to compute the current amount
        const goals = await this.prisma.goal.findMany({
            where: { householdId },
            include: {
                transactions: true, // We will use this to compute total savings
            },
            orderBy: { title: 'asc' }
        });

        // Map through goals and sum up the 'transfer' transactions 
        // that are linked to this goal. If money went TO the goal (how do we know? Wait, transfer is between accounts.
        // Actually, ANY transaction linked to the goal just adds or subtracts to the goal.)
        // But let's verify how we calculate the goal progress. We'll simply sum all amounts (positive or negative) of transactions tied to this goalId.
        return goals.map(g => {
            const currentAmount = g.transactions.reduce((acc, t) => {
                const amt = Number(t.amountBase);
                // For expense goals, amounts are negative (expenses), so use absolute value
                if (g.type === 'expense') {
                    return acc + Math.abs(amt);
                }
                // For savings goals, amounts are positive (transfers)
                return acc + amt;
            }, 0);

            const { transactions, ...goalData } = g;
            return {
                ...goalData,
                currentAmount
            };
        });
    }

    async create(householdId: string, data: { title: string; description?: string; type?: string; targetAmount?: number; targetDate?: string }) {
        return this.prisma.goal.create({
            data: {
                householdId,
                title: data.title,
                description: data.description,
                type: data.type || 'savings',
                targetAmount: data.targetAmount,
                targetDate: data.targetDate ? new Date(data.targetDate) : null,
            }
        });
    }

    async update(householdId: string, id: string, data: any) {
        if (data.targetDate) data.targetDate = new Date(data.targetDate);
        const goal = await this.prisma.goal.findFirst({ where: { id, householdId } });
        if (!goal) throw new NotFoundException('La meta no existe.');

        return this.prisma.goal.update({
            where: { id },
            data
        });
    }

    async remove(householdId: string, id: string) {
        const goal = await this.prisma.goal.findFirst({ where: { id, householdId } });
        if (!goal) throw new NotFoundException('La meta no existe.');

        // Unlink transactions from this goal before deleting (or cascade, but safe is to unlink)
        await this.prisma.transaction.updateMany({
            where: { goalId: id, user: { householdId } },
            data: { goalId: null }
        });

        return this.prisma.goal.delete({
            where: { id }
        });
    }
}
