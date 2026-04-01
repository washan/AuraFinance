import { Controller, Get, Post, Body, Req, UseGuards, Param, Delete, Put } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentTransactionDto } from './dto/create-investment.dto';
import { UpdateInvestmentTransactionDto } from './dto/update-investment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('investments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Get('portfolio')
  @ApiOperation({ summary: 'Get user investment portfolio' })
  getPortfolio(@Req() req: any) {
    return this.investmentsService.getPortfolio(req.user.householdId);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Add a new investment transaction' })
  createTransaction(@Req() req: any, @Body() dto: CreateInvestmentTransactionDto) {
    return this.investmentsService.createTransaction(req.user.householdId, req.user.userId, dto);
  }

  @Get('ai-insights')
  @ApiOperation({ summary: 'Get AI analysis of the portfolio' })
  getAiInsights(@Req() req: any) {
    return this.investmentsService.getAiInsights(req.user.householdId, req.user.userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List all investment transactions' })
  getTransactions(@Req() req: any) {
    return this.investmentsService.getTransactions(req.user.householdId);
  }

  @Put('transactions/:id')
  @ApiOperation({ summary: 'Update an investment transaction' })
  updateTransaction(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateInvestmentTransactionDto
  ) {
    return this.investmentsService.updateTransaction(req.user.householdId, id, dto);
  }

  @Delete('transactions/:id')
  @ApiOperation({ summary: 'Delete an investment transaction' })
  deleteTransaction(@Req() req: any, @Param('id') id: string) {
    return this.investmentsService.deleteTransaction(req.user.householdId, id);
  }
}
