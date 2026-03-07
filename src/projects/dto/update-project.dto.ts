import { IsString, IsOptional, IsInt, Min, Max, IsIn, IsBoolean } from 'class-validator';
import type { ProjectStatus } from '../project.entity';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  completionPercentage?: number;

  @IsOptional()
  @IsIn(['planned', 'started', 'in_review', 'completed', 'paused'])
  status?: ProjectStatus;

  @IsOptional()
  @IsBoolean()
  visibleToVecinos?: boolean;
}
