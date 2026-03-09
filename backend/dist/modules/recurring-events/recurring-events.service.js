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
var RecurringEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringEventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RecurringEventsService = RecurringEventsService_1 = class RecurringEventsService {
    prisma;
    logger = new common_1.Logger(RecurringEventsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(householdId, dto) {
        return this.prisma.recurringEvent.create({
            data: { ...dto, householdId },
        });
    }
    async findAll(householdId) {
        return this.prisma.recurringEvent.findMany({
            where: { householdId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(householdId, id) {
        const event = await this.prisma.recurringEvent.findFirst({
            where: { id, householdId },
        });
        if (!event)
            throw new common_1.NotFoundException(`Recurring event #${id} not found`);
        return event;
    }
    async update(householdId, id, dto) {
        await this.findOne(householdId, id);
        return this.prisma.recurringEvent.update({
            where: { id },
            data: dto,
        });
    }
    async remove(householdId, id) {
        await this.findOne(householdId, id);
        await this.prisma.inboxTransaction.deleteMany({
            where: { recurringEventId: id, status: 'PENDING' },
        });
        return this.prisma.recurringEvent.delete({ where: { id } });
    }
    async generateDueTransactions() {
        const today = new Date();
        const currentDayOfMonth = today.getDate();
        const currentDayOfWeek = today.getDay();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const events = await this.prisma.recurringEvent.findMany({
            where: { isActive: true },
        });
        let generated = 0;
        for (const event of events) {
            const isDue = this.isDueToday(event, currentDayOfMonth, currentDayOfWeek, currentMonth, today);
            if (!isDue)
                continue;
            const alreadyExists = await this.alreadyGeneratedThisPeriod(event, today);
            if (alreadyExists)
                continue;
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
            await this.prisma.recurringEvent.update({
                where: { id: event.id },
                data: { lastGeneratedAt: today },
            });
            generated++;
            this.logger.log(`Generated inbox tx for recurring event: ${event.name}`);
        }
        return { generated };
    }
    isDueToday(event, dayOfMonth, dayOfWeek, currentMonth, today) {
        switch (event.frequency) {
            case 'monthly':
                return event.dayOfMonth === dayOfMonth;
            case 'weekly':
                return event.dayOfWeek === dayOfWeek;
            case 'biweekly':
                return dayOfMonth === event.dayOfMonth || dayOfMonth === event.dayOfMonth2;
            case 'annually':
                return event.monthOfYear === (currentMonth + 1) && event.dayOfMonth === dayOfMonth;
            default:
                return false;
        }
    }
    async alreadyGeneratedThisPeriod(event, today) {
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
};
exports.RecurringEventsService = RecurringEventsService;
exports.RecurringEventsService = RecurringEventsService = RecurringEventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecurringEventsService);
//# sourceMappingURL=recurring-events.service.js.map