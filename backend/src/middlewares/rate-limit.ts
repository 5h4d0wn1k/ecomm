import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Simple in-memory store (for production, use Redis)
const rateLimitStore: RateLimitStore = {};

export const createRateLimit = (options: RateLimitOptions) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const key = req.user?.id ? `user_${req.user.id}` : `ip_${req.ip}`;
    const now = Date.now();

    // Clean up expired entries
    Object.keys(rateLimitStore).forEach(k => {
      const entry = rateLimitStore[k];
      if (entry && entry.resetTime < now) {
        delete rateLimitStore[k];
      }
    });

    // Get or create rate limit entry
    if (!rateLimitStore[key]) {
      rateLimitStore[key] = {
        count: 0,
        resetTime: now + options.windowMs,
      };
    }

    const entry = rateLimitStore[key];

    // Check if window has expired
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + options.windowMs;
    }

    // Increment counter
    entry.count++;

    // Set headers
    res.set({
      'X-RateLimit-Limit': options.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, options.maxRequests - entry.count).toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
    });

    // Check if limit exceeded
    if (entry.count > options.maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Too many requests',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          details: `Rate limit exceeded. Try again after ${new Date(entry.resetTime).toISOString()}`,
        },
      });
      return;
    }

    next();
  };
};

// Pre-configured rate limiters
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
});

export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
});

export const strictRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
});