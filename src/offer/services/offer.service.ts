import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Offer } from "../entities/offer.entity";
import { Repository } from "typeorm";
import { CreateOfferDto } from "../dto/create-offer.dto";
import { Enchere } from "src/enchere/entities/enchere.entity";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/services/users.service";
import { EnchereService } from "src/enchere/services/enchere.service";

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Enchere)
    private readonly enchereRepository: Repository<Enchere>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private usersService: UsersService,
    private enchereService: EnchereService,
  ) {} 


  // Créer une offre
  async createOffer(data: {
    enchereId: number;
    userName: string;
    amount: number;
  }): Promise<any> {
    const { enchereId, userName, amount } = data;
    

    const user = await this.usersService.findByUsername(userName);
    const enchere = await this.enchereService.getEnchereById(enchereId);
    const offer = this.offerRepository.create({
      
      enchere ,
      user ,
      amount,
    });

    return this.offerRepository.save(offer);
  }

  // Obtenir la plus haute offre pour une enchère
  async getHighestOffer(enchereId: number): Promise<Offer> {
    return this.offerRepository
      .createQueryBuilder('offer')
      .where('offer.enchereId = :enchereId', { enchereId })
      .orderBy('offer.amount', 'DESC')
      .getOne();
  }

  // Mettre à jour l'état du gagnant
  async updateWinner(enchereId: number): Promise<void> {
    const highestOffer = await this.getHighestOffer(enchereId);

    if (highestOffer) {
      // Marquer l'offre comme gagnante
      await this.offerRepository.update(
        { id: highestOffer.id },
        { isWinner: true },
      );
    }
  }

}