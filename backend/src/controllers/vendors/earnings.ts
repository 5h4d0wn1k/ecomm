import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';

/**
 * Get vendor earnings
 */
export const getVendorEarnings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      page = 1,
      limit = 20,
      status,
      fromDate,
      toDate,
    } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to access earnings',
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

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate as string);
      if (toDate) where.createdAt.lte = new Date(toDate as string);
    }

    const [earnings, total, summary] = await Promise.all([
      prisma.vendorEarning.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              createdAt: true,
            },
          },
          orderItem: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      }),
      prisma.vendorEarning.count({ where }),
      // Summary statistics
      prisma.vendorEarning.aggregate({
        where: { vendorId: vendor.id },
        _sum: {
          grossAmount: true,
          commissionAmount: true,
          netAmount: true,
        },
      }),
    ]);

    // Get pending payout amount
    const pendingPayout = await prisma.vendorEarning.aggregate({
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

    // Monthly earnings (simplified - last 12 months)
    const monthlyEarnings = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthlyTotal = await prisma.vendorEarning.aggregate({
        where: {
          vendorId: vendor.id,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { netAmount: true },
      });

      monthlyEarnings.push({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
        amount: monthlyTotal._sum.netAmount || 0,
      });
    }

    const earningsData = {
      totalEarned: summary._sum.netAmount || 0,
      totalCommission: summary._sum.commissionAmount || 0,
      pendingPayout: pendingPayout._sum.netAmount || 0,
      lastPayout: lastPayout ? {
        amount: lastPayout.netAmount,
        date: lastPayout.createdAt,
      } : null,
      monthlyEarnings,
      earnings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };

    res.status(200).json({
      success: true,
      data: earningsData,
    });
  } catch (error) {
    console.error('Get vendor earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve earnings data',
      },
    });
  }
};