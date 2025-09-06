import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | undefined;

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    const redisConfig: any = {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    };

    if (process.env.REDIS_PASSWORD) {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }

    redisClient = createClient(redisConfig);

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    redisClient.on('ready', () => {
      console.log('Redis client ready');
    });

    redisClient.on('end', () => {
      console.log('Redis connection ended');
    });
  }

  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  const client = getRedisClient();
  if (!client.isOpen) {
    await client.connect();
  }
};

export const disconnectRedis = async (): Promise<void> => {
  const client = getRedisClient();
  if (client.isOpen) {
    await client.disconnect();
  }
};

export default redisClient;