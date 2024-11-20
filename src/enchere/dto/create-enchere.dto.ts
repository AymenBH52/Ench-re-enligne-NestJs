import {
  IsString,
  IsDate,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { StatusEnum } from '../enums/enums';
import { User } from 'src/users/entities/user.entity';

export class CreateEnchereDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDate()
  startDate: Date;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsEnum(StatusEnum)
  status: StatusEnum;

  @IsOptional()
  image: any;
}
