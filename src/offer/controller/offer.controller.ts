import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateOfferDto } from "../dto/create-offer.dto";
import { OfferService } from "../services/offer.service";


@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  // Creating a new offer for a buyer
  @Post()
  async createOffer(@Body() createOfferDto: CreateOfferDto) {

    return this.offerService.createOffer(createOfferDto);
  }
  
  // Get all offers for a specific enchere
  @Get('/:enchereId')
  async getOffersByEnchere(@Param('enchereId') enchereId: number) {

    return this.offerService.getOffersByEnchere(enchereId);
  }

  // Get the winner offer for a specific enchere
  @Get('winner/:enchereId')
  async getWinnerOffer(@Param('enchereId') enchereId: number) {

    return this.offerService.getWinnerOffer(enchereId);
  }
}