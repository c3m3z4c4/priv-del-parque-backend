import {
  IsUUID,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsIn,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  userId: string;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  year: number;

  @IsOptional()
  @IsIn(['paid', 'pending', 'exempt'])
  status?: 'paid' | 'pending' | 'exempt';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
