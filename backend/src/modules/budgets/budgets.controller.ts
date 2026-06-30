import { Controller, Get, Post, Body, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  getBudgetSummary(@Req() req: any, @Query('period') period: string) {
    if (!period) {
      throw new BadRequestException('El parámetro period es requerido (MM-YYYY)');
    }
    return this.budgetsService.getBudgetSummary(req.user.householdId, period);
  }

  @Post()
  upsertBudget(@Req() req: any, @Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.upsertBudget(req.user.householdId, createBudgetDto);
  }
}
