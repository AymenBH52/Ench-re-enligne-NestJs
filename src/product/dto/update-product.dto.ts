import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {


  @IsOptional() 
  @IsString()
  name?: string;

  @IsOptional()  
  @IsString()
  description?: string;

  @IsOptional()  
  @IsNumber()
  price?: number;

  @IsOptional()  
  @IsString()
  imageUrl?: string;

  @IsOptional()  
  @IsNumber()
  categoryId?: number;
}


