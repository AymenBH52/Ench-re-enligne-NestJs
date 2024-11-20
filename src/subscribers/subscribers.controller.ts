import { Controller, Get, Param, Post } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  // Subscribe a user to an enchere
  @Post('subscribe/:userId/:enchereId')
  async subscribe(
    @Param('userId') userId: number,
    @Param('enchereId') enchereId: number,
  ) {
    return this.subscribersService.subscribe(userId, enchereId);
  }

  // Get all subscribers for a specific enchere
  @Get('enchere/:enchereId')
  async getSubscribersForEnchere(@Param('enchereId') enchereId: number) {
    return this.subscribersService.getSubscribersForEnchere(enchereId);
  }

  // Get all encheres that a user is subscribed to
  @Get('user/:userId')
  async getEncheresForUser(@Param('userId') userId: number) {
    return this.subscribersService.getEncheresForUser(userId);
  }

  // Check if user subscribed to enchere
  @Get('check/:username/:enchereId')
  async checkSubscription(
    @Param('username') username: string,
    @Param('enchereId') enchereId: number,
  ) {
    return this.subscribersService.checkSubscription(username, enchereId);
  }
}
