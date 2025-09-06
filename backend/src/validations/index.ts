// Auth validations
export * from './auth.validation';

// Product validations
export * from './product.validation';

// Order validations
export * from './order.validation';

// Vendor validations
export * from './vendor.validation';

// Common validations
export * from './common.validation';

import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Zod validation middleware
 * Validates request data against provided schema
 */
export const validateSchema = (schema: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors: Array<{ field: string; message: string; path: string }> = [];

      // Validate body
      if (schema.body) {
        try {
          req.body = schema.body.parse(req.body);
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push(...error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              path: 'body',
            })));
          }
        }
      }

      // Validate params
      if (schema.params) {
        try {
          req.params = schema.params.parse(req.params);
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push(...error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              path: 'params',
            })));
          }
        }
      }

      // Validate query
      if (schema.query) {
        try {
          req.query = schema.query.parse(req.query);
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push(...error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              path: 'query',
            })));
          }
        }
      }

      // If there are validation errors, return them
      if (errors.length > 0) {
        res.status(422).json({
          success: false,
          message: 'Validation failed',
          error: {
            code: 'VALIDATION_ERROR',
            details: errors,
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal validation error',
        error: {
          code: 'VALIDATION_ERROR',
          details: 'Failed to validate request data',
        },
      });
    }
  };
};

/**
 * Body validation middleware
 */
export const validateBody = (schema: ZodSchema) => validateSchema({ body: schema });

/**
 * Params validation middleware
 */
export const validateParams = (schema: ZodSchema) => validateSchema({ params: schema });

/**
 * Query validation middleware
 */
export const validateQuery = (schema: ZodSchema) => validateSchema({ query: schema });

/**
 * Combined validation helper
 */
export const validate = {
  body: validateBody,
  params: validateParams,
  query: validateQuery,
  schema: validateSchema,
};