import { Request, Response } from 'express';
import { prisma } from '../../config';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';
import { AuthenticatedRequest } from '../../middlewares';

export const getAllProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      vendor,
      category,
      sort = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Vendor filter
    if (vendor) {
      where.vendorId = parseInt(vendor as string);
    }

    // Category filter
    if (category) {
      where.categoryId = parseInt(category as string);
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            isVerified: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          },
        },
      },
      orderBy: {
        [sort as string]: sortOrder,
      },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.product.count({ where });

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      },
      message: 'Products retrieved successfully',
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve products',
      },
    });
  }
};

export const getPendingProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'pending' },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            contactEmail: true,
            isVerified: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: products,
      message: 'Pending products retrieved successfully',
    });
  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve pending products',
      },
    });
  }
};

export const approveProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    if (!productId) {
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
    const adminId = req.user?.id;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      include: { vendor: true },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
        error: {
          code: 'PRODUCT_NOT_FOUND',
          details: 'The specified product does not exist',
        },
      });
      return;
    }

    if (product.status === 'active') {
      res.status(400).json({
        success: false,
        message: 'Product is already approved',
        error: {
          code: 'ALREADY_APPROVED',
          details: 'Product has already been approved',
        },
      });
      return;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: { status: 'active' },
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
          },
        },
      },
    });

    // Audit log
    if (adminId) {
      await logAuditEvent({
        userId: adminId,
        action: AUDIT_ACTIONS.PRODUCT_UPDATE,
        resource: AUDIT_RESOURCES.PRODUCT,
        resourceId: productId,
        details: { oldStatus: product.status, newStatus: 'active', approvedBy: adminId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }

    res.status(200).json({
      success: true,
      data: updatedProduct,
      message: 'Product approved successfully',
    });
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to approve product',
      },
    });
  }
};

export const rejectProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    if (!productId) {
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
    const { reason } = req.body;
    const adminId = req.user?.id;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      include: { vendor: true },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
        error: {
          code: 'PRODUCT_NOT_FOUND',
          details: 'The specified product does not exist',
        },
      });
      return;
    }

    if (product.status === 'rejected') {
      res.status(400).json({
        success: false,
        message: 'Product is already rejected',
        error: {
          code: 'ALREADY_REJECTED',
          details: 'Product has already been rejected',
        },
      });
      return;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: { status: 'rejected' },
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
          },
        },
      },
    });

    // Audit log
    if (adminId) {
      await logAuditEvent({
        userId: adminId,
        action: AUDIT_ACTIONS.PRODUCT_UPDATE,
        resource: AUDIT_RESOURCES.PRODUCT,
        resourceId: productId,
        details: { oldStatus: product.status, newStatus: 'rejected', reason, rejectedBy: adminId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }

    res.status(200).json({
      success: true,
      data: updatedProduct,
      message: 'Product rejected successfully',
    });
  } catch (error) {
    console.error('Reject product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to reject product',
      },
    });
  }
};

export const updateProductStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user?.id;

    if (!productId) {
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

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      include: { vendor: true },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
        error: {
          code: 'PRODUCT_NOT_FOUND',
          details: 'The specified product does not exist',
        },
      });
      return;
    }

    const oldStatus = product.status;
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: { status },
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
          },
        },
      },
    });

    // Audit log
    if (adminId) {
      await logAuditEvent({
        userId: adminId,
        action: AUDIT_ACTIONS.PRODUCT_UPDATE,
        resource: AUDIT_RESOURCES.PRODUCT,
        resourceId: productId,
        details: { oldStatus, newStatus: status, reason, updatedBy: adminId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }

    res.status(200).json({
      success: true,
      data: updatedProduct,
      message: 'Product status updated successfully',
    });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to update product status',
      },
    });
  }
};