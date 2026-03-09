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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboxRulesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let InboxRulesService = class InboxRulesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(householdId, createInboxRuleDto) {
        return this.prisma.inboxRule.create({
            data: {
                ...createInboxRuleDto,
                householdId,
            },
        });
    }
    async findAll(householdId) {
        return this.prisma.inboxRule.findMany({
            where: { householdId },
            orderBy: { createdAt: 'desc' },
            include: {
                account: { select: { name: true } },
                item: { select: { name: true, category: { select: { name: true } } } },
                project: { select: { name: true } },
                goal: { select: { title: true } },
            },
        });
    }
    async findOne(householdId, id) {
        const rule = await this.prisma.inboxRule.findFirst({
            where: { id, householdId },
            include: {
                account: { select: { name: true } },
                item: { select: { name: true, category: { select: { name: true } } } },
                project: { select: { name: true } },
                goal: { select: { title: true } },
            },
        });
        if (!rule) {
            throw new common_1.NotFoundException(`Inbox rule #${id} not found`);
        }
        return rule;
    }
    async update(householdId, id, updateInboxRuleDto) {
        await this.findOne(householdId, id);
        return this.prisma.inboxRule.update({
            where: { id },
            data: updateInboxRuleDto,
        });
    }
    async remove(householdId, id) {
        await this.findOne(householdId, id);
        return this.prisma.inboxRule.delete({
            where: { id },
        });
    }
    async applyRules(householdId, merchant) {
        if (!merchant)
            return null;
        const rules = await this.prisma.inboxRule.findMany({
            where: { householdId },
        });
        const merchantUpper = merchant.toUpperCase();
        for (const rule of rules) {
            if (rule.matchType === 'contains' && rule.matchValue) {
                if (merchantUpper.includes(rule.matchValue.toUpperCase())) {
                    return {
                        name: rule.name,
                        accountId: rule.accountId,
                        itemId: rule.itemId,
                        projectId: rule.projectId,
                        goalId: rule.goalId,
                    };
                }
            }
        }
        return null;
    }
};
exports.InboxRulesService = InboxRulesService;
exports.InboxRulesService = InboxRulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InboxRulesService);
//# sourceMappingURL=inbox-rules.service.js.map