"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboxModule = void 0;
const common_1 = require("@nestjs/common");
const inbox_controller_1 = require("./inbox.controller");
const inbox_service_1 = require("./inbox.service");
const imap_service_1 = require("./services/imap.service");
const parser_service_1 = require("./services/parser.service");
const inbox_cron_1 = require("./cron/inbox.cron");
const prisma_module_1 = require("../../prisma/prisma.module");
const schedule_1 = require("@nestjs/schedule");
const inbox_rules_module_1 = require("../inbox-rules/inbox-rules.module");
const recurring_events_module_1 = require("../recurring-events/recurring-events.module");
let InboxModule = class InboxModule {
};
exports.InboxModule = InboxModule;
exports.InboxModule = InboxModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, schedule_1.ScheduleModule.forRoot(), inbox_rules_module_1.InboxRulesModule, recurring_events_module_1.RecurringEventsModule],
        controllers: [inbox_controller_1.InboxController],
        providers: [inbox_service_1.InboxService, imap_service_1.ImapService, parser_service_1.ParserService, inbox_cron_1.InboxCronService],
        exports: [inbox_service_1.InboxService],
    })
], InboxModule);
//# sourceMappingURL=inbox.module.js.map