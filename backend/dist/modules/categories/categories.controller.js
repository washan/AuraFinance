"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesController = void 0;
const common_1 = require("@nestjs/common");
const categories_service_1 = require("./categories.service");
const passport_1 = require("@nestjs/passport");
let CategoriesController = class CategoriesController {
    categoriesService;
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    findAllCategories(req) {
        return this.categoriesService.findAllCategories(req.user.householdId);
    }
    createCategory(req, body) {
        return this.categoriesService.createCategory(req.user.householdId, body);
    }
    updateCategory(req, categoryId, body) {
        return this.categoriesService.updateCategory(req.user.householdId, categoryId, body);
    }
    deleteCategory(req, categoryId) {
        return this.categoriesService.deleteCategory(req.user.householdId, categoryId);
    }
    createItem(req, categoryId, body) {
        return this.categoriesService.createItem(req.user.householdId, categoryId, body);
    }
    updateItem(req, categoryId, itemId, body) {
        return this.categoriesService.updateItem(req.user.householdId, categoryId, itemId, body);
    }
    deleteItem(req, categoryId, itemId) {
        return this.categoriesService.deleteItem(req.user.householdId, categoryId, itemId);
    }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)(':categoryId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('categoryId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)(':categoryId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Post)(':categoryId/items'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('categoryId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "createItem", null);
__decorate([
    (0, common_1.Patch)(':categoryId/items/:itemId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('categoryId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)(':categoryId/items/:itemId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('categoryId')),
    __param(2, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "deleteItem", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, common_1.Controller)('categories'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], CategoriesController);
//# sourceMappingURL=categories.controller.js.map