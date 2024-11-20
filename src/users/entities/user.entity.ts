/* eslint-disable prettier/prettier */
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Enchere } from 'src/enchere/entities/enchere.entity';
import { Subscription } from 'src/subscribers/subscription.entity';
import { Offer } from 'src/offer/entities/offer.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  profilePicture: string;

  @Column()
  country: string;

  @Column()
  countryid: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  @OneToMany(() => Enchere, (auction) => auction.seller)
  encheres: Enchere[];

  @OneToMany(() => Subscription, (subscribers) => subscribers.user)
  subscribers: Subscription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, default: 0 })
  rating: number;

  //Relatiion with Offer
  @OneToMany(() => Offer, (offer) => offer.user)
  offers: Offer[];
}
