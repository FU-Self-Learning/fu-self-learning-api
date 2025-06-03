import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { redisPub, redisSub } from '../redis/redis.provider';

@WebSocketGateway({ cors: true, namespace: '/chat' })
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(userId.toString());
      console.log(`Client connected: ${client.id}, joined room ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  async onModuleInit() {
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
