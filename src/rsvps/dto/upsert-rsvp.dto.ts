import { IsString, IsIn } from 'class-validator';

export class UpsertRsvpDto {
  @IsString()
  @IsIn(['meeting', 'event'])
  targetType: 'meeting' | 'event';

  @IsString()
  targetId: string;

  @IsString()
  @IsIn(['attending', 'not_attending', 'maybe'])
  status: 'attending' | 'not_attending' | 'maybe';
}
