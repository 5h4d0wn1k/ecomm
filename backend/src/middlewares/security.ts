import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config';

/**
 * Additional security middleware
 */

export interface SecurityOptions {
  maxRequests?: number;
  windowMs?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * IP-based rate limiting using Redis
 */
export const advancedRateLimit = (options: SecurityOptions = {}) => {
  const {
    maxRequests = 100,
    windowMs = 60 * 1000, // 1 minute
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const redisClient = getRedisClient();
      if (!redisClient.isOpen) {
        // Fallback to memory-based rate limiting if Redis is not available
        next();
        return;
      }

      const key = `rate_limit:${req.ip}`;
      const now = Date.now();
      const window = Math.floor(now / windowMs);
      const windowKey = `${key}:${window}`;

      // Get current count for this window
      const current = await redisClient.get(windowKey);
      const count = parseInt(current || '0');

      // Check if limit exceeded
      if (count >= maxRequests) {
        res.status(429).json({
          success: false,
          message: 'Too many requests',
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            details: `Maximum ${maxRequests} requests per ${windowMs / 1000} seconds exceeded`,
          },
        });
        return;
      }

      // Increment counter
      await redisClient.multi()
        .incr(windowKey)
        .expire(windowKey, Math.ceil(windowMs / 1000))
        .exec();

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': (maxRequests - count - 1).toString(),
        'X-RateLimit-Reset': (now + windowMs).toString(),
      });

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next(); // Don't block requests if rate limiting fails
    }
  };
};

/**
 * API key validation middleware
 */
export const validateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({
        success: false,
        message: 'API key required',
        error: {
          code: 'API_KEY_REQUIRED',
          details: 'X-API-Key header is required for this endpoint',
        },
      });
      return;
    }

    // TODO: Implement API key validation logic
    // For now, just check if it's a valid format
    if (apiKey.length < 32) {
      res.status(401).json({
        success: false,
        message: 'Invalid API key',
        error: {
          code: 'INVALID_API_KEY',
          details: 'The provided API key is invalid',
        },
      });
      return;
    }

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to validate API key',
      },
    });
  }
};

/**
 * Request size limiter
 */
export const requestSizeLimit = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      res.status(413).json({
        success: false,
        message: 'Request entity too large',
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          details: `Maximum request size is ${maxSize / (1024 * 1024)}MB`,
        },
      });
      return;
    }

    next();
  };
};

/**
 * IP whitelist middleware
 */
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || req.connection.remoteAddress;

    if (!clientIP || !allowedIPs.includes(clientIP)) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: {
          code: 'IP_NOT_ALLOWED',
          details: 'Your IP address is not authorized to access this resource',
        },
      });
      return;
    }

    next();
  };
};

/**
 * Request timeout middleware
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'Request timeout',
          error: {
            code: 'REQUEST_TIMEOUT',
            details: `Request timed out after ${timeoutMs / 1000} seconds`,
          },
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'"
  );

  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  next();
};

/**
 * CORS configuration middleware
 */
export const corsConfig = (allowedOrigins: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin;
    
    // Allow requests with no origin (mobile apps, curl requests, etc.)
    if (!origin) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key'
    );
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(204).send();
      return;
    }

    next();
  };
};

/**
 * User agent validation
 */
export const validateUserAgent = (req: Request, res: Response, next: NextFunction): void => {
  const userAgent = req.headers['user-agent'];
  
  if (!userAgent) {
    res.status(400).json({
      success: false,
      message: 'User agent required',
      error: {
        code: 'USER_AGENT_REQUIRED',
        details: 'User-Agent header is required',
      },
    });
    return;
  }

  // Block suspicious user agents
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /scraper/i,
    /spider/i,
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious && !req.headers['x-api-key']) {
    res.status(403).json({
      success: false,
      message: 'Access denied',
      error: {
        code: 'SUSPICIOUS_USER_AGENT',
        details: 'Automated requests are not allowed without API key',
      },
    });
    return;
  }

  next();
};

/**
 * Content validation middleware
 */
export const validateContentType = (allowedTypes: string[] = ['application/json']) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type']?.split(';')[0];

      if (!contentType || !allowedTypes.includes(contentType)) {
        res.status(415).json({
          success: false,
          message: 'Unsupported media type',
          error: {
            code: 'UNSUPPORTED_MEDIA_TYPE',
            details: `Content-Type must be one of: ${allowedTypes.join(', ')}`,
          },
        });
        return;
      }
    }

    next();
  };
};

/**
 * PCI DSS compliant payment security middleware
 */
export const paymentSecurity = (req: Request, res: Response, next: NextFunction): void => {
  // Ensure HTTPS in production
  if (process.env.NODE_ENV === 'production' && req.protocol !== 'https') {
    res.status(403).json({
      success: false,
      message: 'HTTPS required',
      error: {
        code: 'HTTPS_REQUIRED',
        details: 'Payment endpoints must use HTTPS',
      },
    });
    return;
  }

  // Validate payment data is not logged
  const sensitiveFields = ['cardNumber', 'cvv', 'expiryDate', 'paymentToken'];
  const hasSensitiveData = sensitiveFields.some(field =>
    req.body && (req.body[field] || req.query[field] || req.params[field])
  );

  if (hasSensitiveData) {
    res.status(400).json({
      success: false,
      message: 'Invalid payment data',
      error: {
        code: 'INVALID_PAYMENT_DATA',
        details: 'Sensitive payment data should not be sent directly',
      },
    });
    return;
  }

  // Add security headers specific to payments
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  next();
};

/**
 * Payment rate limiting (stricter than general rate limiting)
 */
export const paymentRateLimit = advancedRateLimit({
  maxRequests: 10, // 10 payment attempts per minute
  windowMs: 60 * 1000,
  skipSuccessfulRequests: true, // Allow more failed attempts
  skipFailedRequests: false,
});