import { Request, Response, NextFunction } from 'express';

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'email' | 'boolean' | 'array';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  customMessage?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { field: string; message: string }[];
}

export const validateRequest = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: { field: string; message: string }[] = [];
    const data = { ...req.body, ...req.params, ...req.query };

    for (const rule of rules) {
      const value = data[rule.field];

      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: rule.field,
          message: `${rule.field} is required`,
        });
        continue;
      }

      // Skip validation if field is not required and not provided
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be a string`,
            });
          } else {
            if (rule.minLength && value.length < rule.minLength) {
              errors.push({
                field: rule.field,
                message: `${rule.field} must be at least ${rule.minLength} characters long`,
              });
            }
            if (rule.maxLength && value.length > rule.maxLength) {
              errors.push({
                field: rule.field,
                message: `${rule.field} must be at most ${rule.maxLength} characters long`,
              });
            }
            if (rule.pattern && !rule.pattern.test(value)) {
              errors.push({
                field: rule.field,
                message: rule.customMessage || `${rule.field} format is invalid`,
              });
            }
          }
          break;

        case 'number':
          const numValue = Number(value);
          if (isNaN(numValue)) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be a number`,
            });
          } else {
            if (rule.min !== undefined && numValue < rule.min) {
              errors.push({
                field: rule.field,
                message: `${rule.field} must be at least ${rule.min}`,
              });
            }
            if (rule.max !== undefined && numValue > rule.max) {
              errors.push({
                field: rule.field,
                message: `${rule.field} must be at most ${rule.max}`,
              });
            }
          }
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof value !== 'string' || !emailRegex.test(value)) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be a valid email address`,
            });
          }
          break;

        case 'boolean':
          if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be a boolean`,
            });
          }
          break;

        case 'array':
          if (!Array.isArray(value)) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be an array`,
            });
          }
          break;
      }

      // Custom validation
      if (rule.custom && !rule.custom(value)) {
        errors.push({
          field: rule.field,
          message: rule.customMessage || `${rule.field} is invalid`,
        });
      }
    }

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
  };
};

// Pre-configured validation rules
export const userRegistrationRules: ValidationRule[] = [
  { field: 'email', type: 'email', required: true },
  { field: 'password', type: 'string', required: true, minLength: 8 },
  { field: 'firstName', type: 'string', required: true, minLength: 2, maxLength: 50 },
  { field: 'lastName', type: 'string', required: true, minLength: 2, maxLength: 50 },
  { field: 'role', type: 'string', required: false, pattern: /^(customer|vendor|admin|super_admin)$/ },
];

export const vendorRegistrationRules: ValidationRule[] = [
  ...userRegistrationRules,
  { field: 'businessName', type: 'string', required: true, minLength: 2, maxLength: 100 },
  { field: 'businessAddress', type: 'string', required: true, minLength: 10 },
  { field: 'businessPhone', type: 'string', required: false, pattern: /^\+?[\d\s\-\(\)]+$/ },
  { field: 'taxId', type: 'string', required: false, minLength: 5 },
];

export const loginRules: ValidationRule[] = [
  { field: 'email', type: 'email', required: true },
  { field: 'password', type: 'string', required: true },
];

export const changePasswordRules: ValidationRule[] = [
  { field: 'currentPassword', type: 'string', required: true },
  { field: 'newPassword', type: 'string', required: true, minLength: 8 },
];