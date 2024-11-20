import { Enchere } from "src/enchere/entities/enchere.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number; 
  @ManyToOne(() => User, user => user.offers)
  @JoinColumn({ name: 'userId' })
  user: User; 

  @ManyToOne(() => Enchere, enchere => enchere.offers)
  @JoinColumn({ name: 'enchereId' })
  enchere: Enchere; 

  @Column({ default: false })
  isWinner: boolean; 
}