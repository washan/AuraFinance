import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsAppController {
    constructor(private readonly whatsappService: WhatsAppService) {}

    @Get('status')
    getStatus() {
        return this.whatsappService.getStatus();
    }

    @Post('reset')
    async resetSession() {
        await this.whatsappService.resetSession();
        return { success: true, message: 'WhatsApp session reset successfully' };
    }
}
