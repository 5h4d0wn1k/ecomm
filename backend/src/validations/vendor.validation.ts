import { z } from 'zod';

/**
 * Vendor validation schemas using Zod
 */

// Vendor status validation
export const vendorStatusSchema = z.enum(['pending', 'approved', 'suspended', 'rejected']);

// Earning status validation
export const earningStatusSchema = z.enum(['pending', 'available', 'paid', 'on_hold']);

/**
 * Vendor profile update validation
 */
export const updateVendorProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100, 'Business name must not exceed 100 characters').optional(),
  businessDescription: z.string().max(1000, 'Business description must not exceed 1000 characters').optional(),
  businessAddress: z.string().min(10, 'Business address must be at least 10 characters').optional(),
  businessPhone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional(),
  taxId: z.string().min(5, 'Tax ID must be at least 5 characters').optional(),
  bankAccountDetails: z.object({
    accountHolderName: z.string().min(2, 'Account holder name is required'),
    accountNumber: z.string().min(8, 'Account number must be at least 8 characters'),
    bankName: z.string().min(2, 'Bank name is required'),
    ifscCode: z.string().min(11, 'IFSC code must be 11 characters').max(11),
    accountType: z.enum(['savings', 'current']).default('savings'),
  }).optional(),
});

/**
 * Vendor status update validation (Admin only)
 */
export const updateVendorStatusSchema = z.object({
  status: vendorStatusSchema,
  message: z.string().max(500, 'Message must not exceed 500 characters').optional(),
  commissionRate: z.number().min(0, 'Commission rate cannot be negative').max(50, 'Commission rate cannot exceed 50%').optional(),
});

/**
 * Vendor query validation
 */
export const vendorQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: vendorStatusSchema.optional(),
  search: z.string().optional(), // Search by business name or email
  sort: z.enum(['created_desc', 'created_asc', 'name_asc', 'name_desc', 'rating_desc']).default('created_desc'),
  isVerified: z.coerce.boolean().optional(),
});

/**
 * Vendor dashboard query validation
 */
export const vendorDashboardQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year']).default('month'),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

/**
 * Vendor earnings query validation
 */
export const vendorEarningsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: earningStatusSchema.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  orderId: z.coerce.number().int().positive().optional(),
  sort: z.enum(['created_desc', 'created_asc', 'amount_desc', 'amount_asc']).default('created_desc'),
});

/**
 * Payout request validation
 */
export const payoutRequestSchema = z.object({
  amount: z.number().positive('Payout amount must be positive'),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
});

/**
 * Vendor approval validation (Admin only)
 */
export const vendorApprovalSchema = z.object({
  vendorId: z.number().int().positive('Vendor ID must be a positive integer'),
  approved: z.boolean(),
  message: z.string().max(500, 'Message must not exceed 500 characters').optional(),
  commissionRate: z.number().min(0).max(50).default(10),
});

/**
 * Vendor suspension validation (Admin only)
 */
export const vendorSuspensionSchema = z.object({
  reason: z.string().min(10, 'Suspension reason must be at least 10 characters').max(500, 'Reason must not exceed 500 characters'),
  suspendUntil: z.coerce.date().optional(),
});

/**
 * Vendor commission update validation (Admin only)
 */
export const updateCommissionSchema = z.object({
  commissionRate: z.number().min(0, 'Commission rate cannot be negative').max(50, 'Commission rate cannot exceed 50%'),
  effectiveFrom: z.coerce.date().optional(),
});

/**
 * Vendor performance query validation
 */
export const vendorPerformanceSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
  vendorIds: z.array(z.number().int().positive()).optional(),
  metrics: z.array(z.enum(['sales', 'orders', 'ratings', 'returns'])).default(['sales', 'orders']),
});

/**
 * Bulk vendor operations validation
 */
export const bulkVendorOperationSchema = z.object({
  vendorIds: z.array(z.number().int().positive()).min(1, 'At least one vendor ID is required'),
  operation: z.enum(['approve', 'suspend', 'activate', 'update_commission']),
  data: z.record(z.any()).optional(), // Operation-specific data
});

// Export types
export type UpdateVendorProfile = z.infer<typeof updateVendorProfileSchema>;
export type UpdateVendorStatus = z.infer<typeof updateVendorStatusSchema>;
export type VendorQuery = z.infer<typeof vendorQuerySchema>;
export type VendorDashboardQuery = z.infer<typeof vendorDashboardQuerySchema>;
export type VendorEarningsQuery = z.infer<typeof vendorEarningsQuerySchema>;
export type PayoutRequest = z.infer<typeof payoutRequestSchema>;
export type VendorApproval = z.infer<typeof vendorApprovalSchema>;
export type VendorSuspension = z.infer<typeof vendorSuspensionSchema>;
export type UpdateCommission = z.infer<typeof updateCommissionSchema>;
export type VendorPerformance = z.infer<typeof vendorPerformanceSchema>;
export type BulkVendorOperation = z.infer<typeof bulkVendorOperationSchema>;