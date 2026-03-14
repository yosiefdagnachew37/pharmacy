import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsString()
    manager_pin?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
