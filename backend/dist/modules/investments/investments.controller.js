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
exports.InvestmentsController = void 0;
const common_1 = require("@nestjs/common");
const investments_service_1 = require("./investments.service");
const create_investment_dto_1 = require("./dto/create-investment.dto");
const update_investment_dto_1 = require("./dto/update-investment.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let InvestmentsController = class InvestmentsController {
    investmentsService;
    constructor(investmentsService) {
        this.investmentsService = investmentsService;
    }
    getPortfolio(req) {
        return this.investmentsService.getPortfolio(req.user.householdId);
    }
    createTransaction(req, dto) {
        return this.investmentsService.createTransaction(req.user.householdId, req.user.userId, dto);
    }
    getHistory(req) {
        return this.investmentsService.getHistory(req.user.householdId);
    }
    getAiInsights(req) {
        return this.investmentsService.getAiInsights(req.user.householdId, req.user.userId);
    }
    getTransactions(req) {
        return this.investmentsService.getTransactions(req.user.householdId);
    }
    updateTransaction(req, id, dto) {
        return this.investmentsService.updateTransaction(req.user.householdId, id, dto);
    }
    deleteTransaction(req, id) {
        return this.investmentsService.deleteTransaction(req.user.householdId, id);
    }
};
exports.InvestmentsController = InvestmentsController;
__decorate([
    (0, common_1.Get)('portfolio'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user investment portfolio' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvestmentsController.prototype, "getPortfolio", null);
__decorate([
    (0, common_1.Post)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new investment transaction' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_investment_dto_1.CreateInvestmentTransactionDto]),
    __metadata("design:returntype", void 0)
], InvestmentsController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get portfolio historical values for charting' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvestmentsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('ai-insights'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI analysis of the portfolio' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvestmentsController.prototype, "getAiInsights", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'List all investment transactions' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvestmentsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Put)('transactions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an investment transaction' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_investment_dto_1.UpdateInvestmentTransactionDto]),
    __metadata("design:returntype", void 0)
], InvestmentsController.prototype, "updateTransaction", null);
__decorate([
    (0, common_1.Delete)('transactions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an investment transaction' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InvestmentsController.prototype, "deleteTransaction", null);
exports.InvestmentsController = InvestmentsController = __decorate([
    (0, swagger_1.ApiTags)('investments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('investments'),
    __metadata("design:paramtypes", [investments_service_1.InvestmentsService])
], InvestmentsController);
//# sourceMappingURL=investments.controller.js.map