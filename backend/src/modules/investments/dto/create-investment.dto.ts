import { IsString, IsNumber, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateInvestmentTransactionDto {
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsString()
  @IsNotEmpty()
  type: string; // 'BUY', 'SELL', 'DIVIDEND'

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  commission?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
