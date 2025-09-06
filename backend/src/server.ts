import app from './app';
import { connectRedis, disconnectRedis } from './config';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  console.log(`📚 API Documentation: http://${HOST}:${PORT}/api/docs`);
  console.log(`🏥 Health Check: http://${HOST}:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');

  server.close(async () => {
    console.log('HTTP server closed');

    // Close Redis connection
    await disconnectRedis();

    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');

  server.close(async () => {
    console.log('HTTP server closed');

    // Close Redis connection
    await disconnectRedis();

    process.exit(0);
  });
});

export default server;