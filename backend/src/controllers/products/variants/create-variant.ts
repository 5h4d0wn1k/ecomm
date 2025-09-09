import { Request, Response } from 'express';
import { prisma } from '../../../config';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../../utils/audit';

export const createVariant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { name, value, skuSuffix, priceModifier, stockQuantity, isActive, sortOrder } = req.body;

    if (!productId) {
      res.status(400).json({
        success: false,
        message: 'Product ID is required',
        error: {
          code: 'MISSING_PRODUCT_ID',
          details: 'Product ID parameter is missing',
        },
      });
      return;
    }

    const productIdNum = parseInt(productId, 10);
    if (isNaN(productIdNum)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        error: {
          code: 'INVALID_PRODUCT_ID',
          details: 'Product ID must be a number',
        },
      });
      return;
    }

    // Check if product exists and user has permission
    const product = await prisma.product.findUnique({
      where: { id: productIdNum },
      include: {
        vendor: {
          select: {
            id: true,
            userId: true,
            isVerified: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
        error: {
          code: 'PRODUCT_NOT_FOUND',
          details: 'The requested product does not exist',
        },
      });
      return;
    }

    // Check permissions
    const isOwner = !req.user || req.user.role === 'admin' ||
      (req.user.role === 'vendor' && product.vendor.userId === req.user.id);

    if (!isOwner) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'You can only manage variants for your own products',
        },
      });
      return;
    }

    // If vendor, check if their account is approved
    if (req.user && req.user.role === 'vendor' && product.vendor.isVerified !== true) {
      res.status(403).json({
        success: false,
        message: 'Vendor account not approved',
        error: {
          code: 'VENDOR_NOT_APPROVED',
          details: 'Your vendor account must be approved to manage product variants',
        },
      });
      return;
    }

    // Create variant
    const variant = await prisma.productVariant.create({
      data: {
        productId: productIdNum,
        name,
        value,
        skuSuffix,
        priceModifier: priceModifier ? parseFloat(priceModifier) : 0,
        stockQuantity: stockQuantity || 0,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
    });

    // Audit log
    if (req.user) {
      await logAuditEvent({
        userId: req.user.id,
        action: AUDIT_ACTIONS.PRODUCT_UPDATED,
        resource: AUDIT_RESOURCES.PRODUCT,
        resourceId: productIdNum.toString(),
        details: {
          action: 'variant_created',
          variantId: variant.id,
          variantName: variant.name,
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }

    res.status(201).json({
      success: true,
      data: variant,
      message: 'Product variant created successfully',
    });
  } catch (error) {
    console.error('Create variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to create product variant',
      },
    });
  }
};