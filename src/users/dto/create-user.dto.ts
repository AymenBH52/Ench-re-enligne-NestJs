/* eslint-disable prettier/prettier */
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Role } from '../entities/role.entity';
import { RoleEnum } from '../enums/enums';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEnum(RoleEnum)
  @IsString()
  role: RoleEnum;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  countryid?: string;
}
