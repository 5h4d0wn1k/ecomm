import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let errorCode = 'INTERNAL_ERROR';
  let details = 'An unexpected error occurred';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errorCode = 'VALIDATION_ERROR';
    details = error.message;
  } else if (error.name === 'AuthenticationError') {
    statusCode = 401;
    message = 'Authentication failed';
    errorCode = 'AUTHENTICATION_FAILED';
    details = error.message;
  } else if (error.name === 'AuthorizationError') {
    statusCode = 403;
    message = 'Access denied';
    errorCode = 'ACCESS_DENIED';
    details = error.message;
  } else if (error.code === 'P2002') {
    // Prisma unique constraint violation
    statusCode = 409;
    message = 'Resource already exists';
    errorCode = 'DUPLICATE_RESOURCE';
    details = 'A resource with these details already exists';
  } else if (error.code === 'P2025') {
    // Prisma record not found
    statusCode = 404;
    message = 'Resource not found';
    errorCode = 'RESOURCE_NOT_FOUND';
    details = 'The requested resource does not exist';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode,
      details,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
};