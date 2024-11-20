import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Offer } from "../entities/offer.entity";
import { Repository } from "typeorm";
import { CreateOfferDto } from "../dto/create-offer.dto";
import { Enchere } from "src/enchere/entities/enchere.entity";
import { User } from "src/users/entities/user.entity";

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Enchere)
    private readonly enchereRepository: Repository<Enchere>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {} 


  // Create a new offer for a buyer
  async createOffer(createOfferDto: CreateOfferDto): Promise<Offer> {
    const { userId, enchereId, amount } = createOfferDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const enchere = await this.enchereRepository.findOne({ where: { id: enchereId } });
    if (!enchere) throw new NotFoundException('Enchere not found');

    const newOffer = this.offerRepository.create({
        user,
        enchere,
        amount,
    });
    return this.offerRepository.save(newOffer);
  }

  // Get all offers for a specific enchere
  async getOffersByEnchere(enchereId: number): Promise<Offer[]> {

    return this.offerRepository.find({ where: { enchere: { id: enchereId } } });

  }

  // Get the winner offer for a specific enchere
  async getWinnerOffer(enchereId: number): Promise<Offer> {

    const offers = await this.offerRepository.find({ where: { enchere: { id: enchereId } } });

    const winner = offers.reduce((prev, current) => (prev.amount > current.amount ? prev : current));

    winner.isWinner = true;

    await this.offerRepository.save(winner);
    
    return winner;
  }

}