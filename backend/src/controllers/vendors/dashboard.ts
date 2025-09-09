import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';

/**
 * Get vendor dashboard data
 */
export const getVendorDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to access dashboard',
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
        commissionRate: true,
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

    // Get dashboard metrics
    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      earningsData,
    ] = await Promise.all([
      // Total products
      prisma.product.count({
        where: { vendorId: vendor.id },
      }),

      // Total orders
      prisma.orderItem.count({
        where: { vendorId: vendor.id },
      }),

      // Total revenue
      prisma.orderItem.aggregate({
        where: { vendorId: vendor.id },
        _sum: { totalPrice: true },
      }),

      // Pending orders
      prisma.orderItem.count({
        where: {
          vendorId: vendor.id,
          order: { status: 'pending' },
        },
      }),

      // Low stock products (less than 10)
      prisma.product.count({
        where: {
          vendorId: vendor.id,
          stockQuantity: { lt: 10 },
        },
      }),

      // Recent orders
      prisma.orderItem.findMany({
        where: { vendorId: vendor.id },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
              createdAt: true,
            },
          },
          product: {
            select: {
              name: true,
              images: true,
            },
          },
        },
        orderBy: { id: 'desc' },
        take: 5,
      }),

      // Earnings data
      prisma.vendorEarning.aggregate({
        where: { vendorId: vendor.id },
        _sum: {
          grossAmount: true,
          netAmount: true,
        },
      }),
    ]);

    // Calculate earnings
    const grossEarnings = earningsData._sum.grossAmount ? Number(earningsData._sum.grossAmount) : 0;
    const netEarnings = earningsData._sum.netAmount ? Number(earningsData._sum.netAmount) : 0;
    const commissionAmount = grossEarnings - netEarnings;

    // Get pending payouts
    const pendingPayouts = await prisma.vendorEarning.aggregate({
      where: {
        vendorId: vendor.id,
        status: 'pending',
      },
      _sum: { netAmount: true },
    });

    // Get last payout
    const lastPayout = await prisma.vendorEarning.findFirst({
      where: {
        vendorId: vendor.id,
        status: 'paid',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        netAmount: true,
        createdAt: true,
      },
    });

    const dashboardData = {
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      earnings: {
        thisMonth: netEarnings, // Simplified - would need date filtering
        lastMonth: 0, // Would need proper date calculations
        pending: pendingPayouts._sum.netAmount || 0,
        totalEarned: netEarnings,
        commissionPaid: commissionAmount,
      },
      lastPayout: lastPayout ? {
        amount: lastPayout.netAmount,
        date: lastPayout.createdAt,
      } : null,
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Get vendor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve dashboard data',
      },
    });
  }
};