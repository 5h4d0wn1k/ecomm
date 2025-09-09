import { Client } from '@elastic/elasticsearch';
import { getElasticsearchClient, INDEXES, getRedisClient } from '../config';
import logger from '../middlewares/logger';

interface SearchFilters {
  category?: string[];
  vendor?: string[];
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  status?: string[];
  isFeatured?: boolean;
  tags?: string[];
  inStock?: boolean;
}

interface SearchOptions {
  query?: string;
  filters?: SearchFilters;
  sort?: string;
  page?: number;
  limit?: number;
  includeFacets?: boolean;
}

interface SearchResult {
  products: any[];
  total: number;
  facets?: {
    categories: Array<{ key: string; count: number }>;
    vendors: Array<{ key: string; count: number }>;
    priceRanges: Array<{ key: string; count: number }>;
    ratings: Array<{ key: string; count: number }>;
    tags: Array<{ key: string; count: number }>;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class EnhancedSearchService {
  private client: Client;
  private redis: any;

  constructor() {
    this.client = getElasticsearchClient();
    this.redis = getRedisClient();
  }

  /**
   * Perform enhanced product search with Elasticsearch
   */
  async searchProducts(options: SearchOptions): Promise<SearchResult> {
    try {
      const {
        query = '',
        filters = {},
        sort = 'relevance',
        page = 1,
        limit = 20,
        includeFacets = true,
      } = options;

      const cacheKey = this.generateCacheKey('products', options);
      const cachedResult = await this.getCachedResult(cacheKey);

      if (cachedResult) {
        logger.debug('Returning cached search result', { cacheKey });
        return cachedResult;
      }

      // Build Elasticsearch query
      const esQuery = this.buildSearchQuery(query, filters);
      const sortOptions = this.buildSortOptions(sort);

      // Execute search
      const searchResponse = await this.client.search({
        index: INDEXES.PRODUCTS,
        body: {
          query: esQuery,
          sort: sortOptions,
          from: (page - 1) * limit,
          size: limit,
          track_total_hits: true,
        },
      });

      const products = searchResponse.hits.hits.map((hit: any) => ({
        ...hit._source,
        _score: hit._score,
      }));

      const total = typeof searchResponse.hits.total === 'object'
        ? searchResponse.hits.total.value
        : searchResponse.hits.total;

      let facets;
      if (includeFacets) {
        facets = await this.getFacets(query, filters);
      }

      const result: SearchResult = {
        products,
        total,
        facets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };

      // Cache the result
      await this.cacheResult(cacheKey, result);

      return result;
    } catch (error: any) {
      logger.error('Enhanced product search failed', { error: error.message, options });
      throw error;
    }
  }

  /**
   * Build Elasticsearch query from search parameters
   */
  private buildSearchQuery(query: string, filters: SearchFilters): any {
    const must: any[] = [];
    const filter: any[] = [];

    // Text search
    if (query.trim()) {
      must.push({
        multi_match: {
          query: query.trim(),
          fields: [
            'name^3',           // Boost product name
            'name.autocomplete^2',
            'description^1.5',
            'shortDescription^1.5',
            'categoryName^2',
            'vendorName^2',
            'tags^1',
            'sku',
          ],
          type: 'best_fields',
          fuzziness: 'AUTO',
          operator: 'or',
        },
      });
    }

    // Apply filters
    if (filters.category?.length) {
      filter.push({
        terms: {
          categoryId: filters.category.map(id => parseInt(id)),
        },
      });
    }

    if (filters.vendor?.length) {
      filter.push({
        terms: {
          vendorId: filters.vendor.map(id => parseInt(id)),
        },
      });
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const priceRange: any = {};
      if (filters.priceMin !== undefined) priceRange.gte = filters.priceMin;
      if (filters.priceMax !== undefined) priceRange.lte = filters.priceMax;

      filter.push({
        range: {
          price: priceRange,
        },
      });
    }

    if (filters.ratingMin !== undefined) {
      filter.push({
        range: {
          averageRating: {
            gte: filters.ratingMin,
          },
        },
      });
    }

    if (filters.status?.length) {
      filter.push({
        terms: {
          status: filters.status,
        },
      });
    }

    if (filters.isFeatured !== undefined) {
      filter.push({
        term: {
          isFeatured: filters.isFeatured,
        },
      });
    }

    if (filters.tags?.length) {
      filter.push({
        terms: {
          tags: filters.tags,
        },
      });
    }

    if (filters.inStock !== undefined) {
      filter.push({
        range: {
          stockQuantity: {
            gt: filters.inStock ? 0 : -1,
          },
        },
      });
    }

    // Always filter for active products
    filter.push({
      term: {
        status: 'active',
      },
    });

    return {
      bool: {
        must,
        filter,
      },
    };
  }

  /**
   * Build sort options for Elasticsearch
   */
  private buildSortOptions(sort: string): any[] {
    switch (sort) {
      case 'price_asc':
        return [{ price: 'asc' }, { _score: 'desc' }];
      case 'price_desc':
        return [{ price: 'desc' }, { _score: 'desc' }];
      case 'rating_desc':
        return [{ averageRating: 'desc' }, { _score: 'desc' }];
      case 'newest':
        return [{ createdAt: 'desc' }, { _score: 'desc' }];
      case 'popular':
        return [{ totalWishlisted: 'desc' }, { totalSold: 'desc' }, { _score: 'desc' }];
      case 'relevance':
      default:
        return [{ _score: 'desc' }, { createdAt: 'desc' }];
    }
  }

  /**
   * Get facets/aggregations for search filters
   */
  private async getFacets(query: string, filters: SearchFilters): Promise<SearchResult['facets']> {
    try {
      const esQuery = this.buildSearchQuery(query, filters);

      const response = await this.client.search({
        index: INDEXES.PRODUCTS,
        body: {
          query: esQuery,
          size: 0, // Don't return documents, only aggregations
          aggs: {
            categories: {
              terms: {
                field: 'categoryId',
                size: 50,
              },
            },
            vendors: {
              terms: {
                field: 'vendorId',
                size: 50,
              },
            },
            price_ranges: {
              range: {
                field: 'price',
                ranges: [
                  { to: 50, key: 'Under $50' },
                  { from: 50, to: 100, key: '$50 - $100' },
                  { from: 100, to: 200, key: '$100 - $200' },
                  { from: 200, to: 500, key: '$200 - $500' },
                  { from: 500, key: '$500+' },
                ],
              },
            },
            ratings: {
              range: {
                field: 'averageRating',
                ranges: [
                  { from: 4.5, key: '4.5+ stars' },
                  { from: 4.0, to: 4.5, key: '4.0 - 4.5 stars' },
                  { from: 3.5, to: 4.0, key: '3.5 - 4.0 stars' },
                  { from: 3.0, to: 3.5, key: '3.0 - 3.5 stars' },
                  { from: 0, to: 3.0, key: 'Under 3.0 stars' },
                ],
              },
            },
            tags: {
              terms: {
                field: 'tags',
                size: 20,
              },
            },
          },
        },
      });

      const aggs = response.aggregations;

      return {
        categories: aggs?.categories?.buckets.map((bucket: any) => ({
          key: bucket.key.toString(),
          count: bucket.doc_count,
        })) || [],
        vendors: aggs?.vendors?.buckets.map((bucket: any) => ({
          key: bucket.key.toString(),
          count: bucket.doc_count,
        })) || [],
        priceRanges: aggs?.price_ranges?.buckets.map((bucket: any) => ({
          key: bucket.key,
          count: bucket.doc_count,
        })) || [],
        ratings: aggs?.ratings?.buckets.map((bucket: any) => ({
          key: bucket.key,
          count: bucket.doc_count,
        })) || [],
        tags: aggs?.tags?.buckets.map((bucket: any) => ({
          key: bucket.key,
          count: bucket.doc_count,
        })) || [],
      };
    } catch (error: any) {
      logger.error('Failed to get facets', { error: error.message });
      return {
        categories: [],
        vendors: [],
        priceRanges: [],
        ratings: [],
        tags: [],
      };
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocompleteSuggestions(query: string, limit: number = 10): Promise<string[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const cacheKey = `autocomplete:${query.toLowerCase()}:${limit}`;
      const cached = await this.redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const response = await this.client.search({
        index: INDEXES.PRODUCTS,
        body: {
          query: {
            multi_match: {
              query: query,
              fields: ['name.autocomplete', 'categoryName.autocomplete', 'vendorName.autocomplete'],
              type: 'phrase_prefix',
            },
          },
          size: limit,
          _source: ['name', 'categoryName', 'vendorName'],
        },
      });

      const suggestions: string[] = [];
      const seen = new Set<string>();

      response.hits.hits.forEach((hit: any) => {
        const source = hit._source;

        // Add product name
        if (source.name && !seen.has(source.name)) {
          suggestions.push(source.name);
          seen.add(source.name);
        }

        // Add category name
        if (source.categoryName && !seen.has(source.categoryName)) {
          suggestions.push(source.categoryName);
          seen.add(source.categoryName);
        }

        // Add vendor name
        if (source.vendorName && !seen.has(source.vendorName)) {
          suggestions.push(source.vendorName);
          seen.add(source.vendorName);
        }
      });

      // Cache suggestions for 1 hour
      await this.redis.setex(cacheKey, 3600, JSON.stringify(suggestions.slice(0, limit)));

      return suggestions.slice(0, limit);
    } catch (error: any) {
      logger.error('Autocomplete suggestions failed', { error: error.message, query });
      return [];
    }
  }

  /**
   * Generate cache key for search results
   */
  private generateCacheKey(type: string, options: SearchOptions): string {
    const keyData = {
      type,
      ...options,
      // Normalize filters for consistent caching
      filters: options.filters ? JSON.stringify(options.filters, Object.keys(options.filters).sort()) : undefined,
    };

    return `search:${JSON.stringify(keyData)}`;
  }

  /**
   * Get cached search result
   */
  private async getCachedResult(cacheKey: string): Promise<SearchResult | null> {
    try {
      const cached = await this.redis.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.warn('Failed to get cached result', { error: (error as Error).message, cacheKey });
      return null;
    }
  }

  /**
   * Cache search result
   */
  private async cacheResult(cacheKey: string, result: SearchResult): Promise<void> {
    try {
      // Cache for 10 minutes
      await this.redis.setex(cacheKey, 600, JSON.stringify(result));
    } catch (error) {
      logger.warn('Failed to cache result', { error: (error as Error).message, cacheKey });
    }
  }

  /**
   * Clear search cache
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await this.redis.keys('search:*');
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
      logger.info('Search cache cleared', { keysCleared: keys.length });
    } catch (error: any) {
      logger.error('Failed to clear search cache', { error: error.message });
    }
  }
}

export default new EnhancedSearchService();