import { IsUUID, IsNotEmpty, IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePrescriptionItemDto {
    @IsUUID()
    @IsNotEmpty()
    medicine_id: string;

    @IsString()
    @IsNotEmpty()
    dosage: string;

    @IsString()
    @IsNotEmpty()
    duration: string;

    @IsString()
    @IsOptional()
    instructions?: string;
}

export class CreatePrescriptionDto {
    @IsUUID()
    @IsNotEmpty()
    patient_id: string;

    @IsString()
    @IsOptional()
    doctor_name?: string;

    @IsString()
    @IsOptional()
    facility?: string;

    @IsString()
    @IsOptional()
    prescription_image_path?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePrescriptionItemDto)
    items: CreatePrescriptionItemDto[];
}
