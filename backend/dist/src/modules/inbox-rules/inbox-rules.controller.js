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
exports.InboxRulesController = void 0;
const common_1 = require("@nestjs/common");
const inbox_rules_service_1 = require("./inbox-rules.service");
const create_inbox_rule_dto_1 = require("./dto/create-inbox-rule.dto");
const update_inbox_rule_dto_1 = require("./dto/update-inbox-rule.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let InboxRulesController = class InboxRulesController {
    inboxRulesService;
    constructor(inboxRulesService) {
        this.inboxRulesService = inboxRulesService;
    }
    create(req, createInboxRuleDto) {
        return this.inboxRulesService.create(req.user.householdId, createInboxRuleDto);
    }
    findAll(req) {
        return this.inboxRulesService.findAll(req.user.householdId);
    }
    findOne(req, id) {
        return this.inboxRulesService.findOne(req.user.householdId, id);
    }
    update(req, id, updateInboxRuleDto) {
        return this.inboxRulesService.update(req.user.householdId, id, updateInboxRuleDto);
    }
    remove(req, id) {
        return this.inboxRulesService.remove(req.user.householdId, id);
    }
};
exports.InboxRulesController = InboxRulesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_inbox_rule_dto_1.CreateInboxRuleDto]),
    __metadata("design:returntype", void 0)
], InboxRulesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InboxRulesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InboxRulesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_inbox_rule_dto_1.UpdateInboxRuleDto]),
    __metadata("design:returntype", void 0)
], InboxRulesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InboxRulesController.prototype, "remove", null);
exports.InboxRulesController = InboxRulesController = __decorate([
    (0, common_1.Controller)('inbox-rules'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [inbox_rules_service_1.InboxRulesService])
], InboxRulesController);
//# sourceMappingURL=inbox-rules.controller.js.map