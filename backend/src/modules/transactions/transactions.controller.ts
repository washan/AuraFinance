import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    create(
        @Req() req: any,
        @Body() body: {
            accountId: string;
            itemId?: string;
            projectId?: string;
            amountOriginal: string; // Recibido como string para ParseFloat
            currencyOriginal: string;
            exchangeRate: string;
            amountBase: string; // El monto convertido final que afecta el balance
            transactionDate: string;
            notes?: string;
        }
    ) {
        return this.transactionsService.create(req.user.id, req.user.householdId, body);
    }

    @Get()
    findAll(
        @Req() req: any,
        @Query('accountId') accountId?: string,
        @Query('take') take?: string,
        @Query('skip') skip?: string
    ) {
        return this.transactionsService.findAll(
            req.user.householdId,
            accountId,
            take ? parseInt(take) : 50,
            skip ? parseInt(skip) : 0
        );
    }

    // @Patch and @Delete will be implemented in subsequent steps to handle balance calculations
}
