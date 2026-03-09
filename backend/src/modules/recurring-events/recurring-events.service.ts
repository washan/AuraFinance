import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecurringEventDto } from './dto/create-recurring-event.dto';
import { UpdateRecurringEventDto } from './dto/update-recurring-event.dto';

@Injectable()
export class RecurringEventsService {
    private readonly logger = new Logger(RecurringEventsService.name);

    constructor(private prisma: PrismaService) { }

    async create(householdId: string, dto: CreateRecurringEventDto) {
        return this.prisma.recurringEvent.create({
            data: { ...dto, householdId },
        });
    }

    async findAll(householdId: string) {
        return this.prisma.recurringEvent.findMany({
            where: { householdId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(householdId: string, id: string) {
        const event = await this.prisma.recurringEvent.findFirst({
            where: { id, householdId },
        });
        if (!event) throw new NotFoundException(`Recurring event #${id} not found`);
        return event;
    }

    async update(householdId: string, id: string, dto: UpdateRecurringEventDto) {
        await this.findOne(householdId, id);
        return this.prisma.recurringEvent.update({
            where: { id },
            data: dto,
        });
    }

    async remove(householdId: string, id: string) {
        await this.findOne(householdId, id);
        // Delete associated inbox transactions first
        await this.prisma.inboxTransaction.deleteMany({
            where: { recurringEventId: id, status: 'PENDING' },
        });
        return this.prisma.recurringEvent.delete({ where: { id } });
    }

    /**
     * Check all active recurring events and generate InboxTransactions for those due today.
     * Called by the CRON job daily.
     */
    async generateDueTransactions() {
        const today = new Date();
        const currentDayOfMonth = today.getDate();
        const currentDayOfWeek = today.getDay(); // 0=Sun
        const currentMonth = today.getMonth(); // 0-based
        const currentYear = today.getFullYear();

        const events = await this.prisma.recurringEvent.findMany({
            where: { isActive: true },
        });

        let generated = 0;

        for (const event of events) {
            const isDue = this.isDueToday(event, currentDayOfMonth, currentDayOfWeek, currentMonth, today);
            if (!isDue) continue;

            // Check if we already generated for this period
            const alreadyExists = await this.alreadyGeneratedThisPeriod(event, today);
            if (alreadyExists) continue;

            // Create InboxTransaction
            await this.prisma.inboxTransaction.create({
                data: {
                    source: 'RECURRING',
                    recurringEventId: event.id,
                    sourceId: `recurring-${event.id}-${currentYear}-${currentMonth + 1}-${currentDayOfMonth}`,
                    date: today,
                    merchant: event.merchant,
                    amount: event.amount,
                    currency: event.currency,
                    accountInfo: event.accountInfo,
                    transactionType: 'RECURRENTE',
                    status: 'PENDING',
                },
            });

            // Update lastGeneratedAt
            await this.prisma.recurringEvent.update({
                where: { id: event.id },
                data: { lastGeneratedAt: today },
            });

            generated++;
            this.logger.log(`Generated inbox tx for recurring event: ${event.name}`);
        }

        return { generated };
    }

    private isDueToday(
        event: any,
        dayOfMonth: number,
        dayOfWeek: number,
        currentMonth: number,
        today: Date
    ): boolean {
        switch (event.frequency) {
            case 'monthly':
                return event.dayOfMonth === dayOfMonth;

            case 'weekly':
                return event.dayOfWeek === dayOfWeek;

            case 'biweekly':
                // Two explicit days per month (e.g., 1 and 15)
                return dayOfMonth === event.dayOfMonth || dayOfMonth === event.dayOfMonth2;

            case 'annually':
                // Check both month (1-12) and day
                return event.monthOfYear === (currentMonth + 1) && event.dayOfMonth === dayOfMonth;

            default:
                return false;
        }
    }

    private async alreadyGeneratedThisPeriod(event: any, today: Date): Promise<boolean> {
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const existing = await this.prisma.inboxTransaction.findFirst({
            where: {
                recurringEventId: event.id,
                date: { gte: startOfDay, lt: endOfDay },
            },
        });

        return !!existing;
    }
}
