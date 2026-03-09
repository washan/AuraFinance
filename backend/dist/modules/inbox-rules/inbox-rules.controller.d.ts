import { InboxRulesService } from './inbox-rules.service';
import { CreateInboxRuleDto } from './dto/create-inbox-rule.dto';
import { UpdateInboxRuleDto } from './dto/update-inbox-rule.dto';
export declare class InboxRulesController {
    private readonly inboxRulesService;
    constructor(inboxRulesService: InboxRulesService);
    create(req: any, createInboxRuleDto: CreateInboxRuleDto): Promise<{
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
    findAll(req: any): Promise<({
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
    findOne(req: any, id: string): Promise<{
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
    update(req: any, id: string, updateInboxRuleDto: UpdateInboxRuleDto): Promise<{
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
    remove(req: any, id: string): Promise<{
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
}
