import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAllCategories(req: any): Promise<({
        items: {
            name: string;
            id: string;
            categoryId: string;
        }[];
    } & {
        name: string;
        id: string;
        householdId: string;
        type: string;
        icon: string | null;
    })[]>;
    createCategory(req: any, body: {
        name: string;
        type?: string;
        icon?: string;
    }): Promise<{
        name: string;
        id: string;
        householdId: string;
        type: string;
        icon: string | null;
    }>;
    updateCategory(req: any, categoryId: string, body: {
        name?: string;
        type?: string;
        icon?: string;
    }): Promise<{
        name: string;
        id: string;
        householdId: string;
        type: string;
        icon: string | null;
    }>;
    deleteCategory(req: any, categoryId: string): Promise<{
        name: string;
        id: string;
        householdId: string;
        type: string;
        icon: string | null;
    }>;
    createItem(req: any, categoryId: string, body: {
        name: string;
    }): Promise<{
        name: string;
        id: string;
        categoryId: string;
    }>;
    updateItem(req: any, categoryId: string, itemId: string, body: {
        name: string;
    }): Promise<{
        name: string;
        id: string;
        categoryId: string;
    }>;
    deleteItem(req: any, categoryId: string, itemId: string): Promise<{
        name: string;
        id: string;
        categoryId: string;
    }>;
}
