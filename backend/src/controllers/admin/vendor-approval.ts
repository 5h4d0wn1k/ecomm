import { Request, Response } from 'express';
import { prisma } from '../../config';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';
import { AuthenticatedRequest } from '../../middlewares';

export const getPendingVendors = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const vendors = await prisma.vendor.findMany({
      where: { isVerified: false },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: vendors,
      message: 'Pending vendors retrieved successfully',
    });
  } catch (error) {
    console.error('Get pending vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve pending vendors',
      },
    });
  }
};

export const approveVendor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { vendorId } = req.params;
    if (!vendorId) {
      res.status(400).json({
        success: false,
        message: 'Vendor ID is required',
        error: {
          code: 'MISSING_ID',
          details: 'Vendor ID parameter is missing',
        },
      });
      return;
    }
    const { commissionRate = 10.00 } = req.body;
    const adminId = req.user?.id;

    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(vendorId) },
      include: { user: true },
    });

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: 'Vendor not found',
        error: {
          code: 'VENDOR_NOT_FOUND',
          details: 'The specified vendor does not exist',
        },
      });
      return;
    }

    if (vendor.isVerified) {
      res.status(400).json({
        success: false,
        message: 'Vendor is already verified',
        error: {
          code: 'ALREADY_VERIFIED',
          details: 'Vendor has already been verified',
        },
      });
      return;
    }

    // Update vendor commission rate and verification status
    const updatedVendor = await prisma.vendor.update({
      where: { id: parseInt(vendorId) },
      data: {
        commissionRate,
        isVerified: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Audit log
    if (adminId) {
      await logAuditEvent({
        userId: adminId,
        action: AUDIT_ACTIONS.VENDOR_APPROVE,
        resource: AUDIT_RESOURCES.VENDOR,
        resourceId: vendorId,
        details: { commissionRate, approvedBy: adminId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }

    res.status(200).json({
      success: true,
      data: updatedVendor,
      message: 'Vendor approved successfully',
    });
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to approve vendor',
      },
    });
  }
};

export const rejectVendor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { vendorId } = req.params;
    if (!vendorId) {
      res.status(400).json({
        success: false,
        message: 'Vendor ID is required',
        error: {
          code: 'MISSING_ID',
          details: 'Vendor ID parameter is missing',
        },
      });
      return;
    }
    const { reason } = req.body;
    const adminId = req.user?.id;

    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(vendorId) },
      include: { user: true },
    });

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: 'Vendor not found',
        error: {
          code: 'VENDOR_NOT_FOUND',
          details: 'The specified vendor does not exist',
        },
      });
      return;
    }

    if (vendor.isVerified) {
      res.status(400).json({
        success: false,
        message: 'Vendor is already verified',
        error: {
          code: 'ALREADY_VERIFIED',
          details: 'Cannot reject a verified vendor',
        },
      });
      return;
    }

    // Mark vendor as inactive (rejected)
    const updatedVendor = await prisma.vendor.update({
      where: { id: parseInt(vendorId) },
      data: {
        isVerified: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Audit log
    if (adminId) {
      await logAuditEvent({
        userId: adminId,
        action: AUDIT_ACTIONS.VENDOR_REJECT,
        resource: AUDIT_RESOURCES.VENDOR,
        resourceId: vendorId,
        details: { reason, rejectedBy: adminId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }

    res.status(200).json({
      success: true,
      data: updatedVendor,
      message: 'Vendor rejected successfully',
    });
  } catch (error) {
    console.error('Reject vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to reject vendor',
      },
    });
  }
};

export const getAllVendors = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = {};

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.vendor.count({ where });

    res.status(200).json({
      success: true,
      data: {
        vendors,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      },
      message: 'Vendors retrieved successfully',
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve vendors',
      },
    });
  }
};