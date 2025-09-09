import { Request, Response } from 'express';
import { prisma } from '../../config';
import { generateAccessToken, verifyRefreshToken } from '../../config';

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        error: {
          code: 'MISSING_TOKEN',
          details: 'Refresh token must be provided',
        },
      });
      return;
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        error: {
          code: 'INVALID_TOKEN',
          details: 'Refresh token is invalid or expired',
        },
      });
      return;
    }

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        lockoutUntil: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: 'User associated with token does not exist',
        },
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated',
        error: {
          code: 'ACCOUNT_INACTIVE',
          details: 'User account is not active',
        },
      });
      return;
    }

    // Check if account is locked
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      res.status(423).json({
        success: false,
        message: 'Account is temporarily locked',
        error: {
          code: 'ACCOUNT_LOCKED',
          details: 'Cannot refresh token for locked account',
        },
      });
      return;
    }

    // Verify refresh token exists in sessions
    const session = await prisma.session.findFirst({
      where: {
        userId: user.id,
        refreshToken: refreshToken,
      },
    });

    if (!session) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          details: 'Refresh token not found in active sessions',
        },
      });
      return;
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    // Update session with new tokens
    await prisma.session.updateMany({
      where: {
        userId: user.id,
        refreshToken: refreshToken,
      },
      data: {
        sessionToken: newAccessToken,
        refreshToken: refreshToken, // Keep same refresh token
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    res.status(200).json({
      success: true,
      data: {
        token: newAccessToken,
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to refresh token',
      },
    });
  }
};