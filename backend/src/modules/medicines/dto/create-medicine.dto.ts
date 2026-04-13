import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMedicineDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    generic_name?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    unit?: string;

    @IsBoolean()
    @IsOptional()
    is_controlled?: boolean;

    @IsNumber()
    @IsOptional()
    minimum_stock_level?: number;

    @IsString()
    @IsOptional()
    product_type?: string;

    @IsString()
    @IsOptional()
    preferred_supplier_id?: string;
}
