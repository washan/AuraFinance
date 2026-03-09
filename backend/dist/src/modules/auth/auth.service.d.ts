import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private prisma;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService);
    private seedHouseholdData;
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            householdId: any;
            baseCurrencySymbol: string;
        };
    }>;
    register(data: any): Promise<any>;
    googleLogin(req: any): Promise<"No user from provider" | {
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            householdId: string;
            baseCurrencySymbol: string;
        };
    }>;
}
