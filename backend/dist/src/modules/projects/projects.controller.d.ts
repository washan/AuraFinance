import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(req: any): Promise<{
        id: string;
        name: string;
        householdId: string;
        description: string | null;
    }[]>;
    create(req: any, data: {
        name: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        householdId: string;
        description: string | null;
    }>;
    update(req: any, id: string, data: {
        name?: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        householdId: string;
        description: string | null;
    }>;
    remove(req: any, id: string): Promise<{
        id: string;
        name: string;
        householdId: string;
        description: string | null;
    }>;
}
