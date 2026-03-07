import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { House } from './houses.entity';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';

@Injectable()
export class HousesService {
  constructor(
    @InjectRepository(House)
    private housesRepository: Repository<House>,
  ) {}

  async findAll(): Promise<House[]> {
    return this.housesRepository.find({
      relations: ['residents'],
      order: { houseNumber: 'ASC' },
    });
  }

  async findOne(id: string): Promise<House> {
    const house = await this.housesRepository.findOne({
      where: { id },
      relations: ['residents'],
    });
    if (!house) throw new NotFoundException(`Casa con id ${id} no encontrada`);
    return house;
  }

  async create(dto: CreateHouseDto): Promise<House> {
    const exists = await this.housesRepository.findOne({
      where: { houseNumber: dto.houseNumber },
    });
    if (exists)
      throw new ConflictException(
        `El número de casa "${dto.houseNumber}" ya existe`,
      );

    const house = this.housesRepository.create({
      houseNumber: dto.houseNumber,
      address: dto.address,
      status: dto.status ?? 'active',
    });
    return this.housesRepository.save(house);
  }

  async update(id: string, dto: UpdateHouseDto): Promise<House> {
    const house = await this.findOne(id);

    if (dto.houseNumber && dto.houseNumber !== house.houseNumber) {
      const exists = await this.housesRepository.findOne({
        where: { houseNumber: dto.houseNumber },
      });
      if (exists)
        throw new ConflictException(
          `El número de casa "${dto.houseNumber}" ya existe`,
        );
    }

    Object.assign(house, dto);
    return this.housesRepository.save(house);
  }

  async remove(id: string): Promise<void> {
    const house = await this.findOne(id);
    await this.housesRepository.remove(house);
  }

  async importHouses(
    houses: CreateHouseDto[],
  ): Promise<{ created: number; skipped: number; skippedNumbers: string[] }> {
    let created = 0;
    let skipped = 0;
    const skippedNumbers: string[] = [];

    for (const dto of houses) {
      const exists = await this.housesRepository.findOne({
        where: { houseNumber: dto.houseNumber },
      });
      if (exists) {
        skipped++;
        skippedNumbers.push(dto.houseNumber);
        continue;
      }
      const house = this.housesRepository.create({
        houseNumber: dto.houseNumber,
        address: dto.address,
        status: dto.status ?? 'active',
      });
      await this.housesRepository.save(house);
      created++;
    }

    return { created, skipped, skippedNumbers };
  }
}
