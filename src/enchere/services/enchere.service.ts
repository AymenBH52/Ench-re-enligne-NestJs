import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enchere } from './../entities/enchere.entity';
import { User } from 'src/users/entities/user.entity';
import { StatusEnum } from '../enums/enums';
import { CreateEnchereDto } from '../dto/create-enchere.dto';

@Injectable()
export class EnchereService {
  constructor(
    @InjectRepository(Enchere)
    private enchereRepository: Repository<Enchere>,
  ) {}

  async createEnchere(createEnchereDto: CreateEnchereDto): Promise<Enchere> {
    const enchere = this.enchereRepository.create({
      ...createEnchereDto,
      status: StatusEnum.OPEN,
    });
    return this.enchereRepository.save(enchere);
  }

  async getEncheres(): Promise<Enchere[]> {
    return this.enchereRepository.find({ relations: ['createdBy'] });
  }

  async closeEnchere(enchereId: number): Promise<Enchere> {
    const enchere = await this.enchereRepository.findOne({
      where: { id: enchereId },
    });
    if (enchere) {
      enchere.status = StatusEnum.CLOSED;
      return this.enchereRepository.save(enchere);
    }
    throw new Error('Enchere not found');
  }
}
