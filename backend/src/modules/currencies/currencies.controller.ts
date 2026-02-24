import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('currencies')
@UseGuards(AuthGuard('jwt'))
export class CurrenciesController {
    constructor(private readonly currenciesService: CurrenciesService) { }

    @Post()
    create(@Req() req: any, @Body() createCurrencyDto: { code: string; isLocalBase?: boolean; isActive?: boolean }) {
        return this.currenciesService.create(req.user.householdId, createCurrencyDto);
    }

    @Get()
    findAll(@Req() req: any) {
        return this.currenciesService.findAll(req.user.householdId);
    }

    @Patch(':code')
    update(
        @Req() req: any,
        @Param('code') code: string,
        @Body() updateCurrencyDto: { isLocalBase?: boolean; isActive?: boolean }
    ) {
        return this.currenciesService.update(req.user.householdId, code, updateCurrencyDto);
    }

    @Delete(':code')
    remove(@Req() req: any, @Param('code') code: string) {
        return this.currenciesService.remove(req.user.householdId, code);
    }
}
