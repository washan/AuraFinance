import { Controller, Get, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Request() req: any) {
        // req.user is set by the JwtStrategy validate method
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Get('household/members')
    async getHouseholdMembers(@Request() req: any) {
        return this.usersService.getHouseholdMembers(req.user.householdId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('household/members')
    async addHouseholdMember(@Request() req: any, @Body() body: { email: string; name: string }) {
        if (!body.email || !body.name) {
            throw new BadRequestException('Email and name are required');
        }

        try {
            await this.usersService.addHouseholdMember(
                req.user.userId,
                req.user.householdId,
                body.email.toLowerCase(),
                body.name
            );
            return { message: 'Miembro agregado exitosamente' };
        } catch (error: any) {
            throw new BadRequestException(error.message || 'Error al agregar miembro');
        }
    }
}
