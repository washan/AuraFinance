import { Controller, Get, Post, Request, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('backup')
@UseGuards(JwtAuthGuard)
export class BackupController {
    constructor(private readonly backupService: BackupService) { }

    @Get('export')
    async exportData(@Request() req: any) {
        return this.backupService.exportData(req.user.userId, req.user.householdId);
    }

    @Post('import')
    @UseInterceptors(FileInterceptor('file'))
    async importData(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Se requiere un archivo para la restauración.');
        }

        try {
            const backupData = JSON.parse(file.buffer.toString());
            return await this.backupService.importData(req.user.userId, req.user.householdId, backupData);
        } catch (e) {
            if (e instanceof BadRequestException) {
                throw e;
            }
            throw new BadRequestException('El archivo proporcionado no es un JSON válido o está corrupto.');
        }
    }
}
