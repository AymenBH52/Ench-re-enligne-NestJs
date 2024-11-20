import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EnchereService } from './enchere.service';
import { NotificationService } from './notification.service';
import { EnchereNotification } from '../entities/enchereNotification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { Enchere } from '../entities/enchere.entity';

@Injectable()
export class AuctionNotificationService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly enchereService: EnchereService,
    @InjectRepository(EnchereNotification)
    private notificationRepository: Repository<EnchereNotification>,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async notifySubscribersOfAuctionTimings() {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    try {
      // 5-minute notifications
      const upcomingAuctions =
        await this.enchereService.findAuctionsStartingAt(fiveMinutesFromNow);

      // Starting now notifications
      const startingNow =
        await this.enchereService.findStartingNowAuctions(now);

      // Just started notifications
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
      const recentlyStarted =
        await this.enchereService.findRecentlyStartedAuctions(
          thirtySecondsAgo,
          now,
        );

      await Promise.all([
        this.processStartNotifications(startingNow),
        this.processStartedNotifications(recentlyStarted),
      ]);
    } catch (error) {
      console.error('Error in notification service:', error);
    }
  }

  private async processStartNotifications(auctions: Enchere[]) {
    for (const auction of auctions) {
      try {
        const existingNotification = await this.notificationRepository.findOne({
          where: {
            auctionId: auction.id,
            notificationType: 'start',
            sentAt: MoreThan(new Date(Date.now() - 60 * 1000)), // Check last minute
          },
        });

        if (existingNotification) {
          continue;
        }

        const subscribers =
          await this.enchereService.getUsersSubscribedToAuction(auction.id);

        if (subscribers.length > 0) {
          await Promise.all(
            subscribers.map((user) =>
              this.notificationService.sendAuctionStartNotification(
                user,
                `${auction.title} is starting now!`,
              ),
            ),
          );

          await this.notificationRepository.save({
            auctionId: auction.id,
            notificationType: 'start',
            sentAt: new Date(),
          });
        }
      } catch (error) {
        console.error(
          `Error processing start notification for auction ${auction.id}:`,
          error,
        );
      }
    }
  }

  private async processStartedNotifications(auctions: Enchere[]) {
    for (const auction of auctions) {
      try {
        const existingNotification = await this.notificationRepository.findOne({
          where: {
            auctionId: auction.id,
            notificationType: 'started',
            sentAt: MoreThan(new Date(Date.now() - 60 * 1000)), // Check last minute
          },
        });

        if (existingNotification) {
          console.log(`Started notification already sent for ${auction.title}`);
          continue;
        }

        const subscribers =
          await this.enchereService.getUsersSubscribedToAuction(auction.id);

        if (subscribers.length > 0) {
          await Promise.all(
            subscribers.map((user) =>
              this.notificationService.sendAuctionStartNotification(
                user,
                `The auction "${auction.title}" has started! You can now place your bids.`,
              ),
            ),
          );

          await this.notificationRepository.save({
            auctionId: auction.id,
            notificationType: 'started',
            sentAt: new Date(),
          });

          console.log(`Sent started notifications for ${auction.title}`);
        }
      } catch (error) {
        console.error(
          `Error processing started notification for auction ${auction.id}:`,
          error,
        );
      }
    }
  }
}
