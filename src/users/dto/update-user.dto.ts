import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Role } from '../../auth/roles.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  address?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  houseId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
