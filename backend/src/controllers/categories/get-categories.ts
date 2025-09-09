import { Request, Response } from 'express';
import { prisma } from '../../config';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 50,
      parentId,
      includeInactive = 'false',
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    const includeInactiveBool = includeInactive === 'true';

    // Build where clause
    const where: any = {};

    if (parentId !== undefined) {
      if (parentId === 'null' || parentId === '') {
        where.parentId = null; // Root categories
      } else {
        where.parentId = parseInt(parentId as string, 10);
      }
    }

    if (!includeInactiveBool) {
      where.isActive = true;
    }

    // Build order by
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder === 'asc' ? 'asc' : 'desc';

    // Get categories with pagination
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          children: {
            where: includeInactiveBool ? {} : { isActive: true },
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
              sortOrder: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.category.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        categories,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
      message: 'Categories retrieved successfully',
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve categories',
      },
    });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
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

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        children: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            isActive: true,
            sortOrder: true,
            _count: {
              select: { products: { where: { status: 'active' } } },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          where: { status: 'active' },
          select: {
            id: true,
            name: true,
            price: true,
            compareAtPrice: true,
            images: true,
            isFeatured: true,
            vendor: {
              select: {
                id: true,
                businessName: true,
              },
            },
            _count: {
              select: { reviews: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            products: { where: { status: 'active' } },
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

    res.status(200).json({
      success: true,
      data: category,
      message: 'Category retrieved successfully',
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve category',
      },
    });
  }
};

export const getCategoryTree = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all active categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        parentId: true,
        sortOrder: true,
        _count: {
          select: { products: { where: { status: 'active' } } },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Build hierarchical tree structure
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create category objects
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    });

    // Second pass: build hierarchy
    categories.forEach(category => {
      const categoryObj = categoryMap.get(category.id);

      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryObj);
        }
      } else {
        rootCategories.push(categoryObj);
      }
    });

    res.status(200).json({
      success: true,
      data: rootCategories,
      message: 'Category tree retrieved successfully',
    });
  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve category tree',
      },
    });
  }
};