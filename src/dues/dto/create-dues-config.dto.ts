import { IsNumber, IsPositive } from 'class-validator';

export class CreateDuesConfigDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}
