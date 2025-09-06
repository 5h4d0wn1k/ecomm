import { Request, Response } from 'express';
import { prisma } from '../../config';
import { validatePasswordStrength, hashPassword, comparePassword } from '../../utils/password';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';
import { AuthenticatedRequest } from '../../middlewares';

/**
 * Change user password
 * Validates current password and updates to new password
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to change password',
        },
      });
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: 'New password does not meet requirements',
        error: {
          code: 'INVALID_PASSWORD',
          details: passwordValidation.errors,
        },
      });
      return;
    }

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
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
          details: 'User does not exist',
        },
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          details: 'The current password provided is incorrect',
        },
      });
      return;
    }

    // Check if new password is same as current password
    const isSamePassword = await comparePassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
        error: {
          code: 'SAME_PASSWORD',
          details: 'New password cannot be the same as the current password',
        },
      });
      return;
    }

    // Password history check removed - not supported in current schema

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    // Password history creation removed - not supported in current schema

    // Password history cleanup removed - not supported in current schema

    // Invalidate all existing sessions (force re-login)
    await prisma.session.deleteMany({
      where: { userId },
    });

    // Audit log
    await logAuditEvent({
      userId,
      action: AUDIT_ACTIONS.USER_PASSWORD_CHANGE,
      resource: AUDIT_RESOURCES.USER,
      resourceId: userId.toString(),
      details: { forced_logout: true },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to change password',
      },
    });
  }
};