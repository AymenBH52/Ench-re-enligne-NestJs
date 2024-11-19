import { Module } from '@nestjs/common';
import { Enchere } from './entities/enchere.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnchereController } from './controllers/enchere.controller';
import { EnchereService } from './services/enchere.service';

@Module({
  imports: [TypeOrmModule.forFeature([Enchere])],
  controllers: [EnchereController],
  providers: [EnchereService],
})
export class EnchereModule {}
