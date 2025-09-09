import { Client } from '@elastic/elasticsearch';
import { getElasticsearchClient, INDEXES } from '../config';
import { prisma } from '../config';
import logger from '../middlewares/logger';

export class IndexingService {
  private client: Client;
  private readonly BATCH_SIZE = 1000;

  constructor() {
    this.client = getElasticsearchClient();
  }

  /**
   * Index all products from database to Elasticsearch
   */
  async indexAllProducts(): Promise<void> {
    try {
      logger.info('Starting bulk indexing of products');

      const totalProducts = await prisma.product.count();
      logger.info(`Found ${totalProducts} products to index`);

      let processed = 0;

      while (processed < totalProducts) {
        const products = await prisma.product.findMany({
          skip: processed,
          take: this.BATCH_SIZE,
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
            wishlists: {
              select: {
                id: true,
              },
            },
            orderItems: {
              select: {
                quantity: true,
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

        if (products.length === 0) break;

        const body = products.flatMap(product => {
          const totalReviews = product.reviews?.length || 0;
          const averageRating = totalReviews > 0
            ? (product.reviews?.reduce((sum, review) => sum + review.rating, 0) || 0) / totalReviews
            : 0;

          const totalSold = product.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

          // Parse JSON fields
          let tags: string[] = [];
          let images: string[] = [];

          try {
            tags = product.tags ? JSON.parse(product.tags) : [];
            images = product.images ? JSON.parse(product.images) : [];
          } catch (error) {
            logger.warn(`Failed to parse JSON for product ${product.id}`, { error: (error as Error).message });
          }

          const document = {
            id: product.id,
            vendorId: product.vendorId,
            categoryId: product.categoryId,
            name: product.name,
            description: product.description,
            shortDescription: product.shortDescription,
            sku: product.sku,
            price: parseFloat(product.price.toString()),
            compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice.toString()) : null,
            stockQuantity: product.stockQuantity,
            status: product.status,
            isFeatured: product.isFeatured,
            tags,
            images,
            categoryName: product.category?.name,
            vendorName: product.vendor?.businessName,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            totalWishlisted: product._count?.wishlists || 0,
            totalSold,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
          };

          return [
            { index: { _index: INDEXES.PRODUCTS, _id: product.id.toString() } },
            document,
          ];
        });

        if (body.length > 0) {
          const response = await this.client.bulk({ body });
          if (response.errors) {
            logger.error('Bulk indexing errors for products', { errors: response.errors });
          }
        }

        processed += products.length;
        logger.info(`Indexed ${processed}/${totalProducts} products`);
      }

      // Refresh index
      await this.client.indices.refresh({ index: INDEXES.PRODUCTS });
      logger.info('Products indexing completed successfully');
    } catch (error: any) {
      logger.error('Failed to index products', { error: error.message });
      throw error;
    }
  }

  /**
   * Index all categories from database to Elasticsearch
   */
  async indexAllCategories(): Promise<void> {
    try {
      logger.info('Starting bulk indexing of categories');

      const categories = await prisma.category.findMany({
        include: {
          parent: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      logger.info(`Found ${categories.length} categories to index`);

      const body = categories.flatMap(category => {
        const document = {
          id: category.id,
          name: category.name,
          description: category.description,
          slug: category.slug,
          parentId: category.parentId,
          parentName: category.parent?.name,
          isActive: category.isActive,
          sortOrder: category.sortOrder,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        };

        return [
          { index: { _index: INDEXES.CATEGORIES, _id: category.id.toString() } },
          document,
        ];
      });

      if (body.length > 0) {
        const response = await this.client.bulk({ body });
        if (response.errors) {
          logger.error('Bulk indexing errors for categories', { errors: response.errors });
        }
      }

      // Refresh index
      await this.client.indices.refresh({ index: INDEXES.CATEGORIES });
      logger.info('Categories indexing completed successfully');
    } catch (error: any) {
      logger.error('Failed to index categories', { error: error.message });
      throw error;
    }
  }

  /**
   * Index all vendors from database to Elasticsearch
   */
  async indexAllVendors(): Promise<void> {
    try {
      logger.info('Starting bulk indexing of vendors');

      const vendors = await prisma.vendor.findMany({
        include: {
          user: {
            select: {
              isActive: true,
            },
          },
          products: {
            where: {
              status: 'active',
            },
            select: {
              id: true,
              reviews: {
                select: {
                  rating: true,
                },
              },
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      logger.info(`Found ${vendors.length} vendors to index`);

      const body = vendors.flatMap(vendor => {
        // Calculate average rating across all vendor products
        const allReviews = vendor.products.flatMap(product => product.reviews || []);
        const totalReviews = allReviews.length;
        const averageRating = totalReviews > 0
          ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;

        const document = {
          id: vendor.id,
          businessName: vendor.businessName,
          businessDescription: vendor.businessDescription,
          isVerified: vendor.isVerified,
          totalProducts: vendor._count?.products || 0,
          averageRating: Math.round(averageRating * 10) / 10,
          createdAt: vendor.createdAt,
          updatedAt: vendor.updatedAt,
        };

        return [
          { index: { _index: INDEXES.VENDORS, _id: vendor.id.toString() } },
          document,
        ];
      });

      if (body.length > 0) {
        const response = await this.client.bulk({ body });
        if (response.errors) {
          logger.error('Bulk indexing errors for vendors', { errors: response.errors });
        }
      }

      // Refresh index
      await this.client.indices.refresh({ index: INDEXES.VENDORS });
      logger.info('Vendors indexing completed successfully');
    } catch (error: any) {
      logger.error('Failed to index vendors', { error: error.message });
      throw error;
    }
  }

  /**
   * Index a single product
   */
  async indexProduct(productId: number): Promise<void> {
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
          wishlists: {
            select: {
              id: true,
            },
          },
          orderItems: {
            select: {
              quantity: true,
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
        logger.warn(`Product ${productId} not found for indexing`);
        return;
      }

      const totalReviews = product.reviews?.length || 0;
      const averageRating = totalReviews > 0
        ? (product.reviews?.reduce((sum, review) => sum + review.rating, 0) || 0) / totalReviews
        : 0;

      const totalSold = product.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

      // Parse JSON fields
      let tags: string[] = [];
      let images: string[] = [];

      try {
        tags = product.tags ? JSON.parse(product.tags) : [];
        images = product.images ? JSON.parse(product.images) : [];
      } catch (error) {
        logger.warn(`Failed to parse JSON for product ${product.id}`, { error: (error as Error).message });
      }

      const document = {
        id: product.id,
        vendorId: product.vendorId,
        categoryId: product.categoryId,
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        sku: product.sku,
        price: parseFloat(product.price.toString()),
        compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice.toString()) : null,
        stockQuantity: product.stockQuantity,
        status: product.status,
        isFeatured: product.isFeatured,
        tags,
        images,
        categoryName: product.category?.name,
        vendorName: product.vendor?.businessName,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        totalWishlisted: product._count?.wishlists || 0,
        totalSold,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

      await this.client.index({
        index: INDEXES.PRODUCTS,
        id: product.id.toString(),
        body: document,
      });

      await this.client.indices.refresh({ index: INDEXES.PRODUCTS });
      logger.info(`Product ${productId} indexed successfully`);
    } catch (error: any) {
      logger.error(`Failed to index product ${productId}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Delete a product from index
   */
  async deleteProduct(productId: number): Promise<void> {
    try {
      await this.client.delete({
        index: INDEXES.PRODUCTS,
        id: productId.toString(),
      });

      await this.client.indices.refresh({ index: INDEXES.PRODUCTS });
      logger.info(`Product ${productId} deleted from index`);
    } catch (error: any) {
      if (error.statusCode !== 404) {
        logger.error(`Failed to delete product ${productId} from index`, { error: error.message });
        throw error;
      }
    }
  }

  /**
   * Perform full reindexing
   */
  async fullReindex(): Promise<void> {
    try {
      logger.info('Starting full reindexing process');

      // Delete existing indexes
      await this.deleteAllIndexes();

      // Recreate indexes
      const searchService = (await import('./search.service')).default;
      await searchService.createIndexes();

      // Index all data
      await Promise.all([
        this.indexAllProducts(),
        this.indexAllCategories(),
        this.indexAllVendors(),
      ]);

      logger.info('Full reindexing completed successfully');
    } catch (error: any) {
      logger.error('Full reindexing failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete all indexes
   */
  private async deleteAllIndexes(): Promise<void> {
    const indexes = [INDEXES.PRODUCTS, INDEXES.CATEGORIES, INDEXES.VENDORS, INDEXES.SEARCH_SUGGESTIONS];

    for (const index of indexes) {
      try {
        const exists = await this.client.indices.exists({ index });
        if (exists) {
          await this.client.indices.delete({ index });
          logger.info(`Deleted index: ${index}`);
        }
      } catch (error: any) {
        logger.warn(`Failed to delete index ${index}`, { error: error.message });
      }
    }
  }
}

export default new IndexingService();