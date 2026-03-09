import { ParametersService } from './parameters.service';
export declare class ParametersController {
    private readonly parametersService;
    constructor(parametersService: ParametersService);
    getAllParameters(req: any): Promise<{
        code: string;
        userId: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        value: string;
    }[]>;
    getParameter(req: any, code: string): Promise<{
        code: string;
        userId: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        value: string;
    }>;
    updateParameter(req: any, code: string, value: string, description?: string): Promise<{
        code: string;
        userId: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        value: string;
    }>;
}
