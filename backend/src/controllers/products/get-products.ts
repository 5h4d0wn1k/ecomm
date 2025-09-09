import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';
import enhancedSearchService from '../../services/enhanced-search.service';
import { CacheService } from '../../services/cache.service';

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
      ratingMin,
      status,
      isActive,
      isFeatured,
      tags,
      inStock,
      sort = 'relevance',
      includeFacets = 'true',
    } = req.query;

    // Build filters object
    const filters: any = {};

    // Category filter
    if (category) {
      filters.category = Array.isArray(category) ? category : [category as string];
    }

    // Vendor filter
    if (vendor) {
      filters.vendor = Array.isArray(vendor) ? vendor : [vendor as string];
    }

    // Price range filter
    if (minPrice) filters.priceMin = parseFloat(minPrice as string);
    if (maxPrice) filters.priceMax = parseFloat(maxPrice as string);

    // Rating filter
    if (ratingMin) filters.ratingMin = parseFloat(ratingMin as string);

    // Status filter
    if (status) {
      filters.status = Array.isArray(status) ? status : [status as string];
    }

    // Active filter
    if (isActive !== undefined) {
      filters.status = isActive === 'true' ? ['active'] : ['inactive'];
    }

    // Featured filter
    if (isFeatured !== undefined) {
      filters.isFeatured = isFeatured === 'true';
    }

    // Tags filter
    if (tags) {
      filters.tags = Array.isArray(tags) ? tags : [tags as string];
    }

    // Stock filter
    if (inStock !== undefined) {
      filters.inStock = inStock === 'true';
    }

    // Only show active products for non-admin users
    const user = (req as AuthenticatedRequest).user;
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      filters.status = filters.status || ['active'];
    }

    // Use enhanced search service
    const searchResult = await enhancedSearchService.searchProducts({
      query: search as string,
      filters,
      sort: sort as string,
      page: Number(page),
      limit: Number(limit),
      includeFacets: includeFacets === 'true',
    });

    // Get additional product details from database for variants and other relations
    const productIds = searchResult.products.map(p => p.id);
    if (productIds.length > 0) {
      const productsWithDetails = await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
        include: {
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
          _count: {
            select: {
              reviews: true,
              wishlists: true,
              orderItems: true,
            },
          },
        },
      });

      // Merge Elasticsearch results with database details
      const productsMap = new Map(productsWithDetails.map(p => [p.id, p]));
      searchResult.products = searchResult.products.map(product => {
        const dbProduct = productsMap.get(product.id);
        return {
          ...product,
          variants: dbProduct?.variants || [],
          totalSold: dbProduct?._count?.orderItems || 0,
        };
      });
    }

    res.status(200).json({
      success: true,
      data: searchResult.products,
      facets: searchResult.facets,
      pagination: searchResult.pagination,
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

    // Try to get from cache first
    const cachedProduct = await CacheService.getCachedProduct(productId);
    if (cachedProduct) {
      res.status(200).json(cachedProduct);
      return;
    }

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
    if (product.status !== 'active' && (!user || (user.role !== 'admin' && user.role !== 'super_admin' && product.vendorId !== user.id))) {
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

    // Calculate average rating from the already fetched reviews (fixing N+1 query)
    const totalReviews = product.reviews?.length || 0;
    const averageRating = totalReviews > 0
      ? (product.reviews?.reduce((sum: number, review: any) => sum + review.rating, 0) || 0) / totalReviews
      : 0;

    // Get related products with caching
    const relatedProductsCacheKey = `related_products:${product.categoryId}:${productId}`;
    let relatedProducts = await CacheService.get(relatedProductsCacheKey);

    if (!relatedProducts) {
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          status: 'active',
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
      // Cache related products for 30 minutes
      await CacheService.set(relatedProductsCacheKey, relatedProducts, 1800);
    }

    const result = {
      success: true,
      data: {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        totalSold: product._count.orderItems,
        totalWishlisted: product._count.wishlists,
        relatedProducts,
      },
    };

    // Cache the product for 30 minutes
    await CacheService.cacheProduct(productId, result);

    res.status(200).json(result);
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