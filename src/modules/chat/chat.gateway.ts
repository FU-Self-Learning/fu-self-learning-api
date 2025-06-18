import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnModuleInit, Logger, Inject } from '@nestjs/common';
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
      this.logger.log(`Client connected: ${client.id}, joined room ${userId}`);
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
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.saveMessage(data);

    client.emit('messageSent', message);
    const redisPub = this.redisService.getRedisPub();
    await redisPub.publish('chat', JSON.stringify(message));
  }

  @SubscribeMessage('loadMessages')
  async loadMessages(
    @MessageBody() data: { senderUserId: number; receiverUserId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const messages = await this.chatService.loadMessages(
      data.senderUserId,
      data.receiverUserId,
    );

    client.emit('messagesLoaded', messages);
  }
}
