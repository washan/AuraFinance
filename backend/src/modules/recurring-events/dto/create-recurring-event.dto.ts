import { IsString, IsNumber, IsOptional, IsBoolean, IsIn, Min, Max } from 'class-validator';

export class CreateRecurringEventDto {
    @IsString()
    name: string;

    @IsString()
    merchant: string;

    @IsNumber()
    amount: number;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsString()
    @IsIn(['monthly', 'biweekly', 'weekly', 'annually'])
    frequency: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(31)
    dayOfMonth?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(31)
    dayOfMonth2?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(6)
    dayOfWeek?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(12)
    monthOfYear?: number;

    @IsOptional()
    @IsString()
    accountInfo?: string;
}
