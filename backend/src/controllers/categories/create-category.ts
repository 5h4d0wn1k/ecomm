import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';

export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      parentId,
      imageUrl,
      sortOrder,
    } = req.body;

    // Only admin can create categories
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only administrators can create categories',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'Admin role required',
        },
      });
      return;
    }

    // Validate parent category if provided
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
        select: { id: true, isActive: true },
      });

      if (!parentCategory) {
        res.status(404).json({
          success: false,
          message: 'Parent category not found',
          error: {
            code: 'PARENT_CATEGORY_NOT_FOUND',
            details: 'The specified parent category does not exist',
          },
        });
        return;
      }

      if (!parentCategory.isActive) {
        res.status(400).json({
          success: false,
          message: 'Parent category is not active',
          error: {
            code: 'PARENT_CATEGORY_INACTIVE',
            details: 'Cannot create subcategories under inactive categories',
          },
        });
        return;
      }
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug is unique
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingCategory) {
      res.status(409).json({
        success: false,
        message: 'Category slug already exists',
        error: {
          code: 'SLUG_EXISTS',
          details: 'Please choose a different category name',
        },
      });
      return;
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        parentId,
        imageUrl,
        sortOrder: sortOrder || 0,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    // Audit log
    await logAuditEvent({
      userId: req.user.id,
      action: AUDIT_ACTIONS.CATEGORY_CREATED,
      resource: AUDIT_RESOURCES.CATEGORY,
      resourceId: category.id.toString(),
      details: { name: category.name, parentId: category.parentId },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to create category',
      },
    });
  }
};