"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./modules/users/users.module");
const auth_module_1 = require("./modules/auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const accounts_module_1 = require("./modules/accounts/accounts.module");
const transactions_module_1 = require("./modules/transactions/transactions.module");
const currencies_module_1 = require("./modules/currencies/currencies.module");
const categories_module_1 = require("./modules/categories/categories.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const projects_module_1 = require("./modules/projects/projects.module");
const goals_module_1 = require("./modules/goals/goals.module");
const inbox_module_1 = require("./modules/inbox/inbox.module");
const inbox_rules_module_1 = require("./modules/inbox-rules/inbox-rules.module");
const recurring_events_module_1 = require("./modules/recurring-events/recurring-events.module");
const parameters_module_1 = require("./modules/parameters/parameters.module");
const backup_module_1 = require("./modules/backup/backup.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule, auth_module_1.AuthModule, prisma_module_1.PrismaModule, accounts_module_1.AccountsModule, transactions_module_1.TransactionsModule, currencies_module_1.CurrenciesModule, categories_module_1.CategoriesModule, dashboard_module_1.DashboardModule, projects_module_1.ProjectsModule, goals_module_1.GoalsModule, inbox_module_1.InboxModule, inbox_rules_module_1.InboxRulesModule, recurring_events_module_1.RecurringEventsModule, parameters_module_1.ParametersModule, backup_module_1.BackupModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map