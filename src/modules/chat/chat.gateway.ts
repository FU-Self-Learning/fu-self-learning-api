import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnModuleInit, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
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
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(userId.toString());
      this.logger.log(
        `Client connected: ${client.id}, joined room ${userId.toString()}`,
      );
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async onModuleInit() {
    const redisSub = this.redisService.getRedisSub();

    await redisSub.subscribe('chat');
    redisSub.on('message', (channel, message) => {
      const parsed = JSON.parse(message);
      const targetRoom = parsed.receiverUserId?.toString();
      if (targetRoom) {
        this.server.to(targetRoom).emit('newMessage', parsed);
      }
    });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: SendMessageDto | string,
    @ConnectedSocket() client: Socket,
  ) {
    let parsedData: SendMessageDto;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data) as SendMessageDto;
      } catch (error) {
        this.logger.error('Failed to parse message data:', error);
        client.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    } else {
      parsedData = data;
    }

    parsedData.senderUserId = Number(parsedData.senderUserId);
    parsedData.receiverUserId = Number(parsedData.receiverUserId);

    const message = await this.chatService.saveMessage(parsedData);

    client.emit('messageSent', message);
    const redisPub = this.redisService.getRedisPub();
    await redisPub.publish('chat', JSON.stringify(message));
  }

  @SubscribeMessage('loadMessages')
  async loadMessages(
    @MessageBody() data: { senderUserId: number; receiverUserId: number } | string,
    @ConnectedSocket() client: Socket,
  ) {
    let parsedData: { senderUserId: number; receiverUserId: number };
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        this.logger.error('Failed to parse loadMessages data:', error);
        client.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    } else {
      parsedData = data;
    }

    parsedData.senderUserId = Number(parsedData.senderUserId);
    parsedData.receiverUserId = Number(parsedData.receiverUserId);

    const messages = await this.chatService.loadMessages(
      parsedData.senderUserId,
      parsedData.receiverUserId,
    );

    client.emit('messagesLoaded', messages);
  }
}
