import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('whatsapp')
export class WhatsAppController {
    constructor(private readonly whatsappService: WhatsAppService) {}

    @Get('status')
    @UseGuards(JwtAuthGuard)
    getStatus() {
        return this.whatsappService.getStatus();
    }

    @Post('reset')
    @UseGuards(JwtAuthGuard)
    async resetSession() {
        await this.whatsappService.resetSession();
        return { success: true, message: 'WhatsApp session reset successfully. You can now go back to AuraFinance and scan the QR.' };
    }
}
