/* eslint-disable prettier/prettier */
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @MinLength(6)
  @MaxLength(20)
  @IsNotEmpty()
  @IsString()
  password: string;
}
