import { UUID } from 'crypto';
import { Role } from 'src/users/entities/role.entity';

export type AccessTokenPayload = {
  sub: number;
  username: string;
  email: string;
  role: Role;
};
