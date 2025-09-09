import { Client } from '@elastic/elasticsearch';
import { getElasticsearchClient, INDEXES } from '../config';
import { prisma } from '../config';
import logger from '../middlewares/logger';

export class SearchService {
  private client: Client;

  constructor() {
    this.client = getElasticsearchClient();
  }

  /**
   * Create Elasticsearch indexes with mappings
   */
  async createIndexes(): Promise<void> {
    try {
      // Create products index
      await this.createProductsIndex();

      // Create categories index
      await this.createCategoriesIndex();

      // Create vendors index
      await this.createVendorsIndex();

      // Create search suggestions index
      await this.createSearchSuggestionsIndex();

      logger.info('All Elasticsearch indexes created successfully');
    } catch (error: any) {
      logger.error('Failed to create Elasticsearch indexes', { error: error.message });
      throw error;
    }
  }

  /**
   * Create products index with mapping
   */
  private async createProductsIndex(): Promise<void> {
    const indexExists = await this.client.indices.exists({ index: INDEXES.PRODUCTS });

    if (!indexExists) {
      await this.client.indices.create({
        index: INDEXES.PRODUCTS,
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              vendorId: { type: 'integer' },
              categoryId: { type: 'integer' },
              name: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' },
                  autocomplete: {
                    type: 'text',
                    analyzer: 'autocomplete_analyzer',
                    search_analyzer: 'standard'
                  }
                }
              },
              description: {
                type: 'text',
                analyzer: 'standard'
              },
              shortDescription: {
                type: 'text',
                analyzer: 'standard'
              },
              sku: { type: 'keyword' },
              price: { type: 'float' },
              compareAtPrice: { type: 'float' },
              stockQuantity: { type: 'integer' },
              status: { type: 'keyword' },
              isFeatured: { type: 'boolean' },
              tags: { type: 'keyword' },
              images: { type: 'keyword' },
              categoryName: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              vendorName: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              averageRating: { type: 'float' },
              totalReviews: { type: 'integer' },
              totalWishlisted: { type: 'integer' },
              totalSold: { type: 'integer' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            }
          },
          settings: {
            analysis: {
              analyzer: {
                autocomplete_analyzer: {
                  type: 'custom',
                  tokenizer: 'autocomplete_tokenizer',
                  filter: ['lowercase']
                }
              },
              tokenizer: {
                autocomplete_tokenizer: {
                  type: 'edge_ngram',
                  min_gram: 1,
                  max_gram: 20,
                  token_chars: ['letter', 'digit']
                }
              }
            }
          }
        }
      });
    }
  }

  /**
   * Create categories index with mapping
   */
  private async createCategoriesIndex(): Promise<void> {
    const indexExists = await this.client.indices.exists({ index: INDEXES.CATEGORIES });

    if (!indexExists) {
      await this.client.indices.create({
        index: INDEXES.CATEGORIES,
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              name: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' },
                  autocomplete: {
                    type: 'text',
                    analyzer: 'autocomplete_analyzer',
                    search_analyzer: 'standard'
                  }
                }
              },
              description: { type: 'text', analyzer: 'standard' },
              slug: { type: 'keyword' },
              parentId: { type: 'integer' },
              parentName: { type: 'text', analyzer: 'standard' },
              isActive: { type: 'boolean' },
              sortOrder: { type: 'integer' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            }
          },
          settings: {
            analysis: {
              analyzer: {
                autocomplete_analyzer: {
                  type: 'custom',
                  tokenizer: 'autocomplete_tokenizer',
                  filter: ['lowercase']
                }
              },
              tokenizer: {
                autocomplete_tokenizer: {
                  type: 'edge_ngram',
                  min_gram: 1,
                  max_gram: 20,
                  token_chars: ['letter', 'digit']
                }
              }
            }
          }
        }
      });
    }
  }

  /**
   * Create vendors index with mapping
   */
  private async createVendorsIndex(): Promise<void> {
    const indexExists = await this.client.indices.exists({ index: INDEXES.VENDORS });

    if (!indexExists) {
      await this.client.indices.create({
        index: INDEXES.VENDORS,
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              businessName: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' },
                  autocomplete: {
                    type: 'text',
                    analyzer: 'autocomplete_analyzer',
                    search_analyzer: 'standard'
                  }
                }
              },
              businessDescription: { type: 'text', analyzer: 'standard' },
              isVerified: { type: 'boolean' },
              totalProducts: { type: 'integer' },
              averageRating: { type: 'float' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            }
          },
          settings: {
            analysis: {
              analyzer: {
                autocomplete_analyzer: {
                  type: 'custom',
                  tokenizer: 'autocomplete_tokenizer',
                  filter: ['lowercase']
                }
              },
              tokenizer: {
                autocomplete_tokenizer: {
                  type: 'edge_ngram',
                  min_gram: 1,
                  max_gram: 20,
                  token_chars: ['letter', 'digit']
                }
              }
            }
          }
        }
      });
    }
  }

  /**
   * Create search suggestions index
   */
  private async createSearchSuggestionsIndex(): Promise<void> {
    const indexExists = await this.client.indices.exists({ index: INDEXES.SEARCH_SUGGESTIONS });

    if (!indexExists) {
      await this.client.indices.create({
        index: INDEXES.SEARCH_SUGGESTIONS,
        body: {
          mappings: {
            properties: {
              suggestion: {
                type: 'text',
                analyzer: 'autocomplete_analyzer',
                search_analyzer: 'standard'
              },
              type: { type: 'keyword' }, // 'product', 'category', 'vendor'
              referenceId: { type: 'integer' },
              popularity: { type: 'integer' },
              lastSearched: { type: 'date' }
            }
          },
          settings: {
            analysis: {
              analyzer: {
                autocomplete_analyzer: {
                  type: 'custom',
                  tokenizer: 'autocomplete_tokenizer',
                  filter: ['lowercase']
                }
              },
              tokenizer: {
                autocomplete_tokenizer: {
                  type: 'edge_ngram',
                  min_gram: 1,
                  max_gram: 20,
                  token_chars: ['letter', 'digit']
                }
              }
            }
          }
        }
      });
    }
  }
}

export default new SearchService();