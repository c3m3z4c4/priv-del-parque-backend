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

export class UpdatePaymentDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  month?: number;

  @IsInt()
  @IsOptional()
  year?: number;

  @IsIn(['paid', 'pending', 'exempt'])
  @IsOptional()
  status?: 'paid' | 'pending' | 'exempt';

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  paidAt?: string;
}
