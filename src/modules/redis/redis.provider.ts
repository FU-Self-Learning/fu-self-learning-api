import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private readonly redisPub: Redis;
  private readonly redisSub: Redis;

  constructor(private configService: ConfigService) {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST'),
      port: 28268,
      password: this.configService.get('REDIS_PASSWORD'),
      db: 0,
    };

    this.redisPub = new Redis(redisConfig);
    this.redisSub = new Redis(redisConfig);
  }

  getRedisPub(): Redis {
    return this.redisPub;
  }

  getRedisSub(): Redis {
    return this.redisSub;
  }
}
