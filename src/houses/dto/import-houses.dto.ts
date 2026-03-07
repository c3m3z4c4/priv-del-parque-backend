import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateHouseDto } from './create-house.dto';

export class ImportHousesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHouseDto)
  houses: CreateHouseDto[];
}
