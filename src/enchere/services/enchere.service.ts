import { diskStorage } from 'multer';
import { Express } from 'express';
import { Multer } from 'multer';
import {
  Injectable,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Enchere } from './../entities/enchere.entity';
import { User } from 'src/users/entities/user.entity';
import { StatusEnum } from '../enums/enums';
import { CreateEnchereDto } from '../dto/create-enchere.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UsersService } from 'src/users/services/users.service';
import { Subscribers } from 'src/subscribers/subscribers.entity';

@Injectable()
export class EnchereService {
  constructor(
    @InjectRepository(Enchere)
    private enchereRepository: Repository<Enchere>,
    private usersService: UsersService,
    @InjectRepository(Subscribers)
    private readonly subscriptionRepository: Repository<Subscribers>,
  ) {}

  @UseGuards(JwtGuard)
  async createEnchere(
    @Request() req: any,
    createEnchereDto: CreateEnchereDto,
    file: Express.Multer.File,
  ): Promise<Enchere> {
    console.log('USER: ', req.user);
    try {
      const user = await this.usersService.findByUsername(req.user.username);
      console.log(createEnchereDto);
      const enchere = this.enchereRepository.create({
        ...createEnchereDto,
        seller: user.id,
      });
      if (file) {
        enchere.image = file.filename;
      }

      return this.enchereRepository.save(enchere);
    } catch (error) {
      console.log('ERROR: ', error);
      throw new Error('Error creating enchere');
    }
  }

  @UseGuards(JwtGuard)
  async getEncheres(): Promise<Enchere[]> {
    return this.enchereRepository.find({ relations: ['seller'] });
  }

  @UseGuards(JwtGuard)
  async updateEnchere(
    enchereId: number,
    dto: CreateEnchereDto,
  ): Promise<Enchere> {
    const enchere = await this.enchereRepository.findOne({
      where: { id: enchereId },
    });
    if (enchere) {
      enchere.title = dto.title;
      enchere.description = dto.description;
      enchere.startDate = dto.startDate;
      enchere.duration = dto.duration;
      enchere.status = dto.status;

      return this.enchereRepository.save(enchere);
    }
    throw new Error('Enchere not found');
  }

  @UseGuards(JwtGuard)
  async closeEnchere(@Request() req: any, enchereId: number): Promise<Enchere> {
    const enchere = await this.enchereRepository.findOne({
      where: { id: enchereId },
    });
    if (
      enchere &&
      enchere.status === StatusEnum.OPEN &&
      enchere.endDate < new Date() &&
      enchere.startDate < new Date()
    ) {
      const user = await this.usersService.findByUsername(req.user.username);

      if (enchere.seller !== user.id) {
        throw new Error('You are not allowed to close this enchere');
      }
      enchere.status = StatusEnum.CLOSED;
      return this.enchereRepository.save(enchere);
    }
    throw new Error('Enchere not found');
  }

  @UseGuards(JwtGuard)
  async deleteEnchere(enchereId: number): Promise<Enchere> {
    const enchere = await this.enchereRepository.findOne({
      where: { id: enchereId },
    });
    if (enchere) {
      return this.enchereRepository.remove(enchere);
    }
    throw new Error('Enchere not found');
  }

  @UseGuards(JwtGuard)
  async getEnchereById(enchereId: number): Promise<Enchere> {
    return this.enchereRepository.findOne({
      where: { id: enchereId },
      relations: ['seller'],
    });
  }

  @UseGuards(JwtGuard)
  async getEncheresByUser(@Request() req: any): Promise<Enchere[]> {
    const user = await this.usersService.findByUsername(req.user.username);
    return this.enchereRepository.find({
      where: { seller: user.id },
    });
  }

  async findStartingNowAuctions(targetTime: Date): Promise<Enchere[]> {
    const startWindow = new Date(targetTime.getTime() - 60000);
    const endWindow = new Date(targetTime.getTime() + 60000);

    const auctions = await this.enchereRepository.find({
      where: {
        startDate: Between(startWindow, endWindow),
      },
      relations: ['seller'],
    });

    return auctions;
  }

  async findRecentlyStartedAuctions(
    startTime: Date,
    endTime: Date,
  ): Promise<Enchere[]> {
    return this.enchereRepository.find({
      where: {
        startDate: Between(startTime, endTime),
      },
    });
  }
  async getUsersSubscribedToAuction(enchereId: number): Promise<User[]> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { enchere: { id: enchereId } },
      relations: ['user'],
    });

    return subscriptions.map((subscription) => subscription.user);
  }

  async findAuctionsStartingAt(targetTime: Date): Promise<Enchere[]> {
    const buffer = 30 * 1000;
    const startRange = new Date(targetTime.getTime() - buffer);
    const endRange = new Date(targetTime.getTime() + buffer);

    const auctions = await this.enchereRepository.find({
      where: {
        startDate: Between(startRange, endRange),
        status: StatusEnum.OPEN,
      },
      relations: ['seller'],
    });

    auctions.forEach((auction) => {
      console.log(
        `Found auction: ${auction.title}, starts at: ${auction.startDate.toISOString()}`,
      );
    });

    return auctions;
  }
}
