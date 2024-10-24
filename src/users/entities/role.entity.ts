/* eslint-disable prettier/prettier */
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { RoleEnum } from '../enums/enums';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.USER,
  })
  name: RoleEnum;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
