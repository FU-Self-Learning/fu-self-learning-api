import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GroupChatService } from './group-chat.service';
import { RedisService } from '../redis/redis.provider';

@WebSocketGateway({ cors: true, namespace: '/group-chat' })
export class GroupChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(GroupChatGateway.name);

  constructor(
    private readonly groupChatService: GroupChatService,
    private readonly redisService: RedisService,
  ) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user_${userId}`);
      this.logger.log(`Client connected: ${client.id}, joined user room user_${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async onModuleInit() {
    const redisSub = this.redisService.getRedisSub();
    await redisSub.subscribe('group-chat');
    redisSub.on('message', (channel, message) => {
      const parsed = JSON.parse(message);
      const groupRoom = `group_${parsed.groupId}`;
      this.server.to(groupRoom).emit('newGroupMessage', parsed);
    });
  }

  @SubscribeMessage('joinGroup')
  async handleJoinGroup(@MessageBody() data: { groupId: number }, @ConnectedSocket() client: Socket) {
    client.join(`group_${data.groupId}`);
    this.logger.log(`Client ${client.id} joined group_${data.groupId}`);
    client.emit('joinedGroup', { groupId: data.groupId });
  }

  @SubscribeMessage('sendGroupMessage')
  async handleSendGroupMessage(
    @MessageBody() data: { groupId: number; senderId: number; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const msg = await this.groupChatService.addMessage(data.groupId, data.senderId, data.message);
    const redisPub = this.redisService.getRedisPub();
    await redisPub.publish('group-chat', JSON.stringify(msg));
    client.emit('groupMessageSent', msg);
  }

  @SubscribeMessage('loadGroupMessages')
  async handleLoadGroupMessages(
    @MessageBody() data: { groupId: number } | string,
    @ConnectedSocket() client: Socket,
  ) {
    let parsedData: { groupId: number };
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        this.logger.error('Failed to parse loadGroupMessages data:', error);
        client.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    } else {
      parsedData = data;
    }

    parsedData.groupId = Number(parsedData.groupId);
    if (isNaN(parsedData.groupId)) {
      this.logger.error('Invalid groupId received:', parsedData.groupId);
      client.emit('error', { message: 'Invalid groupId' });
      return;
    }
    this.logger.log(`Querying DB for group messages, groupId: ${parsedData.groupId}`);
    const messages = await this.groupChatService.getGroupMessages(parsedData.groupId);
    this.logger.log(`Emitting groupMessagesLoaded, count: ${messages.length}`);
    client.emit('groupMessagesLoaded', messages);
  }
}
