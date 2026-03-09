import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';

export class CreateInboxRuleDto {
    @IsString()
    name: string;

    @IsString()
    matchValue: string;

    @IsOptional()
    @IsEnum(['contains'])
    matchType?: string;

    @IsOptional()
    @IsUUID()
    accountId?: string;

    @IsOptional()
    @IsUUID()
    itemId?: string;

    @IsOptional()
    @IsUUID()
    projectId?: string;

    @IsOptional()
    @IsUUID()
    goalId?: string;
}
