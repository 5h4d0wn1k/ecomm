import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';
import { CacheService } from '../../services/cache.service';

export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Product ID is required',
        error: {
          code: 'MISSING_ID',
          details: 'Product ID parameter is missing',
        },
      });
      return;
    }
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        error: {
          code: 'INVALID_ID',
          details: 'Product ID must be a number',
        },
      });
      return;
    }

    // Check if product exists and user has permission
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        vendor: {
          select: {
            id: true,
            userId: true,
            
          },
        },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            order: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
        wishlists: {
          select: { id: true },
        },
        reviews: {
          select: { id: true },
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
    const isOwner = req.user?.role === 'admin' ||
      (req.user?.role === 'vendor' && product.vendor.userId === req.user.id);

    if (!isOwner) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'You can only delete your own products',
        },
      });
      return;
    }

    // If vendor, check if their account is verified
    if (req.user?.role === 'vendor') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id },
        select: { isVerified: true },
      });
      if (!vendor?.isVerified) {
        res.status(403).json({
          success: false,
          message: 'Vendor account not verified',
          error: {
            code: 'VENDOR_NOT_VERIFIED',
            details: 'Your vendor account must be verified to delete products',
          },
        });
        return;
      }
    }

    // Check if product has active orders
    const activeOrderItems = product.orderItems.filter(item =>
      ['pending', 'confirmed', 'processing', 'shipped'].includes(item.order.status)
    );

    if (activeOrderItems.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Cannot delete product with active orders',
        error: {
          code: 'ACTIVE_ORDERS_EXIST',
          details: `Product has ${activeOrderItems.length} active order(s). Archive the product instead.`,
        },
      });
      return;
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete related data
      await tx.productVariant.deleteMany({
        where: { productId },
      });

      await tx.wishlist.deleteMany({
        where: { productId },
      });

      await tx.review.deleteMany({
        where: { productId },
      });

      // Delete completed/cancelled order items (keep historical data)
      await tx.orderItem.deleteMany({
        where: {
          productId,
          order: {
            status: {
              in: ['delivered', 'cancelled', 'refunded'],
            },
          },
        },
      });

      // Finally delete the product
      await tx.product.delete({
        where: { id: productId },
      });
    });

    // Audit log
    if (req.user?.id) {
      await logAuditEvent({
        userId: req.user.id,
        action: AUDIT_ACTIONS.PRODUCT_DELETED,
        resource: AUDIT_RESOURCES.PRODUCT,
        resourceId: productId.toString(),
        details: {
          productName: product.name,
          vendorId: product.vendorId,
          hadActiveOrders: activeOrderItems.length > 0,
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }

    // Invalidate product cache
    await CacheService.invalidateProductCache(productId);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to delete product',
      },
    });
  }
};

export const archiveProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Product ID is required',
        error: {
          code: 'MISSING_ID',
          details: 'Product ID parameter is missing',
        },
      });
      return;
    }
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        error: {
          code: 'INVALID_ID',
          details: 'Product ID must be a number',
        },
      });
      return;
    }

    // Check if product exists and user has permission
    const product = await prisma.product.findUnique({
      where: { id: productId },
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

    // Check permissions
    const isOwner = req.user?.role === 'admin' ||
      (req.user?.role === 'vendor' && product.vendor.userId === req.user.id);

    if (!isOwner) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'You can only archive your own products',
        },
      });
      return;
    }

    // If vendor, check if their account is verified
    if (req.user?.role === 'vendor') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id },
        select: { isVerified: true },
      });
      if (!vendor?.isVerified) {
        res.status(403).json({
          success: false,
          message: 'Vendor account not verified',
          error: {
            code: 'VENDOR_NOT_VERIFIED',
            details: 'Your vendor account must be verified to archive products',
          },
        });
        return;
      }
    }

    // Archive the product
    const archivedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        status: 'archived',
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Audit log
    if (req.user?.id) {
      await logAuditEvent({
        userId: req.user.id,
        action: AUDIT_ACTIONS.PRODUCT_UPDATED,
        resource: AUDIT_RESOURCES.PRODUCT,
        resourceId: productId.toString(),
        details: {
          action: 'archived',
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }

    // Invalidate product cache
    await CacheService.invalidateProductCache(productId);

    res.status(200).json({
      success: true,
      data: archivedProduct,
      message: 'Product archived successfully',
    });
  } catch (error) {
    console.error('Archive product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to archive product',
      },
    });
  }
};