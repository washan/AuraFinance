import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: any): Promise<any>;
    login(body: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            householdId: any;
        };
    }>;
    googleAuth(): Promise<void>;
    googleAuthRedirect(req: Request, res: Response): Promise<void>;
}
