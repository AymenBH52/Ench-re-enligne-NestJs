import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { StatusEnum } from '../enums/enums';

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

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ nullable: true, default: 0 })
  duration: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('enum', { enum: StatusEnum, default: StatusEnum.OPEN })
  status: StatusEnum;

  @ManyToOne(() => User, (user) => user.encheres)
  createdBy: User;
}
