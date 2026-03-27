import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsEnum(UserRole)
    role: UserRole;

    @IsString()
    @IsOptional()
    manager_pin?: string;

    @IsString()
    @IsOptional()
    organization_id?: string;
}
