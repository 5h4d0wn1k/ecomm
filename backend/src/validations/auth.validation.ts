import { z } from 'zod';

/**
 * Authentication validation schemas using Zod
 */

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character');

// Email validation schema
export const emailSchema = z.string().email('Invalid email address');

// Name validation schemas
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters');

// Phone validation schema
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional();

// User role validation
export const userRoleSchema = z.enum(['customer', 'vendor', 'admin', 'super_admin']);

/**
 * User registration validation
 */
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  role: userRoleSchema.optional().default('customer'),
});

/**
 * Vendor registration validation
 */
export const vendorRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100, 'Business name must not exceed 100 characters'),
  businessDescription: z.string().max(1000, 'Business description must not exceed 1000 characters').optional(),
  businessAddress: z.string().min(10, 'Business address must be at least 10 characters'),
  businessPhone: phoneSchema,
  taxId: z.string().min(5, 'Tax ID must be at least 5 characters').optional(),
});

/**
 * Login validation
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Password change validation
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

/**
 * Forgot password validation
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Reset password validation
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
});

/**
 * Refresh token validation
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * User profile update validation
 */
export const userProfileUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema.optional(),
});

/**
 * Vendor profile update validation
 */
export const vendorProfileUpdateSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100, 'Business name must not exceed 100 characters').optional(),
  businessDescription: z.string().max(1000, 'Business description must not exceed 1000 characters').optional(),
  businessAddress: z.string().min(10, 'Business address must be at least 10 characters').optional(),
  businessPhone: phoneSchema.optional(),
  taxId: z.string().min(5, 'Tax ID must be at least 5 characters').optional(),
});

// Export types
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type VendorRegistration = z.infer<typeof vendorRegistrationSchema>;
export type Login = z.infer<typeof loginSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type RefreshToken = z.infer<typeof refreshTokenSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
export type VendorProfileUpdate = z.infer<typeof vendorProfileUpdateSchema>;