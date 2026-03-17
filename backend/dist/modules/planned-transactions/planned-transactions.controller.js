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
exports.PlannedTransactionsController = void 0;
const common_1 = require("@nestjs/common");
const planned_transactions_service_1 = require("./planned-transactions.service");
const passport_1 = require("@nestjs/passport");
let PlannedTransactionsController = class PlannedTransactionsController {
    plannedTransactionsService;
    constructor(plannedTransactionsService) {
        this.plannedTransactionsService = plannedTransactionsService;
    }
    async create(req, body) {
        try {
            return await this.plannedTransactionsService.create(req.user.userId, req.user.householdId, body);
        }
        catch (error) {
            console.error('CREATE PLANNED TX ERROR:', error);
            throw new common_1.HttpException(error.message || 'Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    findAll(req, month, status) {
        return this.plannedTransactionsService.findAll(req.user.userId, req.user.householdId, month, status);
    }
    async update(req, id, body) {
        try {
            return await this.plannedTransactionsService.update(req.user.userId, req.user.householdId, id, body);
        }
        catch (error) {
            console.error('UPDATE PLANNED TX ERROR:', error);
            throw new common_1.HttpException(error.message || 'Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(req, id) {
        try {
            return await this.plannedTransactionsService.remove(req.user.householdId, id);
        }
        catch (error) {
            console.error('DELETE PLANNED TX ERROR:', error);
            throw new common_1.HttpException(error.message || 'Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async realize(req, id, body) {
        try {
            return await this.plannedTransactionsService.realize(req.user.userId, req.user.householdId, id, body);
        }
        catch (error) {
            console.error('REALIZE PLANNED TX ERROR:', error);
            throw new common_1.HttpException(error.message || 'Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.PlannedTransactionsController = PlannedTransactionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PlannedTransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PlannedTransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PlannedTransactionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PlannedTransactionsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/realize'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PlannedTransactionsController.prototype, "realize", null);
exports.PlannedTransactionsController = PlannedTransactionsController = __decorate([
    (0, common_1.Controller)('planned-transactions'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [planned_transactions_service_1.PlannedTransactionsService])
], PlannedTransactionsController);
//# sourceMappingURL=planned-transactions.controller.js.map