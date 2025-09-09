import { Request, Response } from 'express';
import { prisma } from '../../config';
import { validatePasswordStrength, hashPassword } from '../../utils/password';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';

/**
 * Reset password with token
 * Validates token and updates password
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Reset token is required',
        error: {
          code: 'MISSING_TOKEN',
          details: 'Password reset token must be provided',
        },
      });
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        error: {
          code: 'INVALID_PASSWORD',
          details: passwordValidation.errors,
        },
      });
      return;
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
        isActive: true,
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
        error: {
          code: 'INVALID_TOKEN',
          details: 'The reset token is invalid or has expired',
        },
      });
      return;
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        loginAttempts: 0, // Reset failed login attempts
        lockoutUntil: null, // Clear any lockout
      },
    });

    // Audit log
    await logAuditEvent({
      userId: user.id,
      action: AUDIT_ACTIONS.PASSWORD_RESET_SUCCESS,
      resource: AUDIT_RESOURCES.AUTH,
      resourceId: user.id.toString(),
      details: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to reset password',
      },
    });
  }
};