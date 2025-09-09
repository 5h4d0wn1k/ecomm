import { Request, Response } from 'express';
import { prisma } from '../../config';
import { generateAccessToken, generateRefreshToken } from '../../config';
import { validatePasswordStrength, hashPassword } from '../../utils/password';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';

/**
 * Register a new vendor account
 * Creates both user and vendor records in a transaction
 */
export const vendorRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      businessName,
      businessDescription,
      businessAddress,
      businessPhone,
      taxId 
    } = req.body;

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

    // Create user and vendor in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          role: 'vendor',
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

      // Create vendor profile
      const vendor = await tx.vendor.create({
        data: {
          userId: user.id,
          businessName,
          businessDescription,
          businessAddress,
          businessPhone,
          taxId,
        },
        select: {
          id: true,
          businessName: true,
          businessDescription: true,
          businessAddress: true,
          isVerified: true,
          createdAt: true,
        },
      });

      return { user, vendor };
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: result.user.id,
      role: result.user.role,
      email: result.user.email,
    });

    const refreshToken = generateRefreshToken({ userId: result.user.id });

    // Create session
    await prisma.session.create({
      data: {
        userId: result.user.id,
        sessionToken: accessToken,
        refreshToken: refreshToken,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    // Audit log
    await logAuditEvent({
      userId: result.user.id,
      action: AUDIT_ACTIONS.VENDOR_REGISTER,
      resource: AUDIT_RESOURCES.VENDOR,
      resourceId: result.vendor.id.toString(),
      details: {
        businessName: result.vendor.businessName,
        isVerified: result.vendor.isVerified
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        vendor: result.vendor,
        token: accessToken,
        refreshToken,
      },
      message: 'Vendor registration submitted for approval',
    });
  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to register vendor',
      },
    });
  }
};