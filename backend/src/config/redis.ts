import { createClient, RedisClientType } from 'redis';
import logger from '../middlewares/logger';

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
      logger.error('Redis Client Error', {
        error: err.message,
        stack: err.stack,
        code: err.code,
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
    });

    redisClient.on('connect', () => {
      logger.info('Redis connection established', {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready and operational', {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
    });

    redisClient.on('end', () => {
      logger.info('Redis connection ended', {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis client reconnecting', {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
    });
  }

  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) {
      logger.info('Attempting to connect to Redis', {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        hasPassword: !!process.env.REDIS_PASSWORD
      });
      await client.connect();
      logger.info('Redis connection attempt completed');
    } else {
      logger.debug('Redis client already connected');
    }
  } catch (error) {
   const errorMessage = error instanceof Error ? error.message : String(error);
   const errorStack = error instanceof Error ? error.stack : undefined;
   logger.error('Failed to connect to Redis', {
     error: errorMessage,
     stack: errorStack,
     url: process.env.REDIS_URL || 'redis://localhost:6379'
   });
   throw error;
 }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    const client = getRedisClient();
    if (client.isOpen) {
      logger.info('Disconnecting from Redis');
      await client.disconnect();
      logger.info('Redis disconnection completed');
    } else {
      logger.debug('Redis client already disconnected');
    }
  } catch (error) {
   const errorMessage = error instanceof Error ? error.message : String(error);
   const errorStack = error instanceof Error ? error.stack : undefined;
   logger.error('Failed to disconnect from Redis', {
     error: errorMessage,
     stack: errorStack
   });
   throw error;
 }
};

export default redisClient;