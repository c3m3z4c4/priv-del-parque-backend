import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DuesConfig } from './dues-config.entity';
import { DuesPayment } from './dues-payment.entity';
import { User } from '../users/users.entity';
import { Role, ADMIN_ROLES } from '../auth/roles.enum';
import { CreateDuesConfigDto } from './dto/create-dues-config.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

const EXEMPT_ROLES: Role[] = [Role.PRESIDENTE, Role.SECRETARIO, Role.TESORERO];

@Injectable()
export class DuesService {
  constructor(
    @InjectRepository(DuesConfig)
    private configRepo: Repository<DuesConfig>,
    @InjectRepository(DuesPayment)
    private paymentRepo: Repository<DuesPayment>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getConfig(): Promise<DuesConfig | null> {
    return this.configRepo.findOne({
      where: {},
      order: { effectiveFrom: 'DESC' },
    });
  }

  async setConfig(dto: CreateDuesConfigDto, requestingRole: Role): Promise<DuesConfig> {
    if (requestingRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Solo SUPER_ADMIN puede configurar el monto de cuotas');
    }

    const now = new Date();
    const effectiveFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const config = this.configRepo.create({
      amount: dto.amount,
      effectiveFrom,
    });
    return this.configRepo.save(config);
  }

  async generateMonthlyDues(
    month: number,
    year: number,
  ): Promise<{ generated: number; exempt: number }> {
    const config = await this.getConfig();
    if (!config) {
      throw new NotFoundException('No hay configuración de cuotas. Configure el monto primero.');
    }

    const activeUsers = await this.userRepo.find({
      where: { isActive: true },
    });

    let generated = 0;
    let exempt = 0;

    for (const user of activeUsers) {
      const existing = await this.paymentRepo.findOne({
        where: { userId: user.id, month, year },
      });
      if (existing) continue;

      const isExempt = EXEMPT_ROLES.includes(user.role);

      const payment = new DuesPayment();
      payment.userId = user.id;
      payment.houseId = user.houseId || null;
      payment.month = month;
      payment.year = year;
      payment.amount = isExempt ? 0 : Number(config.amount);
      payment.status = isExempt ? 'exempt' : 'pending';
      payment.paidAt = null;
      await this.paymentRepo.save(payment);

      if (isExempt) {
        exempt++;
      } else {
        generated++;
      }
    }

    return { generated, exempt };
  }

  async findAll(user: { id: string; role: Role }): Promise<DuesPayment[]> {
    const isAdmin = ADMIN_ROLES.includes(user.role);

    if (isAdmin) {
      return this.paymentRepo.find({
        relations: ['user', 'house'],
        order: { year: 'DESC', month: 'DESC' },
      });
    }

    return this.paymentRepo.find({
      where: { userId: user.id },
      relations: ['user', 'house'],
      order: { year: 'DESC', month: 'DESC' },
    });
  }

  async findOne(id: string): Promise<DuesPayment> {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['user', 'house'],
    });
    if (!payment) throw new NotFoundException(`Pago con id ${id} no encontrado`);
    return payment;
  }

  async createPayment(dto: CreatePaymentDto): Promise<DuesPayment> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException(`Usuario con id ${dto.userId} no encontrado`);

    const existing = await this.paymentRepo.findOne({
      where: { userId: dto.userId, month: dto.month, year: dto.year },
    });
    if (existing) {
      throw new ConflictException(
        `Ya existe un registro de pago para este usuario en ${dto.month}/${dto.year}`,
      );
    }

    const config = await this.getConfig();
    const amount = config ? Number(config.amount) : 0;

    const payment = new DuesPayment();
    payment.userId = dto.userId;
    payment.houseId = user.houseId || null;
    payment.month = dto.month;
    payment.year = dto.year;
    payment.amount = amount;
    payment.status = dto.status || 'pending';
    payment.paidAt = dto.paidAt || null;
    payment.notes = dto.notes || null;
    return this.paymentRepo.save(payment);
  }

  async updatePayment(id: string, dto: UpdatePaymentDto): Promise<DuesPayment> {
    const payment = await this.findOne(id);
    if (dto.status !== undefined) payment.status = dto.status;
    if (dto.notes !== undefined) payment.notes = dto.notes;
    if (dto.paidAt !== undefined) payment.paidAt = dto.paidAt;
    if (dto.status === 'paid' && !payment.paidAt) {
      payment.paidAt = new Date().toISOString().split('T')[0];
    }
    return this.paymentRepo.save(payment);
  }

  async getSummary(month: number, year: number) {
    const payments = await this.paymentRepo.find({
      where: { month, year },
    });

    const total = payments.length;
    const paid = payments.filter((p) => p.status === 'paid').length;
    const pending = payments.filter((p) => p.status === 'pending').length;
    const exempt = payments.filter((p) => p.status === 'exempt').length;
    const totalAmount = payments
      .filter((p) => p.status !== 'exempt')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const collectedAmount = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return { total, paid, pending, exempt, totalAmount, collectedAmount };
  }
}
