import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_EMAIL,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  async sendAuctionStartNotification(
    user: User,
    enchereTitle: string,
  ): Promise<void> {
    const mailOptions = {
      from: process.env.MAIL_EMAIL,
      to: user.email,
      subject: `Auction Started: ${enchereTitle}`,
      text: `The auction '${enchereTitle}' has started! Don't miss out on your chance to participate.`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}
