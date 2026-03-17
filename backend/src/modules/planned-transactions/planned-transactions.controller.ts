import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, HttpException, HttpStatus } from '@nestjs/common';
import { PlannedTransactionsService } from './planned-transactions.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('planned-transactions')
@UseGuards(AuthGuard('jwt'))
export class PlannedTransactionsController {
  constructor(private readonly plannedTransactionsService: PlannedTransactionsService) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    try {
      return await this.plannedTransactionsService.create(req.user.userId, req.user.householdId, body);
    } catch (error: any) {
      console.error('CREATE PLANNED TX ERROR:', error);
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('month') month?: string,
    @Query('status') status?: string
  ) {
    return this.plannedTransactionsService.findAll(req.user.userId, req.user.householdId, month, status);
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    try {
      return await this.plannedTransactionsService.update(req.user.userId, req.user.householdId, id, body);
    } catch (error: any) {
      console.error('UPDATE PLANNED TX ERROR:', error);
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.plannedTransactionsService.remove(req.user.householdId, id);
    } catch (error: any) {
      console.error('DELETE PLANNED TX ERROR:', error);
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/realize')
  async realize(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    try {
      return await this.plannedTransactionsService.realize(req.user.userId, req.user.householdId, id, body);
    } catch (error: any) {
      console.error('REALIZE PLANNED TX ERROR:', error);
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
