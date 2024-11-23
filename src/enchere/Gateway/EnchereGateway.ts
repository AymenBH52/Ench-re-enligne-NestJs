import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SubscriptionService } from 'src/subscribers/subscription.service';

interface User {
  username: string;
  role: { id: number; name: string };
}

interface Offer {
  amount: number;
  timestamp: Date;
  user: User;
}

@WebSocketGateway({
  namespace: 'auction',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class EnchereGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger('EnchereGateway');

  constructor(private subService: SubscriptionService) {}

  @WebSocketServer()
  server: Server;

  private activeUsers: Map<string, User[]> = new Map();
  private userSockets: Map<string, { socketId: string; room: string }> =
    new Map();
  private offers: Map<string, Offer[]> = new Map(); // Store offers for each auction

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [username, data] of this.userSockets.entries()) {
      if (data.socketId === client.id) {
        this.userSockets.delete(username);
        break;
      }
    }
  }

  async checkSubscription(username: string, enchereId: number) {
    return await this.subService.checkSubscription(username, enchereId);
  }

  private initializeAuctionOffers(auctionId: string) {
    if (!this.offers.has(auctionId)) {
      this.offers.set(auctionId, []);
    }
  }

  private getAuctionOffers(auctionId: string): Offer[] {
    return this.offers.get(auctionId) || [];
  }

  private addOffer(auctionId: string, offer: Offer) {
    this.initializeAuctionOffers(auctionId);
    const auctionOffers = this.offers.get(auctionId);
    auctionOffers.push(offer);
    // Sort offers by amount in descending order
    auctionOffers.sort((a, b) => b.amount - a.amount);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    if (!data || !data.auctionId || !data.user) {
      return { status: 'error', message: 'Invalid data format' };
    }

    const { auctionId, user } = data;

    const isSubscribed = await this.checkSubscription(
      user.username,
      parseInt(auctionId),
    );

    if (!isSubscribed) {
      this.logger.warn(
        `User ${user.username} is not subscribed to auction ${auctionId}`,
      );
      client.emit('error', {
        error: 'User is not subscribed to this auction',
      });
      return;
    }

    this.userSockets.set(user.username, {
      socketId: client.id,
      room: auctionId,
    });

    if (!this.activeUsers.has(auctionId)) {
      this.activeUsers.set(auctionId, []);
    }

    const roomUsers = this.activeUsers.get(auctionId);

    const existingUserIndex = roomUsers.findIndex(
      (u) => u.username === user.username,
    );
    if (existingUserIndex === -1) {
      roomUsers.push(user);
    }

    await client.join(auctionId);
    this.logger.log(`Client ${client.id} joined room ${auctionId}`);

    // Send current offers along with join confirmation
    const currentOffers = this.getAuctionOffers(auctionId);

    this.server.to(auctionId).emit('userJoined', {
      user,
      activeUsers: roomUsers,
      currentOffers,
      message: `${user.username} joined the auction`,
    });

    return {
      status: 'success',
      message: 'Joined room successfully',
      currentOffers,
    };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    if (!data || !data.auctionId || !data.username) {
      this.logger.error('Invalid leave room data received:', data);
      return;
    }

    const { auctionId, username } = data;
    this.userSockets.delete(username);

    const roomUsers = this.activeUsers.get(auctionId);
    if (roomUsers) {
      const userIndex = roomUsers.findIndex((u) => u.username === username);
      if (userIndex !== -1) {
        const user = roomUsers[userIndex];
        roomUsers.splice(userIndex, 1);

        client.leave(auctionId);

        this.server.to(auctionId).emit('userLeft', {
          user,
          activeUsers: roomUsers,
          message: `${username} left the auction`,
        });

        if (roomUsers.length === 0) {
          this.activeUsers.delete(auctionId);
        }
      }
    }
  }

  @SubscribeMessage('NewOffer')
  async handleNewOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    if (!data || !data.auctionId || !data.user || !data.offer) {
      return { status: 'error', message: 'Invalid data format' };
    }

    const { auctionId, user, offer } = data;

    const isSubscribed = await this.checkSubscription(
      user.username,
      parseInt(auctionId),
    );

    if (!isSubscribed) {
      this.logger.warn(
        `User ${user.username} attempted to bid without subscription`,
      );
      client.emit('error', {
        error: 'User is not subscribed to this auction',
      });
      return;
    }

    // Validate the offer
    const currentOffers = this.getAuctionOffers(auctionId);
    const highestBid = currentOffers[0]?.amount || 0;

    // if (offer.amount <= highestBid) {
    //   client.emit('error', {
    //     error: 'Offer must be higher than the current highest bid',
    //   });
    //   return;
    // }

    // Create new offer object with timestamp
    const newOffer: Offer = {
      amount: offer.amount,
      timestamp: new Date(),
      user: user,
    };

    // Add the offer to storage
    this.addOffer(auctionId, newOffer);

    // Get updated offers list
    const updatedOffers = this.getAuctionOffers(auctionId);

    // Notify all participants
    this.server.to(auctionId).emit('offerUpdate', {
      auctionId,
      newOffer,
      allOffers: updatedOffers,
      highestBid: updatedOffers[0],
    });

    return {
      status: 'success',
      message: 'Offer placed successfully',
      offer: newOffer,
      allOffers: updatedOffers,
    };
  }

  @SubscribeMessage('getAuctionOffers')
  handleGetOffers(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    if (!data || !data.auctionId) {
      return { status: 'error', message: 'Invalid data format' };
    }

    const { auctionId } = data;
    const offers = this.getAuctionOffers(auctionId);

    return {
      status: 'success',
      offers,
    };
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { timestamp: new Date() });
  }
}