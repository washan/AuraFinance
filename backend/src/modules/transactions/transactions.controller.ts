import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, HttpException, HttpStatus } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '@nestjs/passport';
import * as fs from 'fs';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    async create(
        @Req() req: any,
        @Body() body: any
    ) {
        try {
            return await this.transactionsService.create(req.user.userId, req.user.householdId, body);
        } catch (error: any) {
            fs.writeFileSync('debug.txt', JSON.stringify({ message: error.message, stack: error.stack, error }, null, 2));
            console.error('CREATE TRANSACTION ERROR:', error);
            throw new HttpException(
                error.message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get()
    findAll(
        @Req() req: any,
        @Query('accountId') accountId?: string,
        @Query('projectId') projectId?: string,
        @Query('month') month?: string,
        @Query('take') take?: string,
        @Query('skip') skip?: string
    ) {
        return this.transactionsService.findAll(
            req.user.householdId,
            accountId,
            projectId,
            month,
            take ? parseInt(take) : (month ? 500 : 50),
            skip ? parseInt(skip) : 0
        );
    }

    @Patch(':id')
    async update(
        @Req() req: any,
        @Param('id') id: string,
        @Body() body: any
    ) {
        try {
            return await this.transactionsService.update(req.user.userId, req.user.householdId, id, body);
        } catch (error: any) {
            console.error('UPDATE TRANSACTION ERROR:', error);
            throw new HttpException(
                error.message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Delete(':id')
    async remove(
        @Req() req: any,
        @Param('id') id: string
    ) {
        try {
            return await this.transactionsService.remove(req.user.householdId, id);
        } catch (error: any) {
            console.error('DELETE TRANSACTION ERROR:', error);
            throw new HttpException(
                error.message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
