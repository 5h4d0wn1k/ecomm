import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';

/**
 * Get product reviews
 */
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const productId = parseInt(id || '0');
    if (isNaN(productId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        error: {
          code: 'INVALID_ID',
          details: 'Product ID must be a valid number',
        },
      });
      return;
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
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

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          productId,
          isApproved: true,
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.review.count({
        where: {
          productId,
          isApproved: true,
        },
      }),
    ]);

    // Calculate average rating
    const allReviews = await prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      select: { rating: true },
    });

    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    res.status(200).json({
      success: true,
      data: {
        product: {
          id: product.id,
          name: product.name,
        },
        reviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve reviews',
      },
    });
  }
};

/**
 * Create product review
 */
export const createProductReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to create reviews',
        },
      });
      return;
    }

    const productId = parseInt(id || '0');
    if (isNaN(productId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        error: {
          code: 'INVALID_ID',
          details: 'Product ID must be a valid number',
        },
      });
      return;
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
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

    // Check if user has purchased the product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: { in: ['delivered'] },
        },
      },
    });

    if (!hasPurchased) {
      res.status(403).json({
        success: false,
        message: 'Purchase required',
        error: {
          code: 'PURCHASE_REQUIRED',
          details: 'You can only review products you have purchased and received',
        },
      });
      return;
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId,
      },
    });

    if (existingReview) {
      res.status(400).json({
        success: false,
        message: 'Review already exists',
        error: {
          code: 'REVIEW_EXISTS',
          details: 'You have already reviewed this product',
        },
      });
      return;
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Invalid rating',
        error: {
          code: 'INVALID_RATING',
          details: 'Rating must be between 1 and 5',
        },
      });
      return;
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        title,
        comment,
        isApproved: true, // Auto-approve for now
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully',
    });
  } catch (error) {
    console.error('Create product review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to create review',
      },
    });
  }
};