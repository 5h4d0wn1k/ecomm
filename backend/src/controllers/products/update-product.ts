import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';
import { CacheService } from '../../services/cache.service';

/**
 * Update a product
 * Only the product owner (vendor) or admin can update
 */
export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const productId = parseInt(id);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to update products',
        },
      });
      return;
    }

    // Get the existing product
    const existingProduct = await prisma.product.findUnique({
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

    if (!existingProduct) {
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
    const isOwner = existingProduct.vendor.userId === userId;
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'You can only update your own products',
        },
      });
      return;
    }

    const {
      name,
      description,
      shortDescription,
      categoryId,
      price,
      compareAtPrice,
      costPrice,
      stockQuantity,
      minStockLevel,
      weight,
      dimensions,
      images,
      tags,
      status,
      isActive,
      isFeatured,
      requiresShipping,
      seoTitle,
      seoDescription,
    } = req.body;

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name;
      // Update slug if name changed
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      updateData.slug = `${slug}-${existingProduct.id}`;
    }

    if (description !== undefined) updateData.description = description;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (price !== undefined) updateData.price = price;
    if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice;
    if (costPrice !== undefined) updateData.costPrice = costPrice;
    if (stockQuantity !== undefined) updateData.stockQuantity = stockQuantity;
    if (minStockLevel !== undefined) updateData.minStockLevel = minStockLevel;
    if (weight !== undefined) updateData.weight = weight;
    if (dimensions !== undefined) updateData.dimensions = dimensions;
    if (images !== undefined) updateData.images = images;
    if (tags !== undefined) updateData.tags = tags;
    if (status !== undefined) updateData.status = status;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (requiresShipping !== undefined) updateData.requiresShipping = requiresShipping;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;

    // Check if category exists (if being updated)
    if (categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true, isActive: true },
      });

      if (!category || !category.isActive) {
        res.status(400).json({
          success: false,
          message: 'Invalid category',
          error: {
            code: 'INVALID_CATEGORY',
            details: 'Category does not exist or is inactive',
          },
        });
        return;
      }

      updateData.categoryId = categoryId;
    }

    updateData.updatedAt = new Date();

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            value: true,
            priceModifier: true,
            stockQuantity: true,
          },
        },
      },
    });

    // Audit log
    await logAuditEvent({
      userId,
      action: AUDIT_ACTIONS.PRODUCT_UPDATE,
      resource: AUDIT_RESOURCES.PRODUCT,
      resourceId: productId.toString(),
      details: {
        productName: updatedProduct.name,
        changes: Object.keys(updateData),
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Invalidate product cache
    await CacheService.invalidateProductCache(productId);

    res.status(200).json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to update product',
      },
    });
  }
};