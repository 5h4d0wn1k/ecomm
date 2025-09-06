import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../config';
import { prisma } from '../config';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const decoded = verifyAccessToken(token);

    // Fetch user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        success: false,
        message: error.message,
        error: {
          code: 'AUTHENTICATION_FAILED',
          details: error.message,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: {
          code: 'INVALID_TOKEN',
          details: 'Token verification failed',
        },
      });
    }
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User not authenticated',
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: `Required roles: ${roles.join(', ')}`,
        },
      });
      return;
    }

    next();
  };
};

export const requireOwnership = (resourceType: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        throw new AuthorizationError('Resource ID is required');
      }

      const userId = req.user.id;
      let isOwner = false;

      switch (resourceType) {
        case 'product':
          const product = await prisma.product.findUnique({
            where: { id: parseInt(resourceId) },
            select: { vendorId: true },
          });
          isOwner = product?.vendorId === userId || req.user.role === 'admin';
          break;

        case 'order':
          const order = await prisma.order.findUnique({
            where: { id: parseInt(resourceId) },
            select: { userId: true },
          });
          isOwner = order?.userId === userId || req.user.role === 'admin';
          break;

        case 'vendor':
          isOwner = parseInt(resourceId) === userId || req.user.role === 'admin';
          break;

        case 'review':
          const review = await prisma.review.findUnique({
            where: { id: parseInt(resourceId) },
            select: { userId: true },
          });
          isOwner = review?.userId === userId || req.user.role === 'admin';
          break;

        default:
          isOwner = req.user.role === 'admin';
      }

      if (!isOwner) {
        throw new AuthorizationError('Resource access denied');
      }

      next();
    } catch (error) {
      if (error instanceof AuthorizationError) {
        res.status(403).json({
          success: false,
          message: error.message,
          error: {
            code: 'RESOURCE_ACCESS_DENIED',
            details: error.message,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: {
            code: 'INTERNAL_ERROR',
            details: 'Failed to verify resource ownership',
          },
        });
      }
    }
  };
};