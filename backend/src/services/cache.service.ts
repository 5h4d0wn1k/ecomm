import { getRedisClient } from '../config/redis';
import logger from '../middlewares/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string;
}

export class CacheService {
  private static redis = getRedisClient();
  private static readonly DEFAULT_TTL = 300; // 5 minutes
  private static readonly PRODUCT_CACHE_PREFIX = 'product:';
  private static readonly CATEGORY_CACHE_PREFIX = 'category:';
  private static readonly SEARCH_CACHE_PREFIX = 'search:';

  /**
   * Get cached data
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (data) {
        logger.debug(`Cache hit for key: ${key}`);
        return JSON.parse(data);
      }
      logger.debug(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data
   */
  static async set(key: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      await this.redis.setEx(key, ttl, JSON.stringify(data));
      logger.debug(`Cache set for key: ${key} with TTL: ${ttl}s`);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached data
   */
  static async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  static async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
        logger.debug(`Cache deleted ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error('Cache delete by pattern error:', error);
    }
  }

  /**
   * Clear all cache
   */
  static async clear(): Promise<void> {
    try {
      await this.redis.flushAll();
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }

  /**
   * Generate cache key for products list
   */
  static generateProductsKey(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    vendor?: string;
    minPrice?: string;
    maxPrice?: string;
    status?: string;
    sort?: string;
    userRole?: string;
  }): string {
    const keyParts = [
      this.PRODUCT_CACHE_PREFIX,
      `page:${params.page || 1}`,
      `limit:${params.limit || 20}`,
      `search:${params.search || ''}`,
      `category:${params.category || ''}`,
      `vendor:${params.vendor || ''}`,
      `minPrice:${params.minPrice || ''}`,
      `maxPrice:${params.maxPrice || ''}`,
      `status:${params.status || ''}`,
      `sort:${params.sort || 'created_desc'}`,
      `userRole:${params.userRole || 'customer'}`
    ];
    return keyParts.join('|');
  }

  /**
   * Generate cache key for single product
   */
  static generateProductKey(productId: number): string {
    return `${this.PRODUCT_CACHE_PREFIX}single:${productId}`;
  }

  /**
   * Generate cache key for categories
   */
  static generateCategoriesKey(): string {
    return `${this.CATEGORY_CACHE_PREFIX}all`;
  }

  /**
   * Generate cache key for search suggestions
   */
  static generateSearchSuggestionsKey(query: string): string {
    return `${this.SEARCH_CACHE_PREFIX}suggestions:${query}`;
  }

  /**
   * Cache products list with automatic invalidation
   */
  static async cacheProducts(
    key: string,
    products: any,
    options: CacheOptions = {}
  ): Promise<void> {
    await this.set(key, products, options.ttl || 600); // 10 minutes for products
  }

  /**
   * Cache single product
   */
  static async cacheProduct(
    productId: number,
    product: any,
    options: CacheOptions = {}
  ): Promise<void> {
    const key = this.generateProductKey(productId);
    await this.set(key, product, options.ttl || 1800); // 30 minutes for single product
  }

  /**
   * Invalidate product cache
   */
  static async invalidateProductCache(productId?: number): Promise<void> {
    if (productId) {
      // Invalidate specific product
      await this.del(this.generateProductKey(productId));
    }

    // Invalidate products list cache (all variations)
    await this.delByPattern(`${this.PRODUCT_CACHE_PREFIX}page:*`);
  }

  /**
   * Invalidate category cache
   */
  static async invalidateCategoryCache(): Promise<void> {
    await this.delByPattern(`${this.CATEGORY_CACHE_PREFIX}*`);
  }

  /**
   * Invalidate search cache
   */
  static async invalidateSearchCache(): Promise<void> {
    await this.delByPattern(`${this.SEARCH_CACHE_PREFIX}*`);
  }

  /**
   * Get cached products
   */
  static async getCachedProducts(key: string): Promise<any> {
    return this.get(key);
  }

  /**
   * Get cached product
   */
  static async getCachedProduct(productId: number): Promise<any> {
    const key = this.generateProductKey(productId);
    return this.get(key);
  }

  /**
   * Get cached categories
   */
  static async getCachedCategories(): Promise<any> {
    const key = this.generateCategoriesKey();
    return this.get(key);
  }

  /**
   * Cache categories
   */
  static async cacheCategories(categories: any): Promise<void> {
    const key = this.generateCategoriesKey();
    await this.set(key, categories, 3600); // 1 hour for categories
  }

  /**
   * Get cached search suggestions
   */
  static async getCachedSearchSuggestions(query: string): Promise<any> {
    const key = this.generateSearchSuggestionsKey(query);
    return this.get(key);
  }

  /**
   * Cache search suggestions
   */
  static async cacheSearchSuggestions(query: string, suggestions: any): Promise<void> {
    const key = this.generateSearchSuggestionsKey(query);
    await this.set(key, suggestions, 1800); // 30 minutes for search suggestions
  }
}

export default CacheService;