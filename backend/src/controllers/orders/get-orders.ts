import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';

/**
 * Get user orders with pagination and filtering
 */
export const getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      page = 1,
      limit = 10,
      status,
      vendorId,
    } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to view orders',
        },
      });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    // If vendor, filter orders that contain products from this vendor
    if (vendorId) {
      where.orderItems = {
        some: {
          vendorId: parseInt(vendorId as string),
        },
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
              vendor: {
                select: {
                  id: true,
                  businessName: true,
                },
              },
            },
          },
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
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

/**
 * Get single order by ID
 */
export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to view order',
        },
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Order ID is required',
        error: {
          code: 'MISSING_ID',
          details: 'Order ID parameter is missing',
        },
      });
      return;
    }

    const orderId = parseInt(id as string);
    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order ID',
        error: {
          code: 'INVALID_ID',
          details: 'Order ID must be a valid number',
        },
      });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                images: true,
                sku: true,
              },
            },
            vendor: {
              select: {
                id: true,
                businessName: true,
                businessAddress: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            transactionId: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
        error: {
          code: 'ORDER_NOT_FOUND',
          details: 'The requested order does not exist',
        },
      });
      return;
    }

    // Check if user owns the order or is admin
    if (order.userId !== userId && req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'You can only view your own orders',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve order',
      },
    });
  }
};