/* eslint-disable prettier/prettier */

import { Role } from '../entities/role.entity';

export class UserResponseDto {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: Role;
  isActive: boolean;

  profilePicture: string;
  country: string;
  countryid: string;
}
