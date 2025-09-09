import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';
import { CacheService } from '../../services/cache.service';

/**
 * Create a new product
 * Only vendors and admins can create products
 */
export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      shortDescription,
      sku,
      categoryId,
      price,
      compareAtPrice,
      costPrice,
      stockQuantity = 0,
      minStockLevel = 0,
      weight,
      dimensions,
      images,
      tags = [],
      status = 'draft',
      isActive = true,
      isFeatured = false,
      requiresShipping = true,
      seoTitle,
      seoDescription,
    } = req.body;

    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to create products',
        },
      });
      return;
    }

    // Check if user is vendor or admin
    if (userRole !== 'vendor' && userRole !== 'admin' && userRole !== 'super_admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'Only vendors and admins can create products',
        },
      });
      return;
    }

    let vendorId: number;

    if (userRole === 'vendor') {
      // Get vendor ID for the user
      const vendor = await prisma.vendor.findUnique({
        where: { userId },
        select: { id: true, isVerified: true },
      });

      if (!vendor) {
        res.status(404).json({
          success: false,
          message: 'Vendor profile not found',
          error: {
            code: 'VENDOR_NOT_FOUND',
            details: 'Vendor profile must exist to create products',
          },
        });
        return;
      }

      if (!vendor.isVerified) {
        res.status(403).json({
          success: false,
          message: 'Vendor account not verified',
          error: {
            code: 'VENDOR_NOT_VERIFIED',
            details: 'Vendor account must be verified to create products',
          },
        });
        return;
      }

      vendorId = vendor.id;
    } else {
      // Admin creating product - need vendorId in request body
      if (!req.body.vendorId) {
        res.status(400).json({
          success: false,
          message: 'Vendor ID required',
          error: {
            code: 'VENDOR_ID_REQUIRED',
            details: 'Admin must specify vendorId when creating products',
          },
        });
        return;
      }
      vendorId = req.body.vendorId;
    }

    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku },
      select: { id: true },
    });

    if (existingSku) {
      res.status(400).json({
        success: false,
        message: 'SKU already exists',
        error: {
          code: 'SKU_EXISTS',
          details: 'A product with this SKU already exists',
        },
      });
      return;
    }

    // Check if category exists
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

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create the product
    const product = await prisma.product.create({
      data: {
        vendorId,
        categoryId,
        name,
        description,
        shortDescription,
        sku,
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
        isFeatured,
        requiresShipping,
        seoTitle,
        seoDescription,
      },
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
      },
    });

    // Audit log
    await logAuditEvent({
      userId,
      action: AUDIT_ACTIONS.PRODUCT_CREATE,
      resource: AUDIT_RESOURCES.PRODUCT,
      resourceId: product.id.toString(),
      details: {
        productName: product.name,
        sku: product.sku,
        vendorId: product.vendorId,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Invalidate product cache
    await CacheService.invalidateProductCache();

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to create product',
      },
    });
  }
};