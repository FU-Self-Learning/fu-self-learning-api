import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GrokService implements OnModuleInit {
  private readonly logger = new Logger(GrokService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROK_API_KEY');
    const apiUrl = this.configService.get<string>('GROK_API_URL');

    if (!apiKey) {
      throw new Error('GROK_API_KEY is not configured');
    }
    if (!apiUrl) {
      throw new Error('GROK_API_URL is not configured');
    }

    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  onModuleInit() {
    this.logger.log('GrokService initialized');
  }

  async generateResponse(message: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          messages: [{ role: 'user', content: message }],
          model: 'grok-1',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      this.logger.error('Error calling Grok API:', error.message);
      throw new Error('Failed to generate response from Grok API');
    }
  }
} 