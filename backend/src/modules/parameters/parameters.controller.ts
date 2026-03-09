import { Controller, Get, Param, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ParametersService } from './parameters.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('parameters')
@UseGuards(JwtAuthGuard)
export class ParametersController {
    constructor(private readonly parametersService: ParametersService) { }

    @Get()
    async getAllParameters(@Request() req: any) {
        return this.parametersService.getAllParameters(req.user.userId);
    }

    @Get(':code')
    async getParameter(@Request() req: any, @Param('code') code: string) {
        return this.parametersService.getParameter(req.user.userId, code);
    }

    @Patch(':code')
    async updateParameter(
        @Request() req: any,
        @Param('code') code: string,
        @Body('value') value: string,
        @Body('description') description?: string,
    ) {
        return this.parametersService.upsertParameter(req.user.userId, code, value, description);
    }
}
