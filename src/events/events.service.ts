import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GreenAreaEvent } from './events.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ConflictService } from '../shared/conflict.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(GreenAreaEvent)
    private eventsRepo: Repository<GreenAreaEvent>,
    private conflictService: ConflictService,
  ) {}

  async findAll(): Promise<GreenAreaEvent[]> {
    return this.eventsRepo.find({ order: { date: 'ASC', startTime: 'ASC' } });
  }

  async findOne(id: string): Promise<GreenAreaEvent> {
    const event = await this.eventsRepo.findOne({ where: { id } });
    if (!event)
      throw new NotFoundException(`Evento con id ${id} no encontrado`);
    return event;
  }

  async create(dto: CreateEventDto, userId?: string): Promise<GreenAreaEvent> {
    const conflict = await this.conflictService.checkConflict(
      dto.date,
      dto.startTime,
      dto.endTime,
    );
    if (conflict)
      throw new ConflictException(
        'Ya existe un evento o reunión en ese horario',
      );

    const event = this.eventsRepo.create({
      ...dto,
      createdById: userId,
    });
    return this.eventsRepo.save(event);
  }

  async update(id: string, dto: UpdateEventDto): Promise<GreenAreaEvent> {
    const event = await this.findOne(id);

    const date = dto.date ?? event.date;
    const startTime = dto.startTime ?? event.startTime;
    const endTime = dto.endTime ?? event.endTime;

    const conflict = await this.conflictService.checkConflict(
      date,
      startTime,
      endTime,
      id,
      undefined,
    );
    if (conflict)
      throw new ConflictException(
        'Ya existe un evento o reunión en ese horario',
      );

    Object.assign(event, dto);
    return this.eventsRepo.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventsRepo.remove(event);
  }
}
