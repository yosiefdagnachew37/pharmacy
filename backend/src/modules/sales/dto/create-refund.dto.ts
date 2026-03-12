import { IsUUID, IsInt, IsPositive, IsString, IsOptional, IsNumber } from 'class-validator';

export class RefundItemDto {
    @IsUUID()
    medicine_id: string;

    @IsInt()
    @IsPositive()
    quantity: number;
}

export class CreateRefundDto {
    @IsUUID()
    sale_id: string;

    @IsString()
    @IsOptional()
    reason?: string;

    @IsNumber()
    amount: number;

    @IsUUID()
    medicine_id: string;

    @IsInt()
    @IsPositive()
    quantity: number;
}
