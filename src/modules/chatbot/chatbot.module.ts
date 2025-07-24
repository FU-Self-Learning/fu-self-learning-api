import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { GrokService } from './grok.service';
import { CourseModule } from '../course/course.module';
import { AiAgentModule } from '../ai-agent/ai-agent.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [CourseModule, AiAgentModule, RedisModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, GrokService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
