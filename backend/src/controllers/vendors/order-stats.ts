import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';

/**
 * Get vendor order statistics
 */
export const getVendorOrderStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to access order stats',
        },
      });
      return;
    }

    // Get vendor info
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      select: {
        id: true,
        businessName: true,
      },
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

    // Get order statistics
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      refundedOrders,
      totalRevenue,
      monthlyRevenue,
      averageOrderValue,
    ] = await Promise.all([
      // Total orders count
      prisma.orderItem.count({
        where: { vendorId: vendor.id },
      }),

      // Pending orders
      prisma.orderItem.count({
        where: {
          vendorId: vendor.id,
          order: { status: 'pending' },
        },
      }),

      // Processing orders
      prisma.orderItem.count({
        where: {
          vendorId: vendor.id,
          order: { status: 'processing' },
        },
      }),

      // Shipped orders
      prisma.orderItem.count({
        where: {
          vendorId: vendor.id,
          order: { status: 'shipped' },
        },
      }),

      // Delivered orders
      prisma.orderItem.count({
        where: {
          vendorId: vendor.id,
          order: { status: 'delivered' },
        },
      }),

      // Cancelled orders
      prisma.orderItem.count({
        where: {
          vendorId: vendor.id,
          order: { status: 'cancelled' },
        },
      }),

      // Refunded orders
      prisma.orderItem.count({
        where: {
          vendorId: vendor.id,
          order: { status: 'refunded' },
        },
      }),

      // Total revenue
      prisma.orderItem.aggregate({
        where: {
          vendorId: vendor.id,
          order: { status: 'delivered' },
        },
        _sum: { totalPrice: true },
      }),

      // Monthly revenue (current month)
      prisma.orderItem.aggregate({
        where: {
          vendorId: vendor.id,
          order: {
            status: 'delivered',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        _sum: { totalPrice: true },
      }),

      // Average order value
      prisma.orderItem.aggregate({
        where: {
          vendorId: vendor.id,
          order: { status: 'delivered' },
        },
        _avg: { totalPrice: true },
      }),
    ]);

    const stats = {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      refundedOrders,
      totalRevenue: Number(totalRevenue._sum.totalPrice || 0),
      monthlyRevenue: Number(monthlyRevenue._sum.totalPrice || 0),
      averageOrderValue: Number(averageOrderValue._avg.totalPrice || 0),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get vendor order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve order statistics',
      },
    });
  }
};