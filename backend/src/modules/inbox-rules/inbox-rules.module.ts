import { Module } from '@nestjs/common';
import { InboxRulesService } from './inbox-rules.service';
import { InboxRulesController } from './inbox-rules.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [InboxRulesController],
    providers: [InboxRulesService],
    exports: [InboxRulesService],
})
export class InboxRulesModule { }
