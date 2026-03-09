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
exports.InboxController = void 0;
const common_1 = require("@nestjs/common");
const inbox_service_1 = require("./inbox.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let InboxController = class InboxController {
    inboxService;
    constructor(inboxService) {
        this.inboxService = inboxService;
    }
    async getPendingTransactions(req) {
        const user = req.user;
        return this.inboxService.getPendingTransactions(user.userId);
    }
    async processTransaction(id, req) {
        const user = req.user;
        return this.inboxService.updateStatus(id, user.userId, 'PROCESSED');
    }
    async dismissTransaction(id, req) {
        const user = req.user;
        return this.inboxService.updateStatus(id, user.userId, 'DISMISSED');
    }
    async syncEmails(req) {
        const user = req.user;
        return this.inboxService.syncEmails(user.userId);
    }
    async getConnections(req) {
        const user = req.user;
        return this.inboxService.getConnections(user.userId);
    }
    async createConnection(req) {
        const user = req.user;
        return this.inboxService.createConnection(user.userId, Object.assign({}, req.body));
    }
    async deleteConnection(id, req) {
        const user = req.user;
        return this.inboxService.deleteConnection(user.userId, id);
    }
};
exports.InboxController = InboxController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "getPendingTransactions", null);
__decorate([
    (0, common_1.Post)(':id/process'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "processTransaction", null);
__decorate([
    (0, common_1.Post)(':id/dismiss'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "dismissTransaction", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "syncEmails", null);
__decorate([
    (0, common_1.Get)('connections'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "getConnections", null);
__decorate([
    (0, common_1.Post)('connections'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "createConnection", null);
__decorate([
    (0, common_1.Post)('connections/:id/delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "deleteConnection", null);
exports.InboxController = InboxController = __decorate([
    (0, common_1.Controller)('inbox'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [inbox_service_1.InboxService])
], InboxController);
//# sourceMappingURL=inbox.controller.js.map