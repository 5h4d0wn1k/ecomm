import { z } from 'zod';

/**
 * Product validation schemas using Zod
 */

// Product status validation
export const productStatusSchema = z.enum(['draft', 'active', 'archived']);

// Product dimensions schema
export const dimensionsSchema = z.object({
  length: z.number().positive('Length must be positive'),
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
  unit: z.enum(['cm', 'inch']).default('cm'),
}).optional();

// Product images schema
export const productImagesSchema = z.object({
  original: z.array(z.string().url('Invalid image URL')),
  thumbnail: z.array(z.string().url('Invalid thumbnail URL')),
  medium: z.array(z.string().url('Invalid medium image URL')),
}).optional();

/**
 * Create product validation
 */
export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(255, 'Product name must not exceed 255 characters'),
  description: z.string().max(5000, 'Description must not exceed 5000 characters').optional(),
  shortDescription: z.string().max(500, 'Short description must not exceed 500 characters').optional(),
  sku: z.string().min(3, 'SKU must be at least 3 characters').max(100, 'SKU must not exceed 100 characters'),
  categoryId: z.number().int().positive('Category ID must be a positive integer'),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive('Compare at price must be positive').optional(),
  costPrice: z.number().positive('Cost price must be positive').optional(),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative').default(0),
  minStockLevel: z.number().int().min(0, 'Minimum stock level cannot be negative').default(0),
  weight: z.number().positive('Weight must be positive').optional(),
  dimensions: dimensionsSchema,
  images: productImagesSchema,
  tags: z.array(z.string()).default([]),
  status: productStatusSchema.default('draft'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  requiresShipping: z.boolean().default(true),
  seoTitle: z.string().max(255, 'SEO title must not exceed 255 characters').optional(),
  seoDescription: z.string().max(500, 'SEO description must not exceed 500 characters').optional(),
});

/**
 * Update product validation
 */
export const updateProductSchema = createProductSchema.partial().omit({
  sku: true, // SKU should not be updatable
});

/**
 * Product query validation
 */
export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.coerce.number().int().positive().optional(),
  vendor: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  status: productStatusSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'created_asc', 'created_desc', 'rating_desc']).default('created_desc'),
});

/**
 * Product variant validation
 */
export const createProductVariantSchema = z.object({
  productId: z.number().int().positive('Product ID must be a positive integer'),
  name: z.string().min(1, 'Variant name is required').max(100, 'Variant name must not exceed 100 characters'),
  value: z.string().min(1, 'Variant value is required').max(100, 'Variant value must not exceed 100 characters'),
  skuSuffix: z.string().max(50, 'SKU suffix must not exceed 50 characters').optional(),
  priceModifier: z.number().default(0),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative').default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

/**
 * Update product variant validation
 */
export const updateProductVariantSchema = createProductVariantSchema.partial().omit({
  productId: true,
});

/**
 * Bulk update products validation
 */
export const bulkUpdateProductsSchema = z.object({
  productIds: z.array(z.number().int().positive()).min(1, 'At least one product ID is required'),
  updates: z.object({
    status: productStatusSchema.optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    categoryId: z.number().int().positive().optional(),
  }),
});

/**
 * Product review validation
 */
export const createReviewSchema = z.object({
  productId: z.number().int().positive('Product ID must be a positive integer'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().max(255, 'Review title must not exceed 255 characters').optional(),
  comment: z.string().max(1000, 'Review comment must not exceed 1000 characters').optional(),
  orderId: z.number().int().positive().optional(),
});

/**
 * Update review validation
 */
export const updateReviewSchema = createReviewSchema.partial().omit({
  productId: true,
});

/**
 * Review query validation
 */
export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  isVerified: z.coerce.boolean().optional(),
  isApproved: z.coerce.boolean().optional(),
  sort: z.enum(['rating_desc', 'rating_asc', 'created_desc', 'created_asc']).default('created_desc'),
});

// Export types
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type CreateProductVariant = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariant = z.infer<typeof updateProductVariantSchema>;
export type BulkUpdateProducts = z.infer<typeof bulkUpdateProductsSchema>;
export type CreateReview = z.infer<typeof createReviewSchema>;
export type UpdateReview = z.infer<typeof updateReviewSchema>;
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;