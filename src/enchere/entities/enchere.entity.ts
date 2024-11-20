import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { StatusEnum } from '../enums/enums';
import { Subscribers } from 'src/subscribers/subscribers.entity';

@Entity()
export class Enchere {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ nullable: true, type: 'timestamp' })
  endDate: Date;

  @Column({ nullable: true, default: 0 })
  duration: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('enum', { enum: StatusEnum })
  status: StatusEnum;

  @ManyToOne(() => User, (user) => user.encheres)
  seller: number;

  @OneToMany(() => Subscribers, (subscribers) => subscribers.enchere)
  subscribers: Subscribers[];

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true, default: 0 })
  totalBids: number;

  @Column({ nullable: true, default: 0 })
  currentHighestPrice: number;

  @Column({ nullable: true, default: 0 })
  viewCount: number;
}
