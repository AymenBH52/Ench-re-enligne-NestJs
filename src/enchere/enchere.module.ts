import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnchereService } from './services/enchere.service';
import { Enchere } from './entities/enchere.entity';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';
import { EnchereController } from './controllers/enchere.controller';
import { Role } from 'src/auth/decorators/roles.decorator';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Subscription } from 'src/subscribers/subscription.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { AuctionNotificationService } from './services/auctionNotification.service';
import { NotificationService } from './services/notification.service';
import { EnchereNotification } from './entities/enchereNotification.entity';
import { EnchereGateway } from './Gateway/EnchereGateway';
import { SubscriptionService } from 'src/subscribers/subscription.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Enchere,
      User,
      Role,
      Subscription,
      EnchereNotification,
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'), // Make sure 'public' is the root folder for static assets
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: '../public/uploads/images/encheres',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [EnchereController],
  providers: [
    EnchereService,
    UsersService,
    AuctionNotificationService,
    NotificationService,
    EnchereGateway,
    SubscriptionService,
  ],
  exports: [EnchereService],
})
export class EnchereModule {}
