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
exports.RecurringEventsController = void 0;
const common_1 = require("@nestjs/common");
const recurring_events_service_1 = require("./recurring-events.service");
const create_recurring_event_dto_1 = require("./dto/create-recurring-event.dto");
const update_recurring_event_dto_1 = require("./dto/update-recurring-event.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let RecurringEventsController = class RecurringEventsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(req, dto) {
        return this.service.create(req.user.householdId, dto);
    }
    findAll(req) {
        return this.service.findAll(req.user.householdId);
    }
    findOne(req, id) {
        return this.service.findOne(req.user.householdId, id);
    }
    update(req, id, dto) {
        return this.service.update(req.user.householdId, id, dto);
    }
    remove(req, id) {
        return this.service.remove(req.user.householdId, id);
    }
    generateDue() {
        return this.service.generateDueTransactions();
    }
};
exports.RecurringEventsController = RecurringEventsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_recurring_event_dto_1.CreateRecurringEventDto]),
    __metadata("design:returntype", void 0)
], RecurringEventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecurringEventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecurringEventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_recurring_event_dto_1.UpdateRecurringEventDto]),
    __metadata("design:returntype", void 0)
], RecurringEventsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecurringEventsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('generate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RecurringEventsController.prototype, "generateDue", null);
exports.RecurringEventsController = RecurringEventsController = __decorate([
    (0, common_1.Controller)('recurring-events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [recurring_events_service_1.RecurringEventsService])
], RecurringEventsController);
//# sourceMappingURL=recurring-events.controller.js.map