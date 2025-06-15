import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnModuleInit, Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { LoadMessagesDto } from './dto/load-messages.dto';
import { RedisService } from '../redis/redis.provider';

@WebSocketGateway({ cors: true, namespace: '/chat' })
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const userId = client.handshake.query.userId;
      if (!userId) {
        throw new UnauthorizedException('User ID is required');
      }
      
      client.join(userId.toString());
      this.logger.log(`Client connected: ${client.id}, joined room ${userId}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async onModuleInit() {
    try {
      const redisSub = this.redisService.getRedisSub();
      await redisSub.subscribe('chat');
      redisSub.on('message', (channel, message) => {
        try {
          const parsed = JSON.parse(message);
          const targetRoom = parsed.receiverUserId?.toString();
          if (targetRoom) {
            this.server.to(targetRoom).emit('newMessage', parsed);
          }
        } catch (error) {
          this.logger.error(`Error processing Redis message: ${error.message}`);
        }
      });
    } catch (error) {
      this.logger.error(`Redis subscription error: ${error.message}`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.chatService.saveMessage(data);
      client.emit('messageSent', message);
      
      const redisPub = this.redisService.getRedisPub();
      await redisPub.publish('chat', JSON.stringify(message));
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('loadMessages')
  async loadMessages(
    @MessageBody() data: LoadMessagesDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const messages = await this.chatService.loadMessages(
        data.senderUserId,
        data.receiverUserId,
        data.page,
        data.limit,
      );
      client.emit('messagesLoaded', messages);
    } catch (error) {
      this.logger.error(`Error loading messages: ${error.message}`);
      client.emit('error', { message: 'Failed to load messages' });
    }
  }
}
