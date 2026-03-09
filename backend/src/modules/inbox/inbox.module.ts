import { Module } from '@nestjs/common';
import { InboxController } from './inbox.controller';
import { InboxService } from './inbox.service';
import { ImapService } from './services/imap.service';
import { ParserService } from './services/parser.service';
import { InboxCronService } from './cron/inbox.cron';
import { PrismaModule } from '../../prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { InboxRulesModule } from '../inbox-rules/inbox-rules.module';
import { RecurringEventsModule } from '../recurring-events/recurring-events.module';

@Module({
    imports: [PrismaModule, ScheduleModule.forRoot(), InboxRulesModule, RecurringEventsModule],
    controllers: [InboxController],
    providers: [InboxService, ImapService, ParserService, InboxCronService],
    exports: [InboxService],
})
export class InboxModule { }
