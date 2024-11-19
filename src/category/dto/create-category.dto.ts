import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
    id:number;
  @IsNotEmpty()
  @IsString()
  name: string;

  
}
