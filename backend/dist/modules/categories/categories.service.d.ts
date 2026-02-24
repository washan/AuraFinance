import { PrismaService } from '../../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllCategories(householdId: string): Promise<({
        items: {
            name: string;
            id: string;
            categoryId: string;
        }[];
    } & {
        name: string;
        id: string;
        householdId: string;
        icon: string | null;
    })[]>;
    createCategory(householdId: string, data: {
        name: string;
        icon?: string;
    }): Promise<{
        name: string;
        id: string;
        householdId: string;
        icon: string | null;
    }>;
    updateCategory(householdId: string, categoryId: string, data: {
        name?: string;
        icon?: string;
    }): Promise<{
        name: string;
        id: string;
        householdId: string;
        icon: string | null;
    }>;
    deleteCategory(householdId: string, categoryId: string): Promise<{
        name: string;
        id: string;
        householdId: string;
        icon: string | null;
    }>;
    createItem(householdId: string, categoryId: string, data: {
        name: string;
    }): Promise<{
        name: string;
        id: string;
        categoryId: string;
    }>;
    updateItem(householdId: string, categoryId: string, itemId: string, data: {
        name: string;
    }): Promise<{
        name: string;
        id: string;
        categoryId: string;
    }>;
    deleteItem(householdId: string, categoryId: string, itemId: string): Promise<{
        name: string;
        id: string;
        categoryId: string;
    }>;
}
