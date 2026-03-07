import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from '../meetings/meetings.entity';
import { GreenAreaEvent } from '../events/events.entity';
import { ConflictService } from './conflict.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, GreenAreaEvent])],
  providers: [ConflictService],
  exports: [ConflictService],
})
export class SharedModule {}
