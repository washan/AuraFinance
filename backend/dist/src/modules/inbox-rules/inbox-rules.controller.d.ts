import { InboxRulesService } from './inbox-rules.service';
import { CreateInboxRuleDto } from './dto/create-inbox-rule.dto';
import { UpdateInboxRuleDto } from './dto/update-inbox-rule.dto';
export declare class InboxRulesController {
    private readonly inboxRulesService;
    constructor(inboxRulesService: InboxRulesService);
    create(req: any, createInboxRuleDto: CreateInboxRuleDto): Promise<{
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
    findAll(req: any): Promise<({
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
    findOne(req: any, id: string): Promise<{
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
    update(req: any, id: string, updateInboxRuleDto: UpdateInboxRuleDto): Promise<{
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
    remove(req: any, id: string): Promise<{
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
}
