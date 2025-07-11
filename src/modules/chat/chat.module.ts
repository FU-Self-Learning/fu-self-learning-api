import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialInteraction } from 'src/entities/social-interaction.entity';
import { User } from 'src/entities/user.entity';
import { RedisService } from '../redis/redis.provider';

@Module({
  imports: [TypeOrmModule.forFeature([SocialInteraction, User])],
  providers: [ChatGateway, ChatService, RedisService],
  exports: [ChatService],
})
export class ChatModule {}
