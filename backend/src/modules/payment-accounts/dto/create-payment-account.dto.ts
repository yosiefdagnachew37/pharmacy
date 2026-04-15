import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { PaymentAccountType } from '../entities/payment-account.entity';

export class CreatePaymentAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(PaymentAccountType)
  @IsOptional()
  type?: PaymentAccountType;

  @IsString()
  @IsOptional()
  account_number?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  initial_balance?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsBoolean()
  @IsOptional()
  is_visible_to_cashier?: boolean;

  @IsBoolean()
  @IsOptional()
  allow_transfer?: boolean;
}
