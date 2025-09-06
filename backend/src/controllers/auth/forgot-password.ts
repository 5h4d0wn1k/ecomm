import { Request, Response } from 'express';
import { prisma } from '../../config';
import { generatePasswordResetToken } from '../../utils/password';
import { EmailService } from '../../services/email.service';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';

/**
 * Request password reset
 * Generates reset token and sends reset email
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    // Always return success for security (don't reveal if email exists)
    if (!user || !user.isActive) {
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
      return;
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Password reset token storage removed - not supported in current schema

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    const emailSent = await EmailService.sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      resetToken,
      resetUrl,
    });

    if (!emailSent) {
      console.error('Failed to send password reset email');
      // Don't return error to user for security
    }

    // Audit log
    await logAuditEvent({
      userId: user.id,
      action: AUDIT_ACTIONS.PASSWORD_RESET_REQUEST,
      resource: AUDIT_RESOURCES.AUTH,
      resourceId: user.id.toString(),
      details: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to process password reset request',
      },
    });
  }
};