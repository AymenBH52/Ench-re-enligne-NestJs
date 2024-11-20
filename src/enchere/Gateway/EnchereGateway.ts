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
import { SubscribersService } from 'src/subscribers/subscribers.service';

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
  constructor(private subService: SubscribersService) {}

  @WebSocketServer()
  server: Server;

  private activeUsers: Map<string, User[]> = new Map();
  private userSockets: Map<string, { socketId: string; room: string }> =
    new Map();

  // Store kicked users with a timestamp (kickTime) to manage re-entry restrictions
  private kickedUsersSockets: Map<
    string,
    { socketId: string; room: string; kickTime: number }
  > = new Map();

  // Maximum allowed re-entry time (in milliseconds)
  private readonly KICKED_USER_TIMEOUT = 10 * 60 * 1000; // 10 minutes, for example

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);

    // Check if the client was kicked and if the kick time has expired
    const kickedUser = this.kickedUsersSockets.get(client.id);
    if (kickedUser) {
      const currentTime = Date.now();
      if (currentTime - kickedUser.kickTime < this.KICKED_USER_TIMEOUT) {
        client.emit('kicked', {
          message:
            'You have been kicked from the auction and cannot reconnect yet',
        });
        client.disconnect();
        return;
      }
      // If the kick time has expired, remove the user from the kicked list
      this.kickedUsersSockets.delete(client.id);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    // Clean up user socket mapping when they disconnect
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

    // Check subscription
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

    // Check if the user has been kicked
    if (this.kickedUsersSockets.has(user.username)) {
      client.emit('kicked', {
        message: 'You have been kicked from the auction',
      });
      return;
    }

    // Store user's socket information
    this.userSockets.set(user.username, {
      socketId: client.id,
      room: auctionId,
    });

    // Initialize room if it doesn't exist
    if (!this.activeUsers.has(auctionId)) {
      this.activeUsers.set(auctionId, []);
    }

    const roomUsers = this.activeUsers.get(auctionId);

    // Check if user already exists in the room
    const existingUserIndex = roomUsers.findIndex(
      (u) => u.username === user.username,
    );
    if (existingUserIndex === -1) {
      // Add user if they don't exist
      roomUsers.push(user);
    }

    await client.join(auctionId);
    console.log(`Client ${client.id} joined room ${auctionId}`);

    // Broadcast to room that user joined
    this.server.to(auctionId).emit('userJoined', {
      user,
      activeUsers: roomUsers,
      message: `${user.username} joined the auction`,
    });
    return { status: 'success', message: 'Joined room successfully' };
  }

  @SubscribeMessage('kickUser')
  async handleKickUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    if (!data || !data.auctionId || !data.adminUsername || !data.userToKick) {
      console.error('Invalid kick user data received:', data);
      return { status: 'error', message: 'Invalid data format' };
    }

    const { auctionId, adminUsername, userToKick } = data;
    const roomUsers = this.activeUsers.get(auctionId);

    // Verify admin exists and has admin role
    const admin = roomUsers?.find((u) => u.username === adminUsername);
    if (!admin || admin.role.name !== 'admin') {
      client.emit('error', {
        error: 'Unauthorized: Only admins can kick users',
      });
      return { status: 'error', message: 'Unauthorized' };
    }

    // Find user to kick
    const userSocket = this.userSockets.get(userToKick);
    if (userSocket && userSocket.room === auctionId) {
      // Remove user from active users
      const updatedUsers = roomUsers.filter((u) => u.username !== userToKick);
      this.activeUsers.set(auctionId, updatedUsers);

      // Add kicked user to kicked list with the current timestamp
      this.kickedUsersSockets.set(userToKick, {
        socketId: userSocket.socketId,
        room: auctionId,
        kickTime: Date.now(),
      });

      // Emit kick event to the specific user
      this.server.to(userSocket.socketId).emit('kicked', {
        message: `You have been kicked from the auction by ${adminUsername}`,
      });

      // Remove user from the room
      this.server.in(userSocket.socketId).socketsLeave(auctionId);
      this.userSockets.delete(userToKick);

      // Notify all users in the room about the kick
      this.server.to(auctionId).emit('userKicked', {
        kickedUser: userToKick,
        activeUsers: updatedUsers,
        message: `${userToKick} was kicked from the auction by ${adminUsername}`,
      });

      return { status: 'success', message: 'User kicked successfully' };
    }

    return { status: 'error', message: 'User not found in room' };
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
      // Remove user from room
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

        // Clean up empty room
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
}
