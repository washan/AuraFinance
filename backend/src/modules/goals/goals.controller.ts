import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
    constructor(private readonly goalsService: GoalsService) { }

    @Get()
    findAll(@Req() req: any) {
        return this.goalsService.findAll(req.user.householdId);
    }

    @Post()
    create(@Req() req: any, @Body() data: { title: string; description?: string; targetAmount?: number; targetDate?: string }) {
        return this.goalsService.create(req.user.householdId, data);
    }

    @Patch(':id')
    update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
        return this.goalsService.update(req.user.householdId, id, data);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.goalsService.remove(req.user.householdId, id);
    }
}
