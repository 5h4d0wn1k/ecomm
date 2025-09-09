import { Request, Response } from 'express';
import { prisma } from '../config';
import { AuthenticatedRequest } from '../middlewares';

/**
 * Get personalized product recommendations for a user
 */
export const getPersonalizedRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { limit = 10, type = 'mixed' } = req.query;

    if (!user) {
      // For non-authenticated users, return trending products
      return getTrendingRecommendations(req, res);
    }

    const limitNum = Math.min(Number(limit), 20); // Max 20 recommendations

    let recommendations: any[] = [];

    switch (type) {
      case 'similar':
        recommendations = await getSimilarProducts(user.id, limitNum);
        break;
      case 'trending':
        recommendations = await getTrendingProducts(limitNum);
        break;
      case 'category':
        recommendations = await getCategoryBasedRecommendations(user.id, limitNum);
        break;
      case 'mixed':
      default:
        recommendations = await getMixedRecommendations(user.id, limitNum);
        break;
    }

    res.status(200).json({
      success: true,
      data: recommendations,
      type,
    });
  } catch (error) {
    console.error('Personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to fetch personalized recommendations',
      },
    });
  }
};

/**
 * Get trending products (popular products)
 */
export const getTrendingRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = Math.min(Number(limit), 20);

    const trendingProducts = await prisma.product.findMany({
      where: {
        status: "active",
        isFeatured: true,
      },
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
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            wishlists: true,
            orderItems: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
      take: limitNum,
    });

    const productsWithRatings = trendingProducts.map(product => {
      const totalRatings = product.reviews?.length || 0;
      const averageRating = totalRatings > 0
        ? (product.reviews?.reduce((sum, review) => sum + review.rating, 0) || 0) / totalRatings
        : 0;

      return {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: totalRatings,
        recommendationReason: 'Trending now',
      };
    });

    res.status(200).json({
      success: true,
      data: productsWithRatings,
      type: 'trending',
    });
  } catch (error) {
    console.error('Trending recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to fetch trending recommendations',
      },
    });
  }
};

/**
 * Get similar products based on user's purchase/view history
 */
const getSimilarProducts = async (userId: number, limit: number) => {
  // Get user's recently viewed/purchased categories
  const userOrders = await prisma.order.findMany({
    where: {
      userId,
      status: { in: ['delivered', 'shipped'] },
    },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  const categoryIds = [...new Set(
    userOrders.flatMap(order =>
      order.orderItems.map(item => item.product.categoryId)
    )
  )];

  if (categoryIds.length === 0) {
    return getTrendingProducts(limit);
  }

  const similarProducts = await prisma.product.findMany({
    where: {
      status: "active",
      categoryId: { in: categoryIds },
    },
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
      reviews: {
        select: {
          rating: true,
        },
      },
      _count: {
        select: {
          wishlists: true,
        },
      },
    },
    orderBy: [
      { createdAt: 'desc' },
    ],
    take: limit,
  });

  return similarProducts.map(product => {
    const totalRatings = product.reviews?.length || 0;
    const averageRating = totalRatings > 0
      ? (product.reviews?.reduce((sum, review) => sum + review.rating, 0) || 0) / totalRatings
      : 0;

    return {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: totalRatings,
      recommendationReason: 'Similar to your interests',
    };
  });
};

/**
 * Get trending products
 */
const getTrendingProducts = async (limit: number) => {
  const trendingProducts = await prisma.product.findMany({
    where: {
      status: "active",
    },
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
      reviews: {
        select: {
          rating: true,
        },
      },
      _count: {
        select: {
          wishlists: true,
          orderItems: true,
        },
      },
    },
    orderBy: [
      { createdAt: 'desc' },
    ],
    take: limit,
  });

  return trendingProducts.map(product => {
    const totalRatings = product.reviews?.length || 0;
    const averageRating = totalRatings > 0
      ? (product.reviews?.reduce((sum, review) => sum + review.rating, 0) || 0) / totalRatings
      : 0;

    return {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: totalRatings,
      recommendationReason: 'Popular choice',
    };
  });
};

/**
 * Get category-based recommendations
 */
const getCategoryBasedRecommendations = async (userId: number, limit: number) => {
  // Get user's most purchased categories
  const categoryStats = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      order: {
        userId,
        status: { in: ['delivered', 'shipped'] },
      },
    },
    _count: {
      productId: true,
    },
  });

  const productIds = categoryStats.map(stat => stat.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
    select: {
      categoryId: true,
    },
  });

  const categoryIds = [...new Set(products.map(p => p.categoryId))];

  if (categoryIds.length === 0) {
    return getTrendingProducts(limit);
  }

  const recommendations = await prisma.product.findMany({
    where: {
      status: "active",
      categoryId: { in: categoryIds },
      id: { notIn: productIds }, // Exclude already purchased products
    },
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
      reviews: {
        select: {
          rating: true,
        },
      },
      _count: {
        select: {
          wishlists: true,
        },
      },
    },
    orderBy: [
      { createdAt: 'desc' },
    ],
    take: limit,
  });

  return recommendations.map(product => {
    const totalRatings = product.reviews?.length || 0;
    const averageRating = totalRatings > 0
      ? (product.reviews?.reduce((sum, review) => sum + review.rating, 0) || 0) / totalRatings
      : 0;

    return {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: totalRatings,
      recommendationReason: 'Based on your preferences',
    };
  });
};

/**
 * Get mixed recommendations combining different strategies
 */
const getMixedRecommendations = async (userId: number, limit: number) => {
  const recommendationsPerType = Math.ceil(limit / 3);

  const [similar, trending, categoryBased] = await Promise.all([
    getSimilarProducts(userId, recommendationsPerType),
    getTrendingProducts(recommendationsPerType),
    getCategoryBasedRecommendations(userId, recommendationsPerType),
  ]);

  // Combine and deduplicate
  const allRecommendations = [...similar, ...trending, ...categoryBased];
  const seen = new Set();
  const uniqueRecommendations = allRecommendations.filter(product => {
    if (seen.has(product.id)) {
      return false;
    }
    seen.add(product.id);
    return true;
  });

  return uniqueRecommendations.slice(0, limit);
};