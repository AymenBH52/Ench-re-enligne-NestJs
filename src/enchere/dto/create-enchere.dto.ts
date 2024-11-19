import { IsString, IsNumber, IsNotEmpty, Min, IsDate } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateEnchereDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsNotEmpty()
  user: User;
}
