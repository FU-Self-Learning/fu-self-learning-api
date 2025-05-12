import { Injectable, Logger } from '@nestjs/common';
import { ChatMessageDto } from './chatbot.dto';
import { GrokService } from './grok.service';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(private readonly grokService: GrokService) {}

  async processMessage(messageDto: ChatMessageDto) {
    try {
      const response = await this.grokService.generateResponse(messageDto.message);
      return {
        response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error processing message:', error.message);
      throw error;
    }
  }
} 