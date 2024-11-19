import { Controller, Post, Body, UseInterceptors, UploadedFile, Get, Delete, Param, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Express } from 'express';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads', // Répertoire où les fichiers seront stockés
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName); // Nomme le fichier avec un timestamp unique
        },
      }),
    }),
  )
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    
    const imageUrl = image ? `/uploads/${image.filename}` : null;
    return this.productService.createProduct({ ...createProductDto, imageUrl });
  }


  @Get()
  async getProducts() {
    return await this.productService.getAllProducts();
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const imageUrl = image ? `/uploads/${image.filename}` : null;
    return this.productService.updateProduct(id, { ...updateProductDto, imageUrl });
  }

  // Route pour supprimer un produit
  @Delete(':id')
  async deleteProduct(@Param('id') id: number) {
    return this.productService.deleteProduct(id);
  }
}
