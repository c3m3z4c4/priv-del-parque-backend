import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DuesConfig } from './dues-config.entity';
import { DuesPayment } from './dues-payment.entity';
import { User } from '../users/users.entity';
import { DuesService } from './dues.service';
import { DuesController } from './dues.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DuesConfig, DuesPayment, User])],
  controllers: [DuesController],
  providers: [DuesService],
  exports: [DuesService],
})
export class DuesModule {}
