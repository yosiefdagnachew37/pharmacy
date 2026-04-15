import { IsNotEmpty, IsString, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class CreatePatientReminderDto {
    @IsNotEmpty()
    @IsUUID()
    patient_id: string;

    @IsNotEmpty()
    @IsString()
    medication_name: string;

    @IsNotEmpty()
    @IsDateString()
    last_purchase_date: string;

    @IsNotEmpty()
    @IsNumber()
    dispensed_quantity: number;

    @IsNotEmpty()
    @IsNumber()
    expected_duration_days: number;

    @IsNotEmpty()
    @IsDateString()
    depletion_date: string;
}
