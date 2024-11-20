import { Module } from '@nestjs/common';
import { SubscribersController } from './subscribers.controller';
import { SubscribersService } from './subscribers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enchere } from 'src/enchere/entities/enchere.entity';
import { Role } from 'src/users/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { Subscribers } from './subscribers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscribers, User, Enchere, Role])],
  controllers: [SubscribersController],
  providers: [SubscribersService],
})
export class SubscribersModule {}
