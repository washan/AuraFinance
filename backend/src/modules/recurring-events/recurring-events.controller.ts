import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { RecurringEventsService } from './recurring-events.service';
import { CreateRecurringEventDto } from './dto/create-recurring-event.dto';
import { UpdateRecurringEventDto } from './dto/update-recurring-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recurring-events')
@UseGuards(JwtAuthGuard)
export class RecurringEventsController {
    constructor(private readonly service: RecurringEventsService) { }

    @Post()
    create(@Request() req: any, @Body() dto: CreateRecurringEventDto) {
        return this.service.create(req.user.householdId, dto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.service.findAll(req.user.householdId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.service.findOne(req.user.householdId, id);
    }

    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateRecurringEventDto) {
        return this.service.update(req.user.householdId, id, dto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.service.remove(req.user.householdId, id);
    }

    // Manual trigger for generating due transactions (useful for testing)
    @Post('generate')
    generateDue() {
        return this.service.generateDueTransactions();
    }
}
