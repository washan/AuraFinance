import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class UpdateInvestmentTransactionDto {
  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  commission?: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
