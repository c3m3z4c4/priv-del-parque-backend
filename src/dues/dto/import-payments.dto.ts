import {
  IsEmail,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsDateString,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ImportPaymentItemDto {
  @IsEmail()
  email: string;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  year: number;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ImportPaymentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportPaymentItemDto)
  payments: ImportPaymentItemDto[];
}
