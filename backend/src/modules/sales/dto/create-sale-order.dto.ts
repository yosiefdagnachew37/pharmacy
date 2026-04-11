import { IsUUID, IsNotEmpty, IsNumber, IsArray, IsOptional, IsString, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class SaleOrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  medicine_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unit_price: number;

  /** Optional: pharmacist selects a specific batch (FEFO override) */
  @IsUUID()
  @IsOptional()
  batch_id?: string;

  @IsString()
  @IsOptional()
  batch_number?: string;

  @IsString()
  @IsOptional()
  expiry_date?: string;
}

export class CreateSaleOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleOrderItemDto)
  items: SaleOrderItemDto[];

  @IsNumber()
  @IsNotEmpty()
  total_amount: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsUUID()
  @IsOptional()
  patient_id?: string;

  @IsString()
  @IsOptional()
  prescription_image_url?: string;

  @IsBoolean()
  @IsOptional()
  is_controlled_transaction?: boolean;
}

export class ConfirmSaleOrderDto {
  @IsUUID()
  @IsOptional()
  payment_account_id?: string;

  @IsString()
  @IsOptional()
  payment_account_name?: string;

  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @IsNumber()
  @IsOptional()
  amount_paid?: number;
}
