import { IsNotEmpty, IsOptional, IsString, IsInt, Min, Max, IsEnum, IsArray } from 'class-validator';
import { Gender } from '../entities/patient.entity';

export class CreatePatientDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsInt()
    @IsOptional()
    @Min(0)
    @Max(150)
    age?: number;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @IsString()
    @IsOptional()
    address?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    allergies?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    chronic_conditions?: string[];
}
