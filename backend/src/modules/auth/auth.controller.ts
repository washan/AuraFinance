import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import * as fs from 'fs';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() body: any) {
        if (!body.email || !body.password || !body.name) {
            throw new UnauthorizedException('Faltan campos obligatorios');
        }
        return this.authService.register(body);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() body: any) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        return this.authService.login(user);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Initiates the Google OAuth2 login flow
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
        const result = await this.authService.googleLogin(req);

        if (typeof result === 'string') {
            return res.redirect('http://localhost:3000/auth?error=NoUserFromProvider');
        }

        const encodedUser = encodeURIComponent(JSON.stringify(result.user));
        res.redirect(`http://localhost:3000/auth/callback?token=${result.access_token}&user=${encodedUser}`);
    }
}
