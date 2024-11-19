import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { EnchereService } from '../services/enchere.service';
import { CreateEnchereDto } from '../dto/create-enchere.dto';

@Controller('encheres')
export class EnchereController {
  constructor(private readonly enchereService: EnchereService) {}

  @Post('create')
  async createEnchere(@Body() createEnchereDto: CreateEnchereDto) {
    return this.enchereService.createEnchere(createEnchereDto);
  }

  @Get()
  async getAllEncheres() {
    return this.enchereService.getEncheres();
  }

  @Post(':id/close')
  async closeEnchere(@Param('id') enchereId: number) {
    return this.enchereService.closeEnchere(enchereId);
  }
}
