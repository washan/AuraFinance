import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInboxRuleDto } from './dto/create-inbox-rule.dto';
import { UpdateInboxRuleDto } from './dto/update-inbox-rule.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InboxRulesService {
    constructor(private prisma: PrismaService) { }

    async create(householdId: string, createInboxRuleDto: CreateInboxRuleDto) {
        return this.prisma.inboxRule.create({
            data: {
                ...createInboxRuleDto,
                householdId,
            },
        });
    }

    async findAll(householdId: string) {
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

    async findOne(householdId: string, id: string) {
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
            throw new NotFoundException(`Inbox rule #${id} not found`);
        }

        return rule;
    }

    async update(householdId: string, id: string, updateInboxRuleDto: UpdateInboxRuleDto) {
        await this.findOne(householdId, id); // verify it exists and belongs to household
        return this.prisma.inboxRule.update({
            where: { id },
            data: updateInboxRuleDto,
        });
    }

    async remove(householdId: string, id: string) {
        await this.findOne(householdId, id); // verify it exists and belongs to household
        return this.prisma.inboxRule.delete({
            where: { id },
        });
    }

    async applyRules(householdId: string, merchant: string) {
        if (!merchant) return null;

        // In a future version this could be pushed to DB or use a trie,
        // but for now memory evaluation is perfectly fine for personal finance scales
        const rules = await this.prisma.inboxRule.findMany({
            where: { householdId },
        });

        const merchantUpper = merchant.toUpperCase();

        // Find first matching rule
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
}
