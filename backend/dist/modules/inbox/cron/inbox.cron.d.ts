import { ImapService } from '../services/imap.service';
import { RecurringEventsService } from '../../recurring-events/recurring-events.service';
export declare class InboxCronService {
    private readonly imapService;
    private readonly recurringEventsService;
    private readonly logger;
    constructor(imapService: ImapService, recurringEventsService: RecurringEventsService);
    handleCron(): Promise<void>;
    handleRecurringEvents(): Promise<void>;
}
