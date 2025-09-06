import { Request, Response } from 'express';
import { prisma } from '../../config';
import { generateAccessToken, generateRefreshToken } from '../../config';
import { comparePassword } from '../../utils/password';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: {
          code: 'INVALID_CREDENTIALS',
          details: 'Email or password is incorrect',
        },
      });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      // Audit log failed login attempt
      await logAuditEvent({
        userId: user.id,
        action: AUDIT_ACTIONS.FAILED_LOGIN_ATTEMPT,
        resource: AUDIT_RESOURCES.AUTH,
        resourceId: user.id.toString(),
        details: {},
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: {
          code: 'INVALID_CREDENTIALS',
          details: 'Email or password is incorrect',
        },
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({ userId: user.id });

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: accessToken,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    // Audit log successful login
    await logAuditEvent({
      userId: user.id,
      action: AUDIT_ACTIONS.USER_LOGIN,
      resource: AUDIT_RESOURCES.AUTH,
      resourceId: user.id.toString(),
      details: { role: user.role },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Remove password hash from response
    const { passwordHash, ...userResponse } = user;

    res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        token: accessToken,
        refreshToken,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to authenticate user',
      },
    });
  }
};