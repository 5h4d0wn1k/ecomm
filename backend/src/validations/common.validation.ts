import { z } from 'zod';

/**
 * Common validation schemas used across the application
 */

/**
 * Pagination validation
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * ID parameter validation
 */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer'),
});

/**
 * Multiple IDs validation
 */
export const idsSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'At least one ID is required'),
});

/**
 * Date range validation
 */
export const dateRangeSchema = z.object({
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
}).refine(data => data.toDate >= data.fromDate, {
  message: 'End date must be after start date',
  path: ['toDate'],
});

/**
 * Sort validation
 */
export const sortSchema = z.object({
  sortBy: z.string().min(1, 'Sort field is required'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Search validation
 */
export const searchSchema = z.object({
  search: z.string().min(1, 'Search query cannot be empty').max(100, 'Search query too long'),
});

/**
 * File upload validation
 */
export const fileUploadSchema = z.object({
  folder: z.string().min(1, 'Upload folder is required'),
  options: z.object({
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    crop: z.enum(['scale', 'fit', 'fill', 'crop', 'thumb']).optional(),
    quality: z.union([z.literal('auto'), z.number().int().min(1).max(100)]).optional(),
    format: z.enum(['jpg', 'png', 'webp', 'gif']).optional(),
  }).optional(),
});

/**
 * Notification preferences validation
 */
export const notificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  sms: z.boolean().default(false),
  orderUpdates: z.boolean().default(true),
  promotions: z.boolean().default(false),
  newsletter: z.boolean().default(false),
});

/**
 * Contact form validation
 */
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must not exceed 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must not exceed 1000 characters'),
});

/**
 * Subscription validation
 */
export const subscriptionSchema = z.object({
  email: z.string().email('Invalid email address'),
  preferences: z.array(z.enum(['newsletter', 'promotions', 'new_products', 'price_drops'])).default(['newsletter']),
});

/**
 * Feedback validation
 */
export const feedbackSchema = z.object({
  type: z.enum(['bug_report', 'feature_request', 'general_feedback', 'complaint']),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must not exceed 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must not exceed 1000 characters'),
  rating: z.number().int().min(1).max(5).optional(),
  category: z.string().max(50).optional(),
});

/**
 * Location validation
 */
export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
});

/**
 * Currency validation
 */
export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY']);

/**
 * Language validation
 */
export const languageSchema = z.enum(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi']);

/**
 * Social media links validation
 */
export const socialLinksSchema = z.object({
  facebook: z.string().url().optional(),
  twitter: z.string().url().optional(),
  instagram: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  youtube: z.string().url().optional(),
  website: z.string().url().optional(),
});

/**
 * Settings update validation
 */
export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  language: languageSchema.default('en'),
  currency: currencySchema.default('USD'),
  timezone: z.string().default('UTC'),
  notifications: notificationPreferencesSchema.optional(),
});

/**
 * Bulk operation validation
 */
export const bulkOperationSchema = z.object({
  operation: z.enum(['delete', 'activate', 'deactivate', 'archive', 'restore']),
  ids: z.array(z.number().int().positive()).min(1, 'At least one ID is required'),
  reason: z.string().max(500).optional(),
});

/**
 * Analytics period validation
 */
export const analyticsPeriodSchema = z.enum(['hour', 'day', 'week', 'month', 'quarter', 'year']);

/**
 * Export format validation
 */
export const exportFormatSchema = z.enum(['json', 'csv', 'xlsx', 'pdf']);

/**
 * API key validation
 */
export const apiKeySchema = z.object({
  name: z.string().min(3, 'API key name must be at least 3 characters').max(50, 'API key name must not exceed 50 characters'),
  permissions: z.array(z.enum(['read', 'write', 'delete', 'admin'])).min(1, 'At least one permission is required'),
  expiresAt: z.coerce.date().optional(),
});

// Export types
export type Pagination = z.infer<typeof paginationSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type Ids = z.infer<typeof idsSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type Sort = z.infer<typeof sortSchema>;
export type Search = z.infer<typeof searchSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export type Feedback = z.infer<typeof feedbackSchema>;
export type Location = z.infer<typeof locationSchema>;
export type SocialLinks = z.infer<typeof socialLinksSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type BulkOperation = z.infer<typeof bulkOperationSchema>;
export type ApiKey = z.infer<typeof apiKeySchema>;