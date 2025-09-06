import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';

/**
 * Get products with filtering, search, and pagination
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      vendor,
      minPrice,
      maxPrice,
      status,
      isActive,
      isFeatured,
      sort = 'created_desc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { shortDescription: { contains: search as string, mode: 'insensitive' } },
        { tags: { has: search as string } },
      ];
    }

    // Category filter
    if (category) {
      where.categoryId = parseInt(category as string);
    }

    // Vendor filter
    if (vendor) {
      where.vendorId = parseInt(vendor as string);
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Active filter
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Featured filter
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === 'true';
    }

    // Only show active products for non-admin users
    const user = (req as AuthenticatedRequest).user;
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      where.isActive = true;
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'created_asc':
        orderBy = { createdAt: 'asc' };
        break;
      case 'rating_desc':
        orderBy = [
          { reviews: { _count: 'desc' } },
          { createdAt: 'desc' },
        ];
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              isVerified: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              value: true,
              priceModifier: true,
              stockQuantity: true,
            },
          },
          reviews: {
            select: {
              
            },
          },
          _count: {
            select: {
              reviews: true,
              wishlists: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average rating for each product
    const productsWithRatings = products.map(product => {
      const totalRatings = product.reviews?.length || 0;
      const averageRating = totalRatings > 0
        ? (product.reviews?.reduce((sum: number, review: any) => sum + review.rating, 0) || 0) / totalRatings
        : 0;

      const { reviews, ...productData } = product;
      return {
        ...productData,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: totalRatings,
        totalWishlisted: product._count?.wishlists || 0,
      };
    });

    res.status(200).json({
      success: true,
      data: productsWithRatings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve products',
      },
    });
  }
};

/**
 * Get single product by ID
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Product ID is required',
        error: {
          code: 'MISSING_ID',
          details: 'Product ID parameter is missing',
        },
      });
      return;
    }
    const productId = parseInt(id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessDescription: true,
            isVerified: true,
            
            
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            value: true,
            skuSuffix: true,
            priceModifier: true,
            stockQuantity: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
            wishlists: true,
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
        error: {
          code: 'PRODUCT_NOT_FOUND',
          details: 'The requested product does not exist',
        },
      });
      return;
    }

    // Check if product is accessible
    const user = (req as AuthenticatedRequest).user;
    if (!product.isActive && (!user || (user.role !== 'admin' && user.role !== 'super_admin' && product.vendorId !== user.id))) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
        error: {
          code: 'PRODUCT_NOT_FOUND',
          details: 'The requested product is not available',
        },
      });
      return;
    }

    // Calculate average rating
    const reviews = await prisma.review.findMany({
      where: {
        productId: product.id,
        isApproved: true,
      },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    // Get related products
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
        
      },
      take: 6,
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        vendor: {
          select: {
            businessName: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        totalSold: product._count.orderItems,
        totalWishlisted: product._count.wishlists,
        relatedProducts,
      },
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve product',
      },
    });
  }
};