import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({ cors: true, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Received message:', data);

    const message = await this.chatService.saveMessage(data);
    client.emit('messageSent', message);
    client.broadcast.emit('newMessage', message);
  }

  @SubscribeMessage('loadMessages')
  async loadMessages(
    @MessageBody() data: { senderUserId: number; receiverUserId: number },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(
      'Loading messages between:',
      data.senderUserId,
      data.receiverUserId,
    );

    const messages = await this.chatService.loadMessages(
      data.senderUserId,
      data.receiverUserId,
    );

    client.emit('messagesLoaded', messages);
  }
}
