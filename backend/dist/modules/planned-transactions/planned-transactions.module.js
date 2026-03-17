"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannedTransactionsModule = void 0;
const common_1 = require("@nestjs/common");
const planned_transactions_service_1 = require("./planned-transactions.service");
const planned_transactions_controller_1 = require("./planned-transactions.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
const transactions_module_1 = require("../transactions/transactions.module");
let PlannedTransactionsModule = class PlannedTransactionsModule {
};
exports.PlannedTransactionsModule = PlannedTransactionsModule;
exports.PlannedTransactionsModule = PlannedTransactionsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, transactions_module_1.TransactionsModule],
        controllers: [planned_transactions_controller_1.PlannedTransactionsController],
        providers: [planned_transactions_service_1.PlannedTransactionsService],
    })
], PlannedTransactionsModule);
//# sourceMappingURL=planned-transactions.module.js.map