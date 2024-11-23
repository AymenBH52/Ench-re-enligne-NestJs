import { Module } from '@nestjs/common';
import { OfferController } from './controller/offer.controller';
import { OfferService } from './services/offer.service';
import { Offer } from './entities/offer.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enchere } from 'src/enchere/entities/enchere.entity';
import { EnchereService } from 'src/enchere/services/enchere.service';
import { Role } from 'src/users/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/services/users.service';
import { Subscription } from 'src/subscribers/subscription.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Enchere, User, Role, Offer, Subscription]),
  ],
  controllers: [OfferController],
  providers: [OfferService, EnchereService, UsersService],
  exports: [OfferService],
})
export class OfferModule {}
