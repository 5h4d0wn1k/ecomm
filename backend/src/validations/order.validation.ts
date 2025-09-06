import { z } from 'zod';

/**
 * Order validation schemas using Zod
 */

// Order status validation
export const orderStatusSchema = z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']);

// Payment status validation
export const paymentStatusSchema = z.enum(['pending', 'paid', 'failed', 'refunded']);

// Payment method validation
export const paymentMethodSchema = z.enum(['card', 'bank_transfer', 'wallet', 'cod']);

// Address validation schema
export const addressSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must not exceed 50 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must not exceed 50 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters').max(200, 'Address must not exceed 200 characters'),
  city: z.string().min(2, 'City must be at least 2 characters').max(50, 'City must not exceed 50 characters'),
  state: z.string().min(2, 'State must be at least 2 characters').max(50, 'State must not exceed 50 characters'),
  zipCode: z.string().min(5, 'Zip code must be at least 5 characters').max(10, 'Zip code must not exceed 10 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters').max(50, 'Country must not exceed 50 characters'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional(),
});

// Order item validation schema
export const orderItemSchema = z.object({
  productId: z.number().int().positive('Product ID must be a positive integer'),
  variantId: z.number().int().positive().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

/**
 * Create order validation
 */
export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  paymentMethod: paymentMethodSchema,
  couponCode: z.string().optional(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
});

/**
 * Update order validation
 */
export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  trackingNumber: z.string().max(100, 'Tracking number must not exceed 100 characters').optional(),
  shiprocketOrderId: z.number().int().positive().optional(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
});

/**
 * Order query validation
 */
export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  search: z.string().optional(), // Search by order number or customer name
  vendorId: z.coerce.number().int().positive().optional(),
  sort: z.enum(['created_desc', 'created_asc', 'amount_desc', 'amount_asc', 'status']).default('created_desc'),
});

/**
 * Update order status validation
 */
export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  trackingNumber: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Cancel order validation
 */
export const cancelOrderSchema = z.object({
  reason: z.string().min(10, 'Cancellation reason must be at least 10 characters').max(500, 'Reason must not exceed 500 characters'),
});

/**
 * Refund order validation
 */
export const refundOrderSchema = z.object({
  amount: z.number().positive('Refund amount must be positive').optional(), // If not provided, full refund
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).default('requested_by_customer'),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
});

/**
 * Order analytics validation
 */
export const orderAnalyticsSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
  vendorId: z.coerce.number().int().positive().optional(),
  status: orderStatusSchema.optional(),
});

/**
 * Shipping update validation
 */
export const shippingUpdateSchema = z.object({
  orderId: z.number().int().positive(),
  status: z.enum(['picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'lost']),
  trackingNumber: z.string(),
  location: z.string().optional(),
  estimatedDelivery: z.coerce.date().optional(),
  actualDelivery: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Bulk order update validation
 */
export const bulkOrderUpdateSchema = z.object({
  orderIds: z.array(z.number().int().positive()).min(1, 'At least one order ID is required'),
  updates: z.object({
    status: orderStatusSchema.optional(),
    paymentStatus: paymentStatusSchema.optional(),
  }),
});

// Export types
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
export type UpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>;
export type CancelOrder = z.infer<typeof cancelOrderSchema>;
export type RefundOrder = z.infer<typeof refundOrderSchema>;
export type OrderAnalytics = z.infer<typeof orderAnalyticsSchema>;
export type ShippingUpdate = z.infer<typeof shippingUpdateSchema>;
export type BulkOrderUpdate = z.infer<typeof bulkOrderUpdateSchema>;
export type Address = z.infer<typeof addressSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;