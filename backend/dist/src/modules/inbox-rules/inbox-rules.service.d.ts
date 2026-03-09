import { CreateInboxRuleDto } from './dto/create-inbox-rule.dto';
import { UpdateInboxRuleDto } from './dto/update-inbox-rule.dto';
import { PrismaService } from '../../prisma/prisma.service';
export declare class InboxRulesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(householdId: string, createInboxRuleDto: CreateInboxRuleDto): Promise<{
        id: string;
        name: string;
        householdId: string;
        accountId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        createdAt: Date;
        matchValue: string;
        matchType: string;
    }>;
    findAll(householdId: string): Promise<({
        account: {
            name: string;
        } | null;
        goal: {
            title: string;
        } | null;
        item: {
            name: string;
            category: {
                name: string;
            };
        } | null;
        project: {
            name: string;
        } | null;
    } & {
        id: string;
        name: string;
        householdId: string;
        accountId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        createdAt: Date;
        matchValue: string;
        matchType: string;
    })[]>;
    findOne(householdId: string, id: string): Promise<{
        account: {
            name: string;
        } | null;
        goal: {
            title: string;
        } | null;
        item: {
            name: string;
            category: {
                name: string;
            };
        } | null;
        project: {
            name: string;
        } | null;
    } & {
        id: string;
        name: string;
        householdId: string;
        accountId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        createdAt: Date;
        matchValue: string;
        matchType: string;
    }>;
    update(householdId: string, id: string, updateInboxRuleDto: UpdateInboxRuleDto): Promise<{
        id: string;
        name: string;
        householdId: string;
        accountId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        createdAt: Date;
        matchValue: string;
        matchType: string;
    }>;
    remove(householdId: string, id: string): Promise<{
        id: string;
        name: string;
        householdId: string;
        accountId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
        createdAt: Date;
        matchValue: string;
        matchType: string;
    }>;
    applyRules(householdId: string, merchant: string): Promise<{
        name: string;
        accountId: string | null;
        itemId: string | null;
        projectId: string | null;
        goalId: string | null;
    } | null>;
}
