import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
import { Category } from 'src/category/entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express/multer';
import { join } from 'path';
import { diskStorage } from 'multer';
@Module({
  imports: [TypeOrmModule.forFeature([Product, Category]), MulterModule.register({
    storage: diskStorage({
      destination: join(__dirname, '..', 'uploads'),
      filename: (req, file, callback) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        callback(null, uniqueName);
      },
    }),
  }),],
  

  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
