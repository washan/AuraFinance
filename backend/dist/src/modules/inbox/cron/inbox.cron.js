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
var InboxCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboxCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const imap_service_1 = require("../services/imap.service");
const recurring_events_service_1 = require("../../recurring-events/recurring-events.service");
let InboxCronService = InboxCronService_1 = class InboxCronService {
    imapService;
    recurringEventsService;
    logger = new common_1.Logger(InboxCronService_1.name);
    constructor(imapService, recurringEventsService) {
        this.imapService = imapService;
        this.recurringEventsService = recurringEventsService;
    }
    async handleCron() {
        this.logger.log('Executing IMAP Sync Cron Job');
        try {
            await this.imapService.syncAllActiveConnections();
        }
        catch (e) {
            this.logger.error('CRON IMAP Sync failed', e);
        }
    }
    async handleRecurringEvents() {
        this.logger.log('Executing Recurring Events Cron Job');
        try {
            const result = await this.recurringEventsService.generateDueTransactions();
            this.logger.log(`Recurring events CRON finished. Generated: ${result.generated}`);
        }
        catch (e) {
            this.logger.error('Recurring Events CRON failed', e);
        }
    }
};
exports.InboxCronService = InboxCronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InboxCronService.prototype, "handleCron", null);
__decorate([
    (0, schedule_1.Cron)('0 6 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InboxCronService.prototype, "handleRecurringEvents", null);
exports.InboxCronService = InboxCronService = InboxCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [imap_service_1.ImapService,
        recurring_events_service_1.RecurringEventsService])
], InboxCronService);
//# sourceMappingURL=inbox.cron.js.map