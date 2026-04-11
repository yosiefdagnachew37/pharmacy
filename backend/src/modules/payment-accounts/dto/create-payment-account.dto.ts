import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';
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

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
