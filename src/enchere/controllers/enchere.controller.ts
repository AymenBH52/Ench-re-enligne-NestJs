import { diskStorage, Multer } from 'multer';
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Request,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { EnchereService } from '../services/enchere.service';
import { CreateEnchereDto } from '../dto/create-enchere.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';

@Controller('encheres')
export class EnchereController {
  private readonly logger = new Logger(EnchereController.name);

  constructor(private readonly enchereService: EnchereService) {}

  @UseGuards(JwtGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: join(__dirname, '../../../public/uploads/images/encheres'),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Invalid file type'), false);
        }
        callback(null, true);
      },
    }),
  )
  async createEnchere(
    @Request() req: any,
    @Body() createEnchereDto: CreateEnchereDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image) {
      this.logger.error('Image not saved in folder');
      throw new Error('Image not saved in folder');
    }
    return this.enchereService.createEnchere(req, createEnchereDto, image);
  }

  @Get()
  async getAllEncheres() {
    return this.enchereService.getEncheres();
  }

  @Post(':id/close')
  async closeEnchere(@Request() req: any, @Param('id') enchereId: number) {
    return this.enchereService.closeEnchere(req, enchereId);
  }

  @Get(':id')
  async getEnchere(@Param('id') enchereId: number) {
    return this.enchereService.getEnchereById(enchereId);
  }
}
