import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateBatchDto {
    @IsUUID()
    @IsNotEmpty()
    medicine_id: string;

    @IsString()
    @IsNotEmpty()
    batch_number: string;

    @IsDateString()
    @IsOptional()
    expiry_date?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    purchase_price?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    selling_price?: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    initial_quantity: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    quantity_remaining?: number;
}
