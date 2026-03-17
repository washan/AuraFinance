import { Module } from '@nestjs/common';
import { PlannedTransactionsService } from './planned-transactions.service';
import { PlannedTransactionsController } from './planned-transactions.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [PrismaModule, TransactionsModule],
  controllers: [PlannedTransactionsController],
  providers: [PlannedTransactionsService],
})
export class PlannedTransactionsModule {}
