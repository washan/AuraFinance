import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('accounts')
@UseGuards(AuthGuard('jwt'))
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) { }

    @Post()
    create(
        @Req() req: any,
        @Body() body: { name: string; type: string; currencyCode: string; balance: number }
    ) {
        return this.accountsService.create(req.user.householdId, body);
    }

    @Get()
    findAll(@Req() req: any) {
        return this.accountsService.findAll(req.user.householdId);
    }

    @Patch(':id')
    update(
        @Req() req: any,
        @Param('id') id: string,
        @Body() body: { name?: string; type?: string; currencyCode?: string; balance?: number }
    ) {
        return this.accountsService.update(req.user.householdId, id, body);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.accountsService.remove(req.user.householdId, id);
    }
}
