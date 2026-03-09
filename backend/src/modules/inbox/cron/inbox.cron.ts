import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ImapService } from '../services/imap.service';
import { RecurringEventsService } from '../../recurring-events/recurring-events.service';

@Injectable()
export class InboxCronService {
    private readonly logger = new Logger(InboxCronService.name);

    constructor(
        private readonly imapService: ImapService,
        private readonly recurringEventsService: RecurringEventsService
    ) { }

    // Se ejecutará cada 30 minutos
    @Cron(CronExpression.EVERY_30_MINUTES)
    async handleCron() {
        this.logger.log('Executing IMAP Sync Cron Job');
        try {
            await this.imapService.syncAllActiveConnections();
        } catch (e) {
            this.logger.error('CRON IMAP Sync failed', e);
        }
    }

    // Se ejecutará diariamente a las 6:00 AM
    @Cron('0 6 * * *')
    async handleRecurringEvents() {
        this.logger.log('Executing Recurring Events Cron Job');
        try {
            const result = await this.recurringEventsService.generateDueTransactions();
            this.logger.log(`Recurring events CRON finished. Generated: ${result.generated}`);
        } catch (e) {
            this.logger.error('Recurring Events CRON failed', e);
        }
    }
}
