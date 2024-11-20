import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enchere } from 'src/enchere/entities/enchere.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Subscribers } from './subscribers.entity';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectRepository(Subscribers)
    private readonly subscribersRepository: Repository<Subscribers>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Enchere)
    private readonly enchereRepository: Repository<Enchere>,
  ) {}

  // Subscribe a user to an enchere
  async subscribe(userId: number, enchereId: number): Promise<Subscribers> {
    const user = await this.userRepository.findOneBy({ id: userId });
    const enchere = await this.enchereRepository.findOneBy({ id: enchereId });

    if (!user || !enchere) {
      throw new Error('User or Enchere not found');
    }

    const subscriber = this.subscribersRepository.create({
      user,
      enchere,
    });

    return await this.subscribersRepository.save(subscriber);
  }

  // Get all subscribers for an enchere
  async getSubscribersForEnchere(enchereId: number): Promise<Subscribers[]> {
    return await this.subscribersRepository.find({
      where: { enchere: { id: enchereId } },
      relations: ['user', 'enchere'],
    });
  }

  // Get all encheres for a user
  async getEncheresForUser(userId: number): Promise<Enchere[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['subscribers', 'subscribers.enchere'],
    });

    return user?.subscribers.map((subscriber) => subscriber.enchere) ?? [];
  }

  // Check if user is subscribed to enchere
  async checkSubscription(
    username: string,
    enchereId: number,
  ): Promise<boolean> {
    try {
      console.log('Username: ' + username + ' EnchereId: ' + enchereId);

      const user = await this.userRepository.findOneBy({ username: username });
      console.log('User: ' + user.id + ' EnchereId: ' + enchereId);

      const subscriber = await this.subscribersRepository.findOne({
        where: { user: { id: user.id }, enchere: { id: enchereId } },
        relations: ['user', 'enchere'],
      });

      return !!subscriber;
    } catch (error) {
      console.log(error);
    }
  }
}
