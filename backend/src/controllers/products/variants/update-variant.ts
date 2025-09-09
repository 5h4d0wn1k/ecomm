import { Request, Response } from 'express';
import { prisma } from '../../../config';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../../utils/audit';

export const updateVariant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId, variantId } = req.params;
    const { name, value, skuSuffix, priceModifier, stockQuantity, isActive, sortOrder } = req.body;

    const productIdNum = parseInt(productId || '0', 10);
    const variantIdNum = parseInt(variantId || '0', 10);

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
    const isOwner = req.user?.role === 'admin' ||
      (req.user?.role === 'vendor' && variant.product.vendor?.userId === req.user.id);

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
    if (req.user?.role === 'vendor' && variant.product.vendor?.isVerified !== true) {
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

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (value !== undefined) updateData.value = value;
    if (skuSuffix !== undefined) updateData.skuSuffix = skuSuffix;
    if (priceModifier !== undefined) updateData.priceModifier = parseFloat(priceModifier);
    if (stockQuantity !== undefined) updateData.stockQuantity = stockQuantity;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    // Update variant
    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantIdNum },
      data: updateData,
    });

    // Audit log
    await logAuditEvent({
      userId: req.user?.id || 0,
      action: AUDIT_ACTIONS.PRODUCT_UPDATED,
      resource: AUDIT_RESOURCES.PRODUCT,
      resourceId: productIdNum.toString(),
      details: {
        action: 'variant_updated',
        variantId: variantIdNum,
        changes: Object.keys(updateData),
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
      success: true,
      data: updatedVariant,
      message: 'Product variant updated successfully',
    });
  } catch (error) {
    console.error('Update variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to update product variant',
      },
    });
  }
};

export const getProductVariants = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { includeInactive = 'false' } = req.query;

    const productIdNum = parseInt(productId || '0', 10);
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

    // Check permissions for vendors
    if (req.user?.role === 'vendor' && product.vendor.userId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'You can only view variants for your own products',
        },
      });
      return;
    }

    // Build where clause
    const where: any = { productId: productIdNum };
    if (includeInactive !== 'true') {
      where.isActive = true;
    }

    const variants = await prisma.productVariant.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: variants,
      message: 'Product variants retrieved successfully',
    });
  } catch (error) {
    console.error('Get product variants error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve product variants',
      },
    });
  }
};