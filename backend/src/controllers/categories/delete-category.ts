import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';

export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Only admin can delete categories
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only administrators can delete categories',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'Admin role required',
        },
      });
      return;
    }

    // Check if category exists and get related data
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        children: {
          select: { id: true, name: true },
        },
        products: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });

    if (!category) {
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

    // Check if category has children
    if (category.children.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Cannot delete category with subcategories',
        error: {
          code: 'HAS_CHILDREN',
          details: `Category has ${category.children.length} subcategories. Move or delete them first.`,
        },
      });
      return;
    }

    // Check if category has products
    if (category.products.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Cannot delete category with products',
        error: {
          code: 'HAS_PRODUCTS',
          details: `Category has ${category.products.length} products. Move them to another category first.`,
        },
      });
      return;
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId },
    });

    // Audit log
    await logAuditEvent({
      userId: req.user.id,
      action: AUDIT_ACTIONS.CATEGORY_DELETED,
      resource: AUDIT_RESOURCES.CATEGORY,
      resourceId: categoryId.toString(),
      details: {
        categoryName: category.name,
        hadChildren: category.children.length,
        hadProducts: category.products.length,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to delete category',
      },
    });
  }
};