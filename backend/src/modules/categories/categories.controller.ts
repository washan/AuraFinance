import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    // --- CATEGORIES ---

    @Get()
    findAllCategories(@Req() req: any) {
        return this.categoriesService.findAllCategories(req.user.householdId);
    }

    @Post()
    createCategory(@Req() req: any, @Body() body: { name: string; icon?: string }) {
        return this.categoriesService.createCategory(req.user.householdId, body);
    }

    @Patch(':categoryId')
    updateCategory(
        @Req() req: any,
        @Param('categoryId') categoryId: string,
        @Body() body: { name?: string; icon?: string }
    ) {
        return this.categoriesService.updateCategory(req.user.householdId, categoryId, body);
    }

    @Delete(':categoryId')
    deleteCategory(@Req() req: any, @Param('categoryId') categoryId: string) {
        return this.categoriesService.deleteCategory(req.user.householdId, categoryId);
    }

    // --- ITEMS ---

    @Post(':categoryId/items')
    createItem(
        @Req() req: any,
        @Param('categoryId') categoryId: string,
        @Body() body: { name: string }
    ) {
        return this.categoriesService.createItem(req.user.householdId, categoryId, body);
    }

    @Patch(':categoryId/items/:itemId')
    updateItem(
        @Req() req: any,
        @Param('categoryId') categoryId: string,
        @Param('itemId') itemId: string,
        @Body() body: { name: string }
    ) {
        return this.categoriesService.updateItem(req.user.householdId, categoryId, itemId, body);
    }

    @Delete(':categoryId/items/:itemId')
    deleteItem(
        @Req() req: any,
        @Param('categoryId') categoryId: string,
        @Param('itemId') itemId: string
    ) {
        return this.categoriesService.deleteItem(req.user.householdId, categoryId, itemId);
    }
}
