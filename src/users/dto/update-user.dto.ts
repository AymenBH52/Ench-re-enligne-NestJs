/* eslint-disable prettier/prettier */

import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Role } from '../entities/role.entity';

export class UpdateUserDto {
  @IsOptional()
  id?: number;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  lastname?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  stateid?: string;

  @IsString()
  @IsOptional()
  countryid?: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  about?: string;
}
