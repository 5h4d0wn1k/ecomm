import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';

/**
 * Get vendor's products
 */
export const getVendorProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sort = 'created_desc',
    } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to access products',
        },
      });
      return;
    }

    // Get vendor
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: 'Vendor not found',
        error: {
          code: 'VENDOR_NOT_FOUND',
          details: 'Vendor profile does not exist',
        },
      });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = { vendorId: vendor.id };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'stock_asc':
        orderBy = { stockQuantity: 'asc' };
        break;
      case 'stock_desc':
        orderBy = { stockQuantity: 'desc' };
        break;
      case 'created_asc':
        orderBy = { createdAt: 'asc' };
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          variants: {
            select: {
              id: true,
              name: true,
              value: true,
              stockQuantity: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              orderItems: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
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

/**
 * Get vendor orders
 */
export const getVendorOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sort = 'created_desc',
    } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to access orders',
        },
      });
      return;
    }

    // Get vendor
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: 'Vendor not found',
        error: {
          code: 'VENDOR_NOT_FOUND',
          details: 'Vendor profile does not exist',
        },
      });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = { vendorId: vendor.id };

    if (status) {
      where.order = { status };
    }

    if (search) {
      where.OR = [
        { order: { orderNumber: { contains: search as string, mode: 'insensitive' } } },
        { product: { name: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'created_asc':
        orderBy = { createdAt: 'asc' };
        break;
      case 'amount_asc':
        orderBy = { totalPrice: 'asc' };
        break;
      case 'amount_desc':
        orderBy = { totalPrice: 'desc' };
        break;
    }

    const [orderItems, total] = await Promise.all([
      prisma.orderItem.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
              createdAt: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              sku: true,
            },
          },
        },
      }),
      prisma.orderItem.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: orderItems,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve orders',
      },
    });
  }
};