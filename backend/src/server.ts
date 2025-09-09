import app from './app';
import { connectRedis, disconnectRedis, prisma } from './config';
import logger from './middlewares/logger';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

logger.info('Starting server initialization', {
  port: PORT,
  host: HOST,
  nodeEnv: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL
});

const server = app.listen(PORT, () => {
  logger.info('Server started successfully', {
    url: `http://${HOST}:${PORT}`,
    port: PORT,
    host: HOST,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });

  logger.info('Server endpoints available', {
    healthCheck: `http://${HOST}:${PORT}/health`,
    apiBase: `http://${HOST}:${PORT}/api/v1`
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, initiating graceful shutdown');

  server.close(async () => {
    logger.info('HTTP server closed successfully');

    // Close database connection
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error('Error closing database connection during shutdown', {
        error: errorMessage,
        stack: errorStack
      });
    }

    // Close Redis connection
    try {
      await disconnectRedis();
      logger.info('Redis connection closed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error('Error closing Redis connection during shutdown', {
        error: errorMessage,
        stack: errorStack
      });
    }

    logger.info('Graceful shutdown completed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, initiating graceful shutdown');

  server.close(async () => {
    logger.info('HTTP server closed successfully');

    // Close database connection
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error('Error closing database connection during shutdown', {
        error: errorMessage,
        stack: errorStack
      });
    }

    // Close Redis connection
    try {
      await disconnectRedis();
      logger.info('Redis connection closed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error('Error closing Redis connection during shutdown', {
        error: errorMessage,
        stack: errorStack
      });
    }

    logger.info('Graceful shutdown completed');
    process.exit(0);
  });
});

export default server;