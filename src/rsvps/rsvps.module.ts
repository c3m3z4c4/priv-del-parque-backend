import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rsvp } from './rsvp.entity';
import { RsvpsService } from './rsvps.service';
import { RsvpsController } from './rsvps.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rsvp])],
  controllers: [RsvpsController],
  providers: [RsvpsService],
  exports: [RsvpsService],
})
export class RsvpsModule {}
