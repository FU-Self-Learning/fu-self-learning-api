import Redis from 'ioredis';

const redisConfig = {
  host: "ballast.proxy.rlwy.net",
  port: 31644,
  password: "EvYGuFQtRBFLRwhoBPJqoZIZfARrwfmr",
  db: 0,
};

export const redisPub = new Redis(redisConfig);
export const redisSub = new Redis(redisConfig);
