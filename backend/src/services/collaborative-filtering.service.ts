import { Client } from '@elastic/elasticsearch';
import { getElasticsearchClient, INDEXES, getRedisClient } from '../config';
import { prisma } from '../config';
import logger from '../middlewares/logger';

interface UserPreferences {
  categories: string[];
  vendors: string[];
  priceRange: { min: number; max: number };
  tags: string[];
  averageRating: number;
}

interface ProductSimilarity {
  productId: number;
  similarity: number;
  reason: string;
}

export class CollaborativeFilteringService {
  private client: Client;
  private redis: any;

  constructor() {
    this.client = getElasticsearchClient();
    this.redis = getRedisClient();
  }

  /**
   * Get advanced related products using collaborative filtering
   */
  async getRelatedProducts(productId: number, userId?: number, limit: number = 10): Promise<any[]> {
    try {
      const cacheKey = `related_products_cf:${productId}:${userId || 'anonymous'}:${limit}`;
      const cached = await this.redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      // Get the source product
      const sourceProduct = await this.getProductDetails(productId);
      if (!sourceProduct) {
        return [];
      }

      const relatedProducts = await this.findRelatedProducts(sourceProduct, userId, limit);

      // Cache for 1 hour
      await this.redis.setex(cacheKey, 3600, JSON.stringify(relatedProducts));

      return relatedProducts;
    } catch (error: any) {
      logger.error('Collaborative filtering failed', { error: error.message, productId, userId });
      return [];
    }
  }

  /**
   * Find related products using multiple strategies
   */
  private async findRelatedProducts(sourceProduct: any, userId?: number, limit: number): Promise<any[]> {
    const similarities: ProductSimilarity[] = [];

    // Strategy 1: Content-based similarity (category, tags, description)
    const contentSimilar = await this.getContentBasedSimilarities(sourceProduct, limit * 2);
    similarities.push(...contentSimilar);

    // Strategy 2: User behavior-based similarity (if user provided)
    if (userId) {
      const behaviorSimilar = await this.getBehaviorBasedSimilarities(sourceProduct, userId, limit * 2);
      similarities.push(...behaviorSimilar);
    }

    // Strategy 3: Collaborative filtering based on purchase patterns
    const collaborativeSimilar = await this.getCollaborativeSimilarities(sourceProduct, limit * 2);
    similarities.push(...collaborativeSimilar);

    // Strategy 4: Vendor-based similarity
    const vendorSimilar = await this.getVendorBasedSimilarities(sourceProduct, limit * 2);
    similarities.push(...vendorSimilar);

    // Remove duplicates and sort by similarity
    const uniqueSimilarities = this.deduplicateSimilarities(similarities);

    // Get top similar products
    const topSimilarities = uniqueSimilarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    // Fetch product details
    const productIds = topSimilarities.map(s => s.productId);
    if (productIds.length === 0) return [];

    const products = await this.getProductDetailsBatch(productIds);

    // Merge similarity reasons
    return products.map(product => {
      const similarity = topSimilarities.find(s => s.productId === product.id);
      return {
        ...product,
        recommendationReason: similarity?.reason || 'Similar product',
        similarityScore: similarity?.similarity || 0,
      };
    });
  }

  /**
   * Get content-based similarities
   */
  private async getContentBasedSimilarities(sourceProduct: any, limit: number): Promise<ProductSimilarity[]> {
    try {
      const response = await this.client.search({
        index: INDEXES.PRODUCTS,
        body: {
          query: {
            bool: {
              must: [
                {
                  more_like_this: {
                    fields: ['name', 'description', 'shortDescription', 'tags'],
                    like: [
                      {
                        _index: INDEXES.PRODUCTS,
                        _id: sourceProduct.id.toString(),
                      },
                    ],
                    min_term_freq: 1,
                    max_query_terms: 12,
                  },
                },
              ],
              must_not: [
                {
                  term: { id: sourceProduct.id },
                },
              ],
              filter: [
                { term: { status: 'active' } },
              ],
            },
          },
          size: limit,
          _source: ['id'],
        },
      });

      return response.hits.hits.map((hit: any) => ({
        productId: parseInt(hit._id),
        similarity: hit._score || 0.5,
        reason: 'Similar content and description',
      }));
    } catch (error) {
      logger.error('Content-based similarity failed', { error: (error as Error).message });
      return [];
    }
  }

  /**
   * Get behavior-based similarities for authenticated users
   */
  private async getBehaviorBasedSimilarities(sourceProduct: any, userId: number, limit: number): Promise<ProductSimilarity[]> {
    try {
      // Get user's recently viewed/purchased products
      const userInteractions = await prisma.orderItem.findMany({
        where: {
          order: {
            userId,
            status: { in: ['delivered', 'shipped'] },
          },
        },
        select: {
          productId: true,
          quantity: true,
        },
        take: 20,
        orderBy: {
          order: {
            createdAt: 'desc',
          },
        },
      });

      const interactedProductIds = userInteractions.map(item => item.productId);

      if (interactedProductIds.length === 0) return [];

      // Find products similar to user's interaction history
      const response = await this.client.search({
        index: INDEXES.PRODUCTS,
        body: {
          query: {
            bool: {
              should: [
                {
                  terms: {
                    categoryId: [sourceProduct.categoryId],
                    boost: 2,
                  },
                },
                {
                  terms: {
                    vendorId: [sourceProduct.vendorId],
                    boost: 1.5,
                  },
                },
                {
                  range: {
                    price: {
                      gte: Math.max(0, sourceProduct.price - 50),
                      lte: sourceProduct.price + 50,
                    },
                  },
                },
              ],
              must_not: [
                { term: { id: sourceProduct.id } },
                { terms: { id: interactedProductIds } }, // Exclude already interacted products
              ],
              filter: [
                { term: { status: 'active' } },
              ],
              minimum_should_match: 1,
            },
          },
          size: limit,
          _source: ['id'],
        },
      });

      return response.hits.hits.map((hit: any) => ({
        productId: parseInt(hit._id),
        similarity: (hit._score || 0.3) * 1.2, // Boost behavior-based recommendations
        reason: 'Based on your shopping preferences',
      }));
    } catch (error) {
      logger.error('Behavior-based similarity failed', { error: (error as Error).message });
      return [];
    }
  }

  /**
   * Get collaborative filtering similarities based on purchase patterns
   */
  private async getCollaborativeSimilarities(sourceProduct: any, limit: number): Promise<ProductSimilarity[]> {
    try {
      // Find users who bought the source product
      const sourceProductBuyers = await prisma.orderItem.findMany({
        where: {
          productId: sourceProduct.id,
          order: {
            status: { in: ['delivered', 'shipped'] },
          },
        },
        select: {
          order: {
            select: {
              userId: true,
            },
          },
        },
        take: 100, // Limit to avoid performance issues
      });

      const buyerIds = [...new Set(sourceProductBuyers.map(item => item.order.userId))];

      if (buyerIds.length === 0) return [];

      // Find other products bought by these users
      const otherPurchases = await prisma.orderItem.findMany({
        where: {
          order: {
            userId: { in: buyerIds },
            status: { in: ['delivered', 'shipped'] },
          },
          productId: { not: sourceProduct.id },
        },
        select: {
          productId: true,
          order: {
            select: {
              userId: true,
            },
          },
        },
        take: 500,
      });

      // Count product frequencies
      const productFrequency: { [key: number]: number } = {};
      otherPurchases.forEach(purchase => {
        productFrequency[purchase.productId] = (productFrequency[purchase.productId] || 0) + 1;
      });

      // Sort by frequency and get top products
      const topProductIds = Object.entries(productFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([productId]) => parseInt(productId));

      return topProductIds.map(productId => ({
        productId,
        similarity: productFrequency[productId] / buyerIds.length, // Normalize by number of buyers
        reason: 'Customers who bought this also bought',
      }));
    } catch (error) {
      logger.error('Collaborative similarity failed', { error: (error as Error).message });
      return [];
    }
  }

  /**
   * Get vendor-based similarities
   */
  private async getVendorBasedSimilarities(sourceProduct: any, limit: number): Promise<ProductSimilarity[]> {
    try {
      const response = await this.client.search({
        index: INDEXES.PRODUCTS,
        body: {
          query: {
            bool: {
              must: [
                {
                  term: {
                    vendorId: sourceProduct.vendorId,
                  },
                },
              ],
              must_not: [
                {
                  term: { id: sourceProduct.id },
                },
              ],
              filter: [
                { term: { status: 'active' } },
              ],
            },
          },
          size: limit,
          sort: [
            { totalSold: 'desc' },
            { averageRating: 'desc' },
          ],
          _source: ['id'],
        },
      });

      return response.hits.hits.map((hit: any) => ({
        productId: parseInt(hit._id),
        similarity: 0.4, // Fixed similarity for vendor-based
        reason: 'From the same vendor',
      }));
    } catch (error) {
      logger.error('Vendor-based similarity failed', { error: (error as Error).message });
      return [];
    }
  }

  /**
   * Remove duplicate similarities, keeping the highest similarity score
   */
  private deduplicateSimilarities(similarities: ProductSimilarity[]): ProductSimilarity[] {
    const similarityMap = new Map<number, ProductSimilarity>();

    similarities.forEach(similarity => {
      const existing = similarityMap.get(similarity.productId);
      if (!existing || similarity.similarity > existing.similarity) {
        similarityMap.set(similarity.productId, similarity);
      }
    });

    return Array.from(similarityMap.values());
  }

  /**
   * Get product details by ID
   */
  private async getProductDetails(productId: number): Promise<any> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
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
              reviews: true,
              wishlists: true,
              orderItems: true,
            },
          },
        },
      });

      if (!product) return null;

      const totalReviews = product.reviews?.length || 0;
      const averageRating = totalReviews > 0
        ? (product.reviews?.reduce((sum, review) => sum + review.rating, 0) || 0) / totalReviews
        : 0;

      return {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price.toString()),
        compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice.toString()) : null,
        images: product.images ? JSON.parse(product.images) : [],
        categoryId: product.categoryId,
        vendorId: product.vendorId,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        totalWishlisted: product._count?.wishlists || 0,
        totalSold: product._count?.orderItems || 0,
      };
    } catch (error) {
      logger.error('Failed to get product details', { error: (error as Error).message, productId });
      return null;
    }
  }

  /**
   * Get product details for multiple products
   */
  private async getProductDetailsBatch(productIds: number[]): Promise<any[]> {
    try {
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          status: 'active',
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
              reviews: true,
              wishlists: true,
              orderItems: true,
            },
          },
        },
      });

      return products.map(product => {
        const totalReviews = product.reviews?.length || 0;
        const averageRating = totalReviews > 0
          ? (product.reviews?.reduce((sum, review) => sum + review.rating, 0) || 0) / totalReviews
          : 0;

        let images: string[] = [];
        try {
          images = product.images ? JSON.parse(product.images) : [];
        } catch (error) {
          logger.warn(`Failed to parse images for product ${product.id}`);
        }

        return {
          id: product.id,
          name: product.name,
          price: parseFloat(product.price.toString()),
          compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice.toString()) : null,
          images,
          categoryId: product.categoryId,
          vendorId: product.vendorId,
          categoryName: product.category?.name,
          vendorName: product.vendor?.businessName,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
          totalWishlisted: product._count?.wishlists || 0,
          totalSold: product._count?.orderItems || 0,
        };
      });
    } catch (error) {
      logger.error('Failed to get product details batch', { error: (error as Error).message });
      return [];
    }
  }
}

export default new CollaborativeFilteringService();