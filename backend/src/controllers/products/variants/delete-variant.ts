import { Request, Response } from 'express';
import { prisma } from '../../../config';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../../utils/audit';

export const deleteVariant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId, variantId } = req.params;

    if (!productId || !variantId) {
      res.status(400).json({
        success: false,
        message: 'Product ID and Variant ID are required',
        error: {
          code: 'MISSING_IDS',
          details: 'Both Product ID and Variant ID parameters are required',
        },
      });
      return;
    }

    const productIdNum = parseInt(productId, 10);
    const variantIdNum = parseInt(variantId, 10);

    if (isNaN(productIdNum) || isNaN(variantIdNum)) {
      res.status(400).json({
        success: false,
        message: 'Invalid IDs',
        error: {
          code: 'INVALID_ID',
          details: 'Product ID and Variant ID must be numbers',
        },
      });
      return;
    }

    // Check if variant exists and belongs to the product
    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantIdNum,
        productId: productIdNum,
      },
      include: {
        product: {
          include: {
            vendor: {
              select: {
                id: true,
                userId: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    if (!variant) {
      res.status(404).json({
        success: false,
        message: 'Product variant not found',
        error: {
          code: 'VARIANT_NOT_FOUND',
          details: 'The requested product variant does not exist',
        },
      });
      return;
    }

    // Check permissions
    const isOwner = !req.user || req.user.role === 'admin' ||
      (req.user.role === 'vendor' && variant.product.vendor.userId === req.user.id);

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
    if (req.user && req.user.role === 'vendor' && variant.product.vendor.isVerified !== true) {
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

    // Delete the variant
    await prisma.productVariant.delete({
      where: { id: variantIdNum },
    });

    // Audit log
    if (req.user) {
      await logAuditEvent({
        userId: req.user.id,
        action: AUDIT_ACTIONS.PRODUCT_UPDATED,
        resource: AUDIT_RESOURCES.PRODUCT,
        resourceId: productIdNum.toString(),
        details: {
          action: 'variant_deleted',
          variantId: variantIdNum,
          variantName: variant.name,
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product variant deleted successfully',
    });
  } catch (error) {
    console.error('Delete variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to delete product variant',
      },
    });
  }
};