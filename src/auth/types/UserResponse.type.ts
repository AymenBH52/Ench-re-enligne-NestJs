import { User } from 'src/users/entities/user.entity';

export type RegisterResponse = Omit<User, 'password'>;
