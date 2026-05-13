import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { ParametersModule } from '../parameters/parameters.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [ParametersModule, PrismaModule],
    providers: [WhatsAppService],
    controllers: [WhatsAppController],
    exports: [WhatsAppService],
})
export class WhatsAppModule {}
