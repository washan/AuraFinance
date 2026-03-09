import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BackupService {
    constructor(private prisma: PrismaService) { }

    async exportData(userId: string, householdId: string) {
        const [
            user,
            currencies,
            categories,
            accounts,
            projects,
            goals,
            budgets,
            inboxRules,
            recurringEvents,
            parameters,
            transactions
        ] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: userId } }),
            this.prisma.currency.findMany({ where: { householdId } }),
            this.prisma.category.findMany({ where: { householdId }, include: { items: true } }),
            this.prisma.account.findMany({ where: { householdId } }),
            this.prisma.project.findMany({ where: { householdId } }),
            this.prisma.goal.findMany({ where: { householdId }, include: { tasks: true } }),
            this.prisma.budget.findMany({ where: { householdId } }),
            this.prisma.inboxRule.findMany({ where: { householdId } }),
            this.prisma.recurringEvent.findMany({ where: { householdId } }),
            this.prisma.parameter.findMany({ where: { userId } }),
            this.prisma.transaction.findMany({ where: { user: { householdId } } })
        ]);

        return {
            backupDate: new Date().toISOString(),
            version: '1.0',
            data: {
                user, // Needed for simple reference if restoring to a fresh environment
                currencies,
                categories,
                accounts,
                projects,
                goals,
                budgets,
                inboxRules,
                recurringEvents,
                parameters,
                transactions
            }
        };
    }

    async importData(userId: string, householdId: string, backupData: any) {
        if (!backupData || backupData.version !== '1.0' || !backupData.data) {
            throw new BadRequestException('Formato de backup inválido o versión no soportada.');
        }

        const data = backupData.data;

        return this.prisma.$transaction(async (tx) => {
            // 1. Wipe Phase - Delete in reverse dependency order
            await tx.transaction.deleteMany({ where: { user: { householdId } } });
            await tx.inboxRule.deleteMany({ where: { householdId } });
            await tx.recurringEvent.deleteMany({ where: { householdId } });
            await tx.budget.deleteMany({ where: { householdId } });
            await tx.goalTask.deleteMany({ where: { goal: { householdId } } });
            await tx.goal.deleteMany({ where: { householdId } });
            await tx.project.deleteMany({ where: { householdId } });
            await tx.item.deleteMany({ where: { category: { householdId } } });
            await tx.category.deleteMany({ where: { householdId } });
            await tx.account.deleteMany({ where: { householdId } });
            // Cannot delete currencies easily if they have defaults, but we assume we overwrite them
            await tx.currency.deleteMany({ where: { householdId } });
            await tx.parameter.deleteMany({ where: { userId } });

            // 2. Insert Phase - Insert in forward dependency order
            // Note: We bypass `createMany` restrictions by mapping and awaiting, 
            // but prisma `createMany` is faster where available. We use createMany for simplicity.

            if (data.currencies?.length) {
                await tx.currency.createMany({ data: data.currencies });
            }
            if (data.categories?.length) {
                const cats = data.categories.map((c: any) => {
                    const { items, ...rest } = c;
                    return rest;
                });
                await tx.category.createMany({ data: cats });

                const items = data.categories.flatMap((c: any) => c.items || []);
                if (items.length) {
                    await tx.item.createMany({ data: items });
                }
            }
            if (data.accounts?.length) {
                await tx.account.createMany({ data: data.accounts });
            }
            if (data.projects?.length) {
                await tx.project.createMany({ data: data.projects });
            }
            if (data.goals?.length) {
                const goals = data.goals.map((g: any) => {
                    const { tasks, ...rest } = g;
                    return rest;
                });
                await tx.goal.createMany({ data: goals });

                const tasks = data.goals.flatMap((g: any) => g.tasks || []);
                if (tasks.length) {
                    await tx.goalTask.createMany({ data: tasks });
                }
            }
            if (data.budgets?.length) {
                await tx.budget.createMany({ data: data.budgets });
            }
            if (data.inboxRules?.length) {
                await tx.inboxRule.createMany({ data: data.inboxRules });
            }
            if (data.recurringEvents?.length) {
                await tx.recurringEvent.createMany({ data: data.recurringEvents });
            }
            if (data.parameters?.length) {
                await tx.parameter.createMany({ data: data.parameters });
            }
            if (data.transactions?.length) {
                await tx.transaction.createMany({ data: data.transactions });
            }

            return { message: 'Restauración completada con éxito.' };
        });
    }
}
