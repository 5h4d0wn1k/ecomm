import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';

/**
 * Validate coupon code
 */
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderAmount } = req.query;

    if (!code) {
      res.status(400).json({
        success: false,
        message: 'Coupon code is required',
        error: {
          code: 'MISSING_COUPON_CODE',
          details: 'Coupon code parameter is required',
        },
      });
      return;
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code as string,
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() },
        OR: [
          { usageLimit: null },
          { usageCount: { lt: prisma.coupon.fields.usageLimit } },
        ],
      },
    });

    if (!coupon) {
      res.status(200).json({
        success: true,
        data: {
          code: code as string,
          isValid: false,
          discountAmount: 0,
        },
      });
      return;
    }

    // Check minimum order amount
    const orderAmountNum = orderAmount ? parseFloat(orderAmount as string) : 0;
    if (coupon.minimumOrderAmount && orderAmountNum < Number(coupon.minimumOrderAmount)) {
      res.status(200).json({
        success: true,
        data: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minimumOrderAmount: coupon.minimumOrderAmount,
          isValid: false,
          discountAmount: 0,
          message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required`,
        },
      });
      return;
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmountNum * Number(coupon.discountValue)) / 100;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = Number(coupon.discountValue);
    }

    // Apply maximum discount limit
    if (coupon.maximumDiscountAmount && discountAmount > Number(coupon.maximumDiscountAmount)) {
      discountAmount = Number(coupon.maximumDiscountAmount);
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmountNum);

    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscountAmount: coupon.maximumDiscountAmount,
        isValid: true,
        discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
      },
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to validate coupon',
      },
    });
  }
};

/**
 * Create new coupon (Admin only)
 */
export const createCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || (userRole !== 'admin' && userRole !== 'super_admin')) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'Only administrators can create coupons',
        },
      });
      return;
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      usageLimit,
      validFrom,
      validUntil,
    } = req.body;

    // Validate required fields
    if (!code || !discountType || !discountValue) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          details: 'Code, discountType, and discountValue are required',
        },
      });
      return;
    }

    // Validate discount type
    if (!['percentage', 'fixed_amount'].includes(discountType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid discount type',
        error: {
          code: 'INVALID_DISCOUNT_TYPE',
          details: 'Discount type must be either "percentage" or "fixed_amount"',
        },
      });
      return;
    }

    // Validate discount value
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      res.status(400).json({
        success: false,
        message: 'Invalid discount value',
        error: {
          code: 'INVALID_DISCOUNT_VALUE',
          details: 'Percentage discount must be between 0 and 100',
        },
      });
      return;
    }

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (existingCoupon) {
      res.status(400).json({
        success: false,
        message: 'Coupon code already exists',
        error: {
          code: 'COUPON_EXISTS',
          details: 'A coupon with this code already exists',
        },
      });
      return;
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code,
        description,
        discountType,
        discountValue,
        minimumOrderAmount: minimumOrderAmount ? parseFloat(minimumOrderAmount) : null,
        maximumDiscountAmount: maximumDiscountAmount ? parseFloat(maximumDiscountAmount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      data: coupon,
      message: 'Coupon created successfully',
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to create coupon',
      },
    });
  }
};