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
        loginAttempts: true,
        lockoutUntil: true,
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

    // Check if account is locked
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / (1000 * 60)); // minutes

      // Audit log account lockout attempt
      await logAuditEvent({
        userId: user.id,
        action: AUDIT_ACTIONS.ACCOUNT_LOCKOUT,
        resource: AUDIT_RESOURCES.AUTH,
        resourceId: user.id.toString(),
        details: { remainingTime },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(423).json({
        success: false,
        message: 'Account is temporarily locked',
        error: {
          code: 'ACCOUNT_LOCKED',
          details: `Account is locked due to too many failed login attempts. Try again in ${remainingTime} minutes.`,
        },
      });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      // Increment login attempts
      const newAttempts = user.loginAttempts + 1;
      const shouldLock = newAttempts >= 5; // Lock after 5 failed attempts
      const lockoutUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15 minutes lockout

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockoutUntil: lockoutUntil,
        },
      });

      // Audit log failed login attempt
      await logAuditEvent({
        userId: user.id,
        action: AUDIT_ACTIONS.FAILED_LOGIN_ATTEMPT,
        resource: AUDIT_RESOURCES.AUTH,
        resourceId: user.id.toString(),
        details: { attemptNumber: newAttempts, locked: shouldLock },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      if (shouldLock) {
        res.status(423).json({
          success: false,
          message: 'Account locked due to too many failed attempts',
          error: {
            code: 'ACCOUNT_LOCKED',
            details: 'Account has been locked for 15 minutes due to 5 consecutive failed login attempts.',
          },
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          error: {
            code: 'INVALID_CREDENTIALS',
            details: `Email or password is incorrect. ${5 - newAttempts} attempts remaining.`,
          },
        });
      }
      return;
    }

    // Reset login attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockoutUntil: null,
        lastLogin: new Date(),
      },
    });

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
        refreshToken: refreshToken,
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