import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AuthenticatedRequest } from '../middlewares';

/**
 * Get revenue data for admin or vendor
 */
export const getRevenueData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { period = 'daily', startDate, endDate, vendorId } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
        error: {
          code: 'MISSING_PARAMETERS',
          details: 'startDate and endDate query parameters are required',
        },
      });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // If vendorId is provided, get vendor-specific data
    const vendorIdNum = vendorId ? parseInt(vendorId as string) : undefined;

    const data = await AnalyticsService.getRevenueData(
      period as 'daily' | 'weekly' | 'monthly' | 'yearly',
      start,
      end,
      vendorIdNum
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get revenue data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve revenue data',
      },
    });
  }
};

/**
 * Get product performance data
 */
export const getProductPerformance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { vendorId } = req.query;
    const vendorIdNum = vendorId ? parseInt(vendorId as string) : undefined;

    const data = await AnalyticsService.getProductPerformance(vendorIdNum);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get product performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve product performance data',
      },
    });
  }
};

/**
 * Get revenue data for vendor (authenticated vendor only)
 */
export const getVendorRevenueData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated',
        },
      });
      return;
    }

    // Get vendor info
    const { prisma } = await import('../config');
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

    const { period = 'daily', startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
        error: {
          code: 'MISSING_PARAMETERS',
          details: 'startDate and endDate query parameters are required',
        },
      });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const data = await AnalyticsService.getRevenueData(
      period as 'daily' | 'weekly' | 'monthly' | 'yearly',
      start,
      end,
      vendor.id
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get vendor revenue data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve vendor revenue data',
      },
    });
  }
};

/**
 * Get product performance data for vendor (authenticated vendor only)
 */
export const getVendorProductPerformance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated',
        },
      });
      return;
    }

    // Get vendor info
    const { prisma } = await import('../config');
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

    const data = await AnalyticsService.getProductPerformance(vendor.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get vendor product performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve vendor product performance data',
      },
    });
  }
};