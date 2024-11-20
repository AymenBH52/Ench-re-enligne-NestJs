import { Enchere } from 'src/enchere/entities/enchere.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Subscribers {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.subscribers)
  user: User;

  @ManyToOne(() => Enchere, (enchere) => enchere.subscribers)
  enchere: Enchere;
}
