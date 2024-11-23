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
  constructor(private subService: SubscriptionService) {}

  @WebSocketServer()
  server: Server;

  private activeUsers: Map<string, User[]> = new Map();
  private userSockets: Map<string, { socketId: string; room: string }> =
    new Map();
  private offers: Map<string, any[]> = new Map();
 

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
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
      console.log('User is not subscribed to this auction');
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
    console.log(`Client ${client.id} joined room ${auctionId}`);

    this.server.to(auctionId).emit('userJoined', {
      user,
      activeUsers: roomUsers,
      message: `${user.username} joined the auction`,
    });
    return { status: 'success', message: 'Joined room successfully' };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    console.log('Raw leave room data:', data);

    if (!data || !data.auctionId || !data.username) {
      console.error('Invalid leave room data received:', data);
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

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { timestamp: new Date() });
  }

  //-------------End Gestion Enchère-------------------------


  //-------------Gestion Offer-------------------------

  @SubscribeMessage('NewOffer')
  async handleNewOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    if (!data || !data.auctionId || !data.user) {
      return { status: 'error', message: 'Invalid data format' };
    }

    const { auctionId, user, offer } = data;

    const isSubscribed = await this.checkSubscription(
      user.username,
      parseInt(auctionId),
    );

    if (!isSubscribed) {
      console.log('User is not subscribed to this auction');
      client.emit('error', {
        error: 'User is not subscribed to this auction',
      });
      return;
    }
    console.log('New Offer:', offer);
    
    //// Notifier les autres participants
  this.server.to(auctionId).emit('offerUpdate', {
    auctionId,
    offer,
  });

  }
}
