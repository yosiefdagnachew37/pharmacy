import { IsUUID, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
    @IsUUID()
    @IsNotEmpty()
    medicine_id: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    unit_price: number;
}

export class CreateSaleDto {
    @IsUUID()
    @IsOptional()
    patient_id?: string;

    @IsUUID()
    @IsOptional()
    prescription_id?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSaleItemDto)
    items: CreateSaleItemDto[];

    @IsNumber()
    @IsNotEmpty()
    total_price: number;

    @IsString()
    @IsOptional()
    payment_method?: string;

    @IsString()
    @IsOptional()
    prescription_image_url?: string;

    @IsArray()
    @IsOptional()
    split_payments?: { method: string; amount: number }[];
}
