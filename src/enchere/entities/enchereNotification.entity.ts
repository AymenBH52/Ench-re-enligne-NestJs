import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class EnchereNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  auctionId: number;

  @Column()
  notificationType: string; // 'five_minutes' or 'start'

  @Column()
  sentAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
