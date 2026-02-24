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

@Module({
  imports: [UsersModule, AuthModule, PrismaModule, AccountsModule, TransactionsModule, CurrenciesModule, CategoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
