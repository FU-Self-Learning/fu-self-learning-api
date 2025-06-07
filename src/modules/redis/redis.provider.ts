// src/redis/redis.provider.ts
import Redis from 'ioredis';

export const redisPub = new Redis(); // Publisher
export const redisSub = new Redis(); // Subscriber
