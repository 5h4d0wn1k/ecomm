import { prisma } from '../config';

/**
 * Database Models and Utilities
 * Provides higher-level database operations
 */

export class UserModel {
  /**
   * Find user by email with role information
   */
  static async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            isVerified: true,
          },
        },
      },
    });
  }

  /**
   * Create user with vendor profile if role is vendor
   */
  static async createWithVendor(userData: any, vendorData?: any) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: userData,
      });

      if (vendorData && userData.role === 'vendor') {
        const vendor = await tx.vendor.create({
          data: {
            ...vendorData,
            userId: user.id,
          },
        });
        return { user, vendor };
      }

      return { user };
    });
  }
}

export class ProductModel {
  /**
   * Get products with filters and pagination
   */
  static async findManyWithFilters(filters: any, pagination: any) {
    const { skip, take } = pagination;
    
    return await Promise.all([
      prisma.product.findMany({
        where: filters,
        skip,
        take,
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
          },
          _count: {
            select: {
              reviews: true,
              wishlists: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: filters }),
    ]);
  }

  /**
   * Update stock quantities
   */
  static async updateStock(productId: number, quantity: number, variantId?: number) {
    if (variantId) {
      return await prisma.productVariant.update({
        where: { id: variantId },
        data: {
          stockQuantity: { decrement: quantity },
        },
      });
    } else {
      return await prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: { decrement: quantity },
        },
      });
    }
  }
}

export class OrderModel {
  /**
   * Create order with items and update stock
   */
  static async createWithItems(orderData: any, items: any[]) {
    return await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          ...orderData,
          orderItems: {
            create: items,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
              vendor: true,
            },
          },
          user: true,
        },
      });

      // Update stock quantities
      for (const item of items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });
        }
      }

      return order;
    });
  }

  /**
   * Get orders with pagination and filters
   */
  static async findManyWithFilters(filters: any, pagination: any) {
    const { skip, take } = pagination;
    
    return await Promise.all([
      prisma.order.findMany({
        where: filters,
        skip,
        take,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  images: true,
                },
              },
              vendor: {
                select: {
                  businessName: true,
                },
              },
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: filters }),
    ]);
  }
}

export class VendorModel {
  /**
   * Get vendor dashboard stats
   */
  static async getDashboardStats(vendorId: number) {
    const [
      totalProducts,
      totalOrders,
      totalEarnings,
      pendingOrders,
    ] = await Promise.all([
      prisma.product.count({
        where: { vendorId, isActive: true },
      }),
      prisma.orderItem.count({
        where: { vendorId },
      }),
      prisma.vendorEarning.aggregate({
        where: { vendorId, status: { in: ['paid'] } },
        _sum: { netAmount: true },
      }),
      prisma.orderItem.count({
        where: {
          vendorId,
          order: { status: 'pending' },
        },
      }),
    ]);

    return {
      totalProducts,
      totalOrders,
      totalEarnings: Number(totalEarnings._sum.netAmount || 0),
      pendingOrders,
    };
  }

  /**
   * Get vendor by user ID
   */
  static async findByUserId(userId: number) {
    return await prisma.vendor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
}

export class CategoryModel {
  /**
   * Get category tree with products count
   */
  static async getTreeWithCounts() {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            _count: {
              select: { products: true },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.filter(cat => !cat.parentId);
  }
}

// Utility functions
export const DatabaseUtils = {
  /**
   * Generate unique slug
   */
  async generateUniqueSlug(table: string, baseSlug: string, id?: number): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await (prisma as any)[table].findFirst({
        where: {
          slug,
          ...(id && { id: { not: id } }),
        },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  },

  /**
   * Soft delete record
   */
  async softDelete(table: string, id: number) {
    return await (prisma as any)[table].update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  },

  /**
   * Get pagination metadata
   */
  getPaginationMeta(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  },
};