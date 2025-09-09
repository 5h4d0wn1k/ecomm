import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import expressRateLimit from 'express-rate-limit';
import { json, urlencoded } from 'body-parser';

// Import configurations
import { connectRedis, prisma } from './config';

// Import middlewares
import { errorHandler, requestLogger } from './middlewares';
import logger from './middlewares/logger';

// Import utilities
import { validateEnvironmentVariables } from './utils/env-validation';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import vendorRoutes from './routes/vendors';
import adminRoutes from './routes/admin';
import reviewRoutes from './routes/reviews';
import wishlistRoutes from './routes/wishlist';
import couponRoutes from './routes/coupons';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/uploads';
import recommendationRoutes from './routes/recommendations';
import analyticsRoutes from './routes/analytics';

const app = express();

// Validate environment variables
logger.info('Initializing application startup');
try {
  validateEnvironmentVariables();
  logger.info('Environment variable validation completed successfully');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  logger.error('Environment variable validation failed', {
    error: errorMessage,
    stack: errorStack
  });
  // Don't exit here, let the app continue with defaults
}

// Connect to Redis (non-blocking)
connectRedis().catch((err) => {
  logger.error('Redis connection failed, continuing without Redis', {
    error: err.message,
    stack: err.stack,
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
});

// Connect to database (non-blocking)
prisma.$connect()
  .then(() => {
    logger.info('Database connection established successfully', {
      databaseUrl: process.env.DATABASE_URL ? '[CONFIGURED]' : '[NOT SET]'
    });
  })
  .catch((err) => {
    logger.error('Database connection failed, continuing without database', {
      error: err.message,
      stack: err.stack,
      databaseUrl: process.env.DATABASE_URL ? '[CONFIGURED]' : '[NOT SET]',
      code: err.code,
      meta: err.meta
    });
  });

// Security middleware
logger.info('Initializing security middleware');
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
logger.info('Helmet security middleware initialized');

// CORS configuration
logger.info('Initializing CORS middleware', {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
});
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
logger.info('CORS middleware initialized');

// Rate limiting
logger.info('Initializing rate limiting middleware', {
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW || '15')) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
});
const limiter = expressRateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW || '15')) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      details: 'Request rate limit exceeded',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
logger.info('Rate limiting middleware initialized');

// Body parsing middleware
logger.info('Initializing body parsing middleware', {
  jsonLimit: '10mb',
  urlencodedLimit: '10mb'
});
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));
logger.info('Body parsing middleware initialized');

// Logging middleware
logger.info('Initializing request logging middleware');
app.use(requestLogger);
logger.info('Request logging middleware initialized');

// Health check endpoint
logger.info('Setting up health check endpoint');
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});
logger.info('Health check endpoint initialized');

// API routes
logger.info('Initializing API routes');
app.use('/api/v1/auth', authRoutes);
logger.info('Auth routes initialized at /api/v1/auth');

app.use('/api/v1/users', userRoutes);
logger.info('User routes initialized at /api/v1/users');

app.use('/api/v1/products', productRoutes);
logger.info('Product routes initialized at /api/v1/products');

app.use('/api/v1/categories', categoryRoutes);
logger.info('Category routes initialized at /api/v1/categories');

app.use('/api/v1/orders', orderRoutes);
logger.info('Order routes initialized at /api/v1/orders');

app.use('/api/v1/payments', paymentRoutes);
logger.info('Payment routes initialized at /api/v1/payments');

app.use('/api/v1/vendors', vendorRoutes);
logger.info('Vendor routes initialized at /api/v1/vendors');

app.use('/api/v1/admin', adminRoutes);
logger.info('Admin routes initialized at /api/v1/admin');

app.use('/api/v1/reviews', reviewRoutes);
logger.info('Review routes initialized at /api/v1/reviews');

app.use('/api/v1/wishlist', wishlistRoutes);
logger.info('Wishlist routes initialized at /api/v1/wishlist');

app.use('/api/v1/coupons', couponRoutes);
logger.info('Coupon routes initialized at /api/v1/coupons');

app.use('/api/v1/notifications', notificationRoutes);
logger.info('Notification routes initialized at /api/v1/notifications');

app.use('/api/v1/uploads', uploadRoutes);
logger.info('Upload routes initialized at /api/v1/uploads');

app.use('/api/v1/recommendations', recommendationRoutes);
logger.info('Recommendation routes initialized at /api/v1/recommendations');

app.use('/api/v1/analytics', analyticsRoutes);
logger.info('Analytics routes initialized at /api/v1/analytics');

logger.info('All API routes initialized successfully');

// 404 handler
logger.info('Setting up 404 handler');
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: {
      code: 'ROUTE_NOT_FOUND',
      details: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});
logger.info('404 handler initialized');

// Error handling middleware (must be last)
logger.info('Setting up error handling middleware');
app.use(errorHandler);
logger.info('Error handling middleware initialized');

export default app;