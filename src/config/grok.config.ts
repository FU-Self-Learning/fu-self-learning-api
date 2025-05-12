import { registerAs } from '@nestjs/config';

export default registerAs('grok', () => ({
  apiKey: process.env.GROK_API_KEY,
  apiUrl: process.env.GROK_API_URL || 'https://api.grok.ai/v1',
})); 