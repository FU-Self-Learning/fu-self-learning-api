import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { GrokService } from './grok.service';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService, GrokService],
  exports: [ChatbotService],
})
export class ChatbotModule {}