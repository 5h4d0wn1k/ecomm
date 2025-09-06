import { Request, Response } from 'express';
import { prisma } from '../../config';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';
import { AuthenticatedRequest } from '../../middlewares';

export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (role) where.role = role;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        
        createdAt: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.user.count({ where });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      },
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve users',
      },
    });
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
        error: {
          code: 'MISSING_ID',
          details: 'User ID parameter is missing',
        },
      });
      return;
    }
    const { role } = req.body;
    const adminId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: 'The specified user does not exist',
        },
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
      },
    });

    // Audit log
    if (adminId) {
      await logAuditEvent({
        userId: adminId,
        action: AUDIT_ACTIONS.ADMIN_ROLE_CHANGE,
        resource: AUDIT_RESOURCES.USER,
        resourceId: userId,
        details: { oldRole: user.role, newRole: role, changedBy: adminId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'User role updated successfully',
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to update user role',
      },
    });
  }
};

export const deactivateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
        error: {
          code: 'MISSING_ID',
          details: 'User ID parameter is missing',
        },
      });
      return;
    }
    const adminId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        isActive: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: 'The specified user does not exist',
        },
      });
      return;
    }

    if (!user.isActive) {
      res.status(400).json({
        success: false,
        message: 'User is already deactivated',
        error: {
          code: 'USER_ALREADY_INACTIVE',
          details: 'The user is already deactivated',
        },
      });
      return;
    }

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isActive: false },
    });

    // Invalidate all user sessions
    await prisma.session.deleteMany({
      where: { userId: parseInt(userId) },
    });

    // Audit log
    if (adminId) {
      await logAuditEvent({
        userId: adminId,
        action: AUDIT_ACTIONS.USER_DEACTIVATE,
        resource: AUDIT_RESOURCES.USER,
        resourceId: userId,
        details: { deactivatedBy: adminId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to deactivate user',
      },
    });
  }
};

export const reactivateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
        error: {
          code: 'MISSING_ID',
          details: 'User ID parameter is missing',
        },
      });
      return;
    }
    const adminId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        isActive: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: 'The specified user does not exist',
        },
      });
      return;
    }

    if (user.isActive) {
      res.status(400).json({
        success: false,
        message: 'User is already active',
        error: {
          code: 'USER_ALREADY_ACTIVE',
          details: 'The user is already active',
        },
      });
      return;
    }

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        isActive: true,
      },
    });

    // Audit log
    if (adminId) {
      await logAuditEvent({
        userId: adminId,
        action: AUDIT_ACTIONS.USER_REACTIVATE,
        resource: AUDIT_RESOURCES.USER,
        resourceId: userId,
        details: { reactivatedBy: adminId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }

    res.status(200).json({
      success: true,
      message: 'User reactivated successfully',
    });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to reactivate user',
      },
    });
  }
};