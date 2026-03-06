import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { DuesService } from './dues.service';
import { CreateDuesConfigDto } from './dto/create-dues-config.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { GenerateDuesDto } from './dto/generate-dues.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dues')
export class DuesController {
  constructor(private readonly duesService: DuesService) {}

  @Get('config')
  getConfig() {
    return this.duesService.getConfig();
  }

  @Post('config')
  @Roles(Role.SUPER_ADMIN)
  setConfig(@Body() dto: CreateDuesConfigDto, @Request() req) {
    return this.duesService.setConfig(dto, req.user.role);
  }

  @Get('summary')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PRESIDENTE, Role.SECRETARIO, Role.TESORERO)
  getSummary(@Query('month') month: string, @Query('year') year: string) {
    return this.duesService.getSummary(Number(month), Number(year));
  }

  @Get()
  findAll(@Request() req) {
    return this.duesService.findAll(req.user);
  }

  @Post('generate')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PRESIDENTE, Role.SECRETARIO, Role.TESORERO)
  generateMonthlyDues(@Body() dto: GenerateDuesDto) {
    return this.duesService.generateMonthlyDues(dto.month, dto.year);
  }

  @Post()
  @Roles(Role.TESORERO)
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.duesService.createPayment(dto);
  }

  @Patch(':id')
  @Roles(Role.TESORERO)
  updatePayment(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.duesService.updatePayment(id, dto);
  }
}
