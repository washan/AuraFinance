import { CreateInboxRuleDto } from './dto/create-inbox-rule.dto';
import { UpdateInboxRuleDto } from './dto/update-inbox-rule.dto';
import { PrismaService } from '../../prisma/prisma.service';
export declare class InboxRulesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(householdId: string, createInboxRuleDto: CreateInboxRuleDto): Promise<{
        name: string;
        id: string;
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
        project: {
            name: string;
        } | null;
        item: {
            category: {
                name: string;
            };
            name: string;
        } | null;
        goal: {
            title: string;
        } | null;
    } & {
        name: string;
        id: string;
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
        project: {
            name: string;
        } | null;
        item: {
            category: {
                name: string;
            };
            name: string;
        } | null;
        goal: {
            title: string;
        } | null;
    } & {
        name: string;
        id: string;
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
        name: string;
        id: string;
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
        name: string;
        id: string;
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
