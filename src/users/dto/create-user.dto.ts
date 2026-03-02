import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Role } from '../../auth/roles.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @MaxLength(100)
  lastName: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

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
}
