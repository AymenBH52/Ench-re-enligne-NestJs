import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { StatusEnum } from '../enums/enums';
import { Subscription } from 'src/subscribers/subscription.entity';
import { Product } from 'src/product/entities/product.entity';
import { Offer } from 'src/offer/entities/offer.entity';

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

  @OneToMany(() => Subscription, (subscribers) => subscribers.enchere)
  subscribers: Subscription[];

  @ManyToOne(() => Product, { onDelete: 'CASCADE', eager: true })
  product: Product;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true, default: 0 })
  totalBids: number;

  @Column({ nullable: true, default: 0 })
  currentHighestPrice: number;

  @Column({ nullable: true, default: 0 })
  viewCount: number;

  //Relation with Offer
  @OneToMany(() => Offer, (offer) => offer.enchere)
  offers: Offer[];

}
