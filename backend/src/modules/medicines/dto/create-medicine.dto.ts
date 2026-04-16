import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMedicineDto {
    @IsString()
    @IsNotEmpty()
    sku: string; // Item ID

    @IsString()
    @IsNotEmpty()
    name: string; // Product Name

    @IsString()
    @IsOptional()
    generic_name?: string;

    @IsString()
    @IsOptional()
    dosage_form?: string; // e.g. Tablet, Capsule, Syrup

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    unit?: string; // UoM

    @IsBoolean()
    @IsOptional()
    is_expirable?: boolean;

    @IsBoolean()
    @IsOptional()
    is_controlled?: boolean;

    @IsNumber()
    @IsOptional()
    @Min(0)
    minimum_stock_level?: number;

    @IsString()
    @IsOptional()
    product_type?: string;

    @IsString()
    @IsOptional()
    preferred_supplier_id?: string;

    // ─── First-Batch Fields (optional, for combined creation) ────
    @IsString()
    @IsOptional()
    batch_number?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    initial_quantity?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    selling_price?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    purchase_price?: number;

    @IsDateString()
    @IsOptional()
    expiry_date?: string;
}
