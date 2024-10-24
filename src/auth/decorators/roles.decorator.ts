import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from 'src/users/enums/enums';

export const ROLE_KEY = 'role';
export const Role = (role: RoleEnum) => SetMetadata(ROLE_KEY, role);
