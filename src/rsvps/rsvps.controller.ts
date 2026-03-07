import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RsvpsService } from './rsvps.service';
import { UpsertRsvpDto } from './dto/upsert-rsvp.dto';

@Controller('rsvps')
@UseGuards(JwtAuthGuard)
export class RsvpsController {
  constructor(private rsvpsService: RsvpsService) {}

  @Get()
  findAll(@Request() req) {
    return this.rsvpsService.findAllForUser(req.user.id);
  }

  @Post()
  upsert(@Request() req, @Body() dto: UpsertRsvpDto) {
    return this.rsvpsService.upsert(req.user.id, dto);
  }

  @Delete(':targetType/:targetId')
  remove(
    @Request() req,
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.rsvpsService.remove(req.user.id, targetType, targetId);
  }
}
