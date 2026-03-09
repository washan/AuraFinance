import { ParametersService } from './parameters.service';
export declare class ParametersController {
    private readonly parametersService;
    constructor(parametersService: ParametersService);
    getAllParameters(req: any): Promise<{
        description: string | null;
        userId: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
    }[]>;
    getParameter(req: any, code: string): Promise<{
        description: string | null;
        userId: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
    }>;
    updateParameter(req: any, code: string, value: string, description?: string): Promise<{
        description: string | null;
        userId: string;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
    }>;
}
