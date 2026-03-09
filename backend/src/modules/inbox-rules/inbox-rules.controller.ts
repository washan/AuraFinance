import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { InboxRulesService } from './inbox-rules.service';
import { CreateInboxRuleDto } from './dto/create-inbox-rule.dto';
import { UpdateInboxRuleDto } from './dto/update-inbox-rule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inbox-rules')
@UseGuards(JwtAuthGuard)
export class InboxRulesController {
    constructor(private readonly inboxRulesService: InboxRulesService) { }

    @Post()
    create(@Request() req: any, @Body() createInboxRuleDto: CreateInboxRuleDto) {
        return this.inboxRulesService.create(req.user.householdId, createInboxRuleDto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.inboxRulesService.findAll(req.user.householdId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.inboxRulesService.findOne(req.user.householdId, id);
    }

    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() updateInboxRuleDto: UpdateInboxRuleDto) {
        return this.inboxRulesService.update(req.user.householdId, id, updateInboxRuleDto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.inboxRulesService.remove(req.user.householdId, id);
    }
}
