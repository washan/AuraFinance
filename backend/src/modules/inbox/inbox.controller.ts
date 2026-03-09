import { Controller, Get, Post, Param, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@Controller('inbox')
@UseGuards(JwtAuthGuard)
export class InboxController {
    constructor(private readonly inboxService: InboxService) { }

    @Get()
    async getPendingTransactions(@Req() req: Request) {
        const user = req.user as any;
        return this.inboxService.getPendingTransactions(user.userId);
    }

    @Post(':id/process')
    async processTransaction(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: Request
    ) {
        const user = req.user as any;
        return this.inboxService.updateStatus(id, user.userId, 'PROCESSED');
    }

    @Post(':id/dismiss')
    async dismissTransaction(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: Request
    ) {
        const user = req.user as any;
        return this.inboxService.updateStatus(id, user.userId, 'DISMISSED');
    }

    @Post('sync')
    async syncEmails(@Req() req: Request) {
        const user = req.user as any;
        return this.inboxService.syncEmails(user.userId);
    }

    @Get('connections')
    async getConnections(@Req() req: Request) {
        const user = req.user as any;
        return this.inboxService.getConnections(user.userId);
    }

    @Post('connections')
    async createConnection(@Req() req: Request) {
        const user = req.user as any;
        return this.inboxService.createConnection(user.userId, Object.assign({}, req.body));
    }

    @Post('connections/:id/delete') // Using POST for delete if generic Next.js client is tricky, but preferably DELETE
    async deleteConnection(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        const user = req.user as any;
        return this.inboxService.deleteConnection(user.userId, id);
    }
}
