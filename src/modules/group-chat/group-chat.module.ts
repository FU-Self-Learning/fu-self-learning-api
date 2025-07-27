import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupChat } from 'src/entities/group-chat.entity';
import { GroupMember } from 'src/entities/group-member.entity';
import { GroupMessage } from 'src/entities/group-message.entity';
import { GroupChatService } from './group-chat.service';
import { GroupChatGateway } from './group-chat.gateway';
import { GroupChatController } from './group-chat.controller';
import { User } from 'src/entities/user.entity';
import { Course } from 'src/entities/course.entity';
import { RedisService } from '../redis/redis.provider';

@Module({
  imports: [TypeOrmModule.forFeature([GroupChat, GroupMember, GroupMessage, User, Course]),],
  providers: [GroupChatService, GroupChatGateway,RedisService],
  controllers: [GroupChatController],
  exports: [GroupChatService],
})
export class GroupChatModule {}
