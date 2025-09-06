import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';

export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Category ID is required',
        error: {
          code: 'MISSING_ID',
          details: 'Category ID parameter is missing',
        },
      });
      return;
    }
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category ID',
        error: {
          code: 'INVALID_ID',
          details: 'Category ID must be a number',
        },
      });
      return;
    }

    const {
      name,
      description,
      parentId,
      imageUrl,
      sortOrder,
      isActive,
    } = req.body;

    // Only admin can update categories
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only administrators can update categories',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'Admin role required',
        },
      });
      return;
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        isActive: true,
      },
    });

    if (!existingCategory) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
        error: {
          code: 'CATEGORY_NOT_FOUND',
          details: 'The requested category does not exist',
        },
      });
      return;
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name;

      // Update slug if name changed
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if new slug conflicts with existing categories (excluding current)
      const conflictingCategory = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: categoryId },
        },
        select: { id: true },
      });

      if (conflictingCategory) {
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

      updateData.slug = slug;
    }

    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle parentId changes
    if (parentId !== undefined) {
      if (parentId === null || parentId === categoryId) {
        // Setting as root category or self-reference (not allowed)
        if (parentId === categoryId) {
          res.status(400).json({
            success: false,
            message: 'Category cannot be its own parent',
            error: {
              code: 'INVALID_PARENT',
              details: 'A category cannot reference itself as parent',
            },
          });
          return;
        }
        updateData.parentId = parentId;
      } else {
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
              details: 'Cannot move categories under inactive parents',
            },
          });
          return;
        }

        updateData.parentId = parentId;
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
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
      action: AUDIT_ACTIONS.CATEGORY_UPDATED,
      resource: AUDIT_RESOURCES.CATEGORY,
      resourceId: categoryId.toString(),
      details: {
        changes: Object.keys(updateData),
        oldName: existingCategory.name,
        newName: updatedCategory.name,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to update category',
      },
    });
  }
};