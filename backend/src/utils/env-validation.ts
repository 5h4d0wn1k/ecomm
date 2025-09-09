import logger from '../middlewares/logger';

interface EnvVarConfig {
  name: string;
  required: boolean;
  default?: string;
  sensitive?: boolean;
}

const requiredEnvVars: EnvVarConfig[] = [
  { name: 'NODE_ENV', required: true },
  { name: 'PORT', required: false, default: '3001' },
  { name: 'HOST', required: false, default: 'localhost' },
  { name: 'DATABASE_URL', required: true, sensitive: true },
  { name: 'REDIS_URL', required: false, default: 'redis://localhost:6379', sensitive: true },
  { name: 'JWT_SECRET', required: true, sensitive: true },
  { name: 'JWT_REFRESH_SECRET', required: true, sensitive: true },
  { name: 'CORS_ORIGIN', required: false, default: 'http://localhost:3000' },
  { name: 'LOG_LEVEL', required: false, default: 'info' },
  { name: 'LOG_FILE', required: false, default: './logs/app.log' },
];

const optionalEnvVars: EnvVarConfig[] = [
  { name: 'REDIS_PASSWORD', required: false, sensitive: true },
  { name: 'JWT_EXPIRES_IN', required: false, default: '15m' },
  { name: 'JWT_REFRESH_EXPIRES_IN', required: false, default: '7d' },
  { name: 'BCRYPT_ROUNDS', required: false, default: '12' },
  { name: 'RATE_LIMIT_WINDOW', required: false, default: '15' },
  { name: 'RATE_LIMIT_MAX_REQUESTS', required: false, default: '100' },
  { name: 'SENDGRID_API_KEY', required: false, sensitive: true },
  { name: 'FROM_EMAIL', required: false, sensitive: true },
  { name: 'STRIPE_SECRET_KEY', required: false, sensitive: true },
  { name: 'STRIPE_WEBHOOK_SECRET', required: false, sensitive: true },
  { name: 'CLOUDINARY_CLOUD_NAME', required: false },
  { name: 'CLOUDINARY_API_KEY', required: false, sensitive: true },
  { name: 'CLOUDINARY_API_SECRET', required: false, sensitive: true },
];

export const validateEnvironmentVariables = (): void => {
  logger.info('Starting environment variable validation');

  const missingVars: string[] = [];
  const invalidVars: string[] = [];

  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name];

    if (envVar.required && !value) {
      missingVars.push(envVar.name);
      logger.error(`Required environment variable missing: ${envVar.name}`);
    } else if (value) {
      const logValue = envVar.sensitive ? '[CONFIGURED]' : value;
      logger.info(`Environment variable configured: ${envVar.name}`, {
        value: logValue,
        hasDefault: !!envVar.default
      });
    } else if (envVar.default) {
      logger.info(`Environment variable using default: ${envVar.name}`, {
        default: envVar.default
      });
    }
  }

  // Check optional environment variables
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar.name];

    if (value) {
      const logValue = envVar.sensitive ? '[CONFIGURED]' : value;
      logger.info(`Optional environment variable configured: ${envVar.name}`, {
        value: logValue
      });
    } else if (envVar.default) {
      logger.debug(`Optional environment variable using default: ${envVar.name}`, {
        default: envVar.default
      });
    }
  }

  // Validate specific environment variables
  const port = process.env.PORT;
  if (port && isNaN(Number(port))) {
    invalidVars.push('PORT (must be a number)');
    logger.error('Invalid PORT environment variable: must be a number', { value: port });
  }

  const bcryptRounds = process.env.BCRYPT_ROUNDS;
  if (bcryptRounds && isNaN(Number(bcryptRounds))) {
    invalidVars.push('BCRYPT_ROUNDS (must be a number)');
    logger.error('Invalid BCRYPT_ROUNDS environment variable: must be a number', { value: bcryptRounds });
  }

  const rateLimitWindow = process.env.RATE_LIMIT_WINDOW;
  if (rateLimitWindow && isNaN(Number(rateLimitWindow))) {
    invalidVars.push('RATE_LIMIT_WINDOW (must be a number)');
    logger.error('Invalid RATE_LIMIT_WINDOW environment variable: must be a number', { value: rateLimitWindow });
  }

  const rateLimitMax = process.env.RATE_LIMIT_MAX_REQUESTS;
  if (rateLimitMax && isNaN(Number(rateLimitMax))) {
    invalidVars.push('RATE_LIMIT_MAX_REQUESTS (must be a number)');
    logger.error('Invalid RATE_LIMIT_MAX_REQUESTS environment variable: must be a number', { value: rateLimitMax });
  }

  // Summary logging
  if (missingVars.length > 0) {
    logger.error('Environment validation failed: missing required variables', {
      missing: missingVars,
      totalMissing: missingVars.length
    });
  }

  if (invalidVars.length > 0) {
    logger.error('Environment validation failed: invalid variable formats', {
      invalid: invalidVars,
      totalInvalid: invalidVars.length
    });
  }

  const totalConfigured = requiredEnvVars.filter(v => process.env[v.name]).length +
                          optionalEnvVars.filter(v => process.env[v.name]).length;

  logger.info('Environment variable validation completed', {
    requiredConfigured: requiredEnvVars.filter(v => process.env[v.name]).length,
    requiredTotal: requiredEnvVars.length,
    optionalConfigured: optionalEnvVars.filter(v => process.env[v.name]).length,
    optionalTotal: optionalEnvVars.length,
    totalConfigured,
    missingCount: missingVars.length,
    invalidCount: invalidVars.length,
    validationStatus: missingVars.length === 0 && invalidVars.length === 0 ? 'SUCCESS' : 'FAILED'
  });

  if (missingVars.length > 0 || invalidVars.length > 0) {
    throw new Error(`Environment validation failed. Missing: ${missingVars.join(', ')}. Invalid: ${invalidVars.join(', ')}`);
  }
};

export default validateEnvironmentVariables;