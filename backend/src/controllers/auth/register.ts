import { Request, Response } from 'express';
import { prisma } from '../../config';
import { generateAccessToken, generateRefreshToken } from '../../config';
import { validatePasswordStrength, hashPassword } from '../../utils/password';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role = 'customer' } = req.body;

    // Validate password strength
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists',
        error: {
          code: 'USER_EXISTS',
          details: 'A user with this email already exists',
        },
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
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

    // Audit log
    await logAuditEvent({
      userId: user.id,
      action: AUDIT_ACTIONS.USER_REGISTER,
      resource: AUDIT_RESOURCES.USER,
      resourceId: user.id.toString(),
      details: { role: user.role },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(201).json({
      success: true,
      data: {
        user,
        token: accessToken,
        refreshToken,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to register user',
      },
    });
  }
};