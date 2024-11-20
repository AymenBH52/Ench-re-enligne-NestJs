import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createProduct(createProductDto: CreateProductDto & { imageUrl: string }) {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }
  async getAllProducts() {
    return await this.productRepository.find({ relations: ['category'] });  
  }


  async updateProduct(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }
    const updatedProduct = Object.assign(product, updateProductDto);
    return await this.productRepository.save(updatedProduct);
  }
  async deleteProduct(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }
    await this.productRepository.remove(product);
    return { message: 'Product deleted successfully' };
  }
}
