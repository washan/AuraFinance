import { Module } from '@nestjs/common';
import { RecurringEventsController } from './recurring-events.controller';
import { RecurringEventsService } from './recurring-events.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [RecurringEventsController],
    providers: [RecurringEventsService],
    exports: [RecurringEventsService],
})
export class RecurringEventsModule { }
