import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, Matches } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsNumber()
  @IsNotEmpty()
  limitAmount: number;

  @IsBoolean()
  @IsOptional()
  isBase?: boolean;

  @IsString()
  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2])-\d{4}$/, { message: 'period must be in MM-YYYY format' })
  period?: string;

  @IsString()
  @IsOptional()
  currency?: string;
}
