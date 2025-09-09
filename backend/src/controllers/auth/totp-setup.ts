import { Request, Response } from 'express';
import { prisma } from '../../config';
import { TOTPService } from '../../services/totp.service';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';
import { AuthenticatedRequest } from '../../middlewares';

/**
 * Setup TOTP 2FA for user
 * Generates secret and QR code
 */
export const setupTOTP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to setup 2FA',
        },
      });
      return;
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        totpEnabled: true,
        totpSecret: true,
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

    if (user.totpEnabled) {
      res.status(400).json({
        success: false,
        message: '2FA already enabled',
        error: {
          code: 'TOTP_ALREADY_ENABLED',
          details: 'Two-factor authentication is already enabled for this account',
        },
      });
      return;
    }

    // Generate TOTP secret and QR code
    const totpData = await TOTPService.generateTOTPSecret(user.email);

    // Store temporary secret (not enabled yet)
    await prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: totpData.secret,
        totpBackupCodes: JSON.stringify(totpData.backupCodes),
      },
    });

    // Audit log
    await logAuditEvent({
      userId,
      action: AUDIT_ACTIONS.USER_TOTP_SETUP_INITIATED,
      resource: AUDIT_RESOURCES.AUTH,
      resourceId: userId.toString(),
      details: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
      success: true,
      data: {
        secret: totpData.secret,
        qrCodeUrl: totpData.qrCodeUrl,
        backupCodes: totpData.backupCodes,
      },
      message: 'TOTP setup initiated. Please verify with a token to complete setup.',
    });
  } catch (error) {
    console.error('TOTP setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to setup TOTP',
      },
    });
  }
};