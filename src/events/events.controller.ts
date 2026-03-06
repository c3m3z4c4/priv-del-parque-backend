import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.enum';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  @Post()
  @Roles(Role.ADMIN, Role.PRESIDENTE, Role.SECRETARIO, Role.TESORERO)
  createEvent() {
    return 'Evento creado (solo admin)';
  }
}
