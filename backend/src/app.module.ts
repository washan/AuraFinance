import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { GoalsModule } from './modules/goals/goals.module';
import { InboxModule } from './modules/inbox/inbox.module';
import { InboxRulesModule } from './modules/inbox-rules/inbox-rules.module';
import { RecurringEventsModule } from './modules/recurring-events/recurring-events.module';
import { ParametersModule } from './modules/parameters/parameters.module';
import { BackupModule } from './modules/backup/backup.module';

@Module({
  imports: [UsersModule, AuthModule, PrismaModule, AccountsModule, TransactionsModule, CurrenciesModule, CategoriesModule, DashboardModule, ProjectsModule, GoalsModule, InboxModule, InboxRulesModule, RecurringEventsModule, ParametersModule, BackupModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
