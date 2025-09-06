import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';

/**
 * Get vendor profile
 */
export const getVendorProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to access vendor profile',
        },
      });
      return;
    }

    // Get vendor profile with user info
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
            emailVerified: true,
          },
        },
      },
    });

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
        error: {
          code: 'VENDOR_NOT_FOUND',
          details: 'Vendor profile does not exist',
        },
      });
      return;
    }

    // Format response according to API spec
    const response = {
      id: vendor.id,
      businessName: vendor.businessName,
      businessDescription: vendor.businessDescription,
      businessAddress: vendor.businessAddress,
      businessPhone: vendor.businessPhone,
      taxId: vendor.taxId,
      isVerified: vendor.isVerified,
      status: vendor.status,
      commissionRate: vendor.commissionRate,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve vendor profile',
      },
    });
  }
};

/**
 * Update vendor profile
 */
export const updateVendorProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { businessName, businessDescription, businessAddress, businessPhone, taxId } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to update vendor profile',
        },
      });
      return;
    }

    // Check if vendor profile exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!existingVendor) {
      res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
        error: {
          code: 'VENDOR_NOT_FOUND',
          details: 'Vendor profile does not exist',
        },
      });
      return;
    }

    // Update vendor profile
    const updatedVendor = await prisma.vendor.update({
      where: { userId },
      data: {
        ...(businessName && { businessName }),
        ...(businessDescription !== undefined && { businessDescription }),
        ...(businessAddress && { businessAddress }),
        ...(businessPhone !== undefined && { businessPhone }),
        ...(taxId !== undefined && { taxId }),
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
            emailVerified: true,
          },
        },
      },
    });

    // Format response according to API spec
    const response = {
      id: updatedVendor.id,
      businessName: updatedVendor.businessName,
      businessDescription: updatedVendor.businessDescription,
      businessAddress: updatedVendor.businessAddress,
      businessPhone: updatedVendor.businessPhone,
      taxId: updatedVendor.taxId,
      isVerified: updatedVendor.isVerified,
      status: updatedVendor.status,
      commissionRate: updatedVendor.commissionRate,
      createdAt: updatedVendor.createdAt,
      updatedAt: updatedVendor.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: response,
      message: 'Vendor profile updated successfully',
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to update vendor profile',
      },
    });
  }
};