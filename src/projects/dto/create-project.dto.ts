import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsIn,
} from 'class-validator';
import type { ProjectStatus } from '../project.entity';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionPercentage?: number;

  @IsIn(['planned', 'started', 'in_review', 'completed', 'paused'])
  @IsOptional()
  status?: ProjectStatus;

  @IsBoolean()
  @IsOptional()
  visibleToVecinos?: boolean;
}
