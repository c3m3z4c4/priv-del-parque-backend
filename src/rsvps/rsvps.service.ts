import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rsvp } from './rsvp.entity';
import { UpsertRsvpDto } from './dto/upsert-rsvp.dto';

@Injectable()
export class RsvpsService {
  constructor(
    @InjectRepository(Rsvp)
    private rsvpsRepo: Repository<Rsvp>,
  ) {}

  async findAllForUser(userId: string): Promise<Rsvp[]> {
    return this.rsvpsRepo.find({ where: { userId } });
  }

  async findAllForTarget(targetType: string, targetId: string): Promise<Rsvp[]> {
    return this.rsvpsRepo.find({ where: { targetType: targetType as any, targetId } });
  }

  async upsert(userId: string, dto: UpsertRsvpDto): Promise<Rsvp> {
    const existing = await this.rsvpsRepo.findOne({
      where: { userId, targetType: dto.targetType, targetId: dto.targetId },
    });
    if (existing) {
      existing.status = dto.status;
      return this.rsvpsRepo.save(existing);
    }
    const rsvp = this.rsvpsRepo.create({ userId, ...dto });
    return this.rsvpsRepo.save(rsvp);
  }

  async remove(userId: string, targetType: string, targetId: string): Promise<void> {
    const rsvp = await this.rsvpsRepo.findOne({
      where: { userId, targetType: targetType as any, targetId },
    });
    if (rsvp) await this.rsvpsRepo.remove(rsvp);
  }
}
