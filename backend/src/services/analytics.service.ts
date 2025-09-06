import { prisma } from '../config';
import { getRedisClient } from '../config';

export interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  recentOrders: any[];
  topProducts: any[];
  userGrowth: any[];
}

export interface VendorDashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  monthlyEarnings: number;
  recentOrders: any[];
  topProducts: any[];
}

export interface RevenueData {
  period: string;
  revenue: number;
  orders: number;
}

export interface ProductPerformance {
  productId: number;
  productName: string;
  totalSold: number;
  revenue: number;
  averageRating: number;
}

/**
 * Analytics Service
 * Provides business intelligence and analytics data
 */
export class AnalyticsService {
  private static readonly CACHE_PREFIX = 'analytics:';
  private static readonly CACHE_TTL = 300; // 5 minutes

  /**
   * Get admin dashboard statistics
   */
  static async getAdminDashboardStats(): Promise<DashboardStats> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}admin_dashboard`;
      const redisClient = getRedisClient();

      // Try to get from cache
      if (redisClient.isOpen) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const [
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        totalRevenueResult,
        monthlyRevenueResult,
        recentOrders,
        topProducts,
        userGrowth,
      ] = await Promise.all([
        // Total users count
        prisma.user.count({
          where: { isActive: true },
        }),

        // Total vendors count
        prisma.vendor.count({
          where: { isVerified: true },
        }),

        // Total products count
        prisma.product.count({
          where: { isActive: true },
        }),

        // Total orders count
        prisma.order.count(),

        // Total revenue
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { paymentStatus: 'paid' },
        }),

        // Monthly revenue
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: {
            paymentStatus: 'paid',
            createdAt: { gte: firstDayOfMonth },
          },
        }),

        // Recent orders
        prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
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
                  select: { name: true },
                },
              },
            },
          },
        }),

        // Top selling products
        prisma.orderItem.groupBy({
          by: ['productId'],
          _sum: { quantity: true },
          _count: { productId: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 10,
        }),

        // User growth (last 12 months)
        this.getUserGrowthData(),
      ]);

      // Get product details for top products
      const productIds = topProducts.map(item => item.productId);
      const productDetails = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, price: true, images: true },
      });

      const topProductsWithDetails = topProducts.map(item => {
        const product = productDetails.find(p => p.id === item.productId);
        return {
          ...product,
          totalSold: item._sum.quantity || 0,
          orderCount: item._count.productId,
        };
      });

      const stats: DashboardStats = {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        totalRevenue: Number(totalRevenueResult._sum.totalAmount || 0),
        monthlyRevenue: Number(monthlyRevenueResult._sum.totalAmount || 0),
        recentOrders,
        topProducts: topProductsWithDetails,
        userGrowth,
      };

      // Cache the result
      if (redisClient.isOpen) {
        await redisClient.setex(cacheKey, this.CACHE_TTL, JSON.stringify(stats));
      }

      return stats;
    } catch (error) {
      console.error('Failed to get admin dashboard stats:', error);
      throw new Error('Failed to retrieve dashboard statistics');
    }
  }

  /**
   * Get vendor dashboard statistics
   */
  static async getVendorDashboardStats(vendorId: number): Promise<VendorDashboardStats> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}vendor_dashboard:${vendorId}`;
      const redisClient = getRedisClient();

      // Try to get from cache
      if (redisClient.isOpen) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalProducts,
        totalOrders,
        totalRevenueResult,
        pendingOrders,
        lowStockProducts,
        monthlyEarningsResult,
        recentOrders,
        topProducts,
      ] = await Promise.all([
        // Total products
        prisma.product.count({
          where: { vendorId, isActive: true },
        }),

        // Total orders
        prisma.orderItem.count({
          where: { vendorId },
        }),

        // Total revenue
        prisma.vendorEarning.aggregate({
          _sum: { netAmount: true },
          where: {
            vendorId,
            status: { in: ['available', 'paid'] },
          },
        }),

        // Pending orders
        prisma.orderItem.count({
          where: {
            vendorId,
            order: { status: 'pending' },
          },
        }),

        // Low stock products
        prisma.product.count({
          where: {
            vendorId,
            isActive: true,
            stockQuantity: { lte: prisma.product.fields.minStockLevel },
          },
        }),

        // Monthly earnings
        prisma.vendorEarning.aggregate({
          _sum: { netAmount: true },
          where: {
            vendorId,
            status: { in: ['available', 'paid'] },
            createdAt: { gte: firstDayOfMonth },
          },
        }),

        // Recent orders
        prisma.orderItem.findMany({
          where: { vendorId },
          take: 10,
          orderBy: { order: { createdAt: 'desc' } },
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                status: true,
                totalAmount: true,
                createdAt: true,
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
            product: {
              select: { name: true, images: true },
            },
          },
        }),

        // Top selling products
        prisma.orderItem.groupBy({
          by: ['productId'],
          where: { vendorId },
          _sum: { quantity: true, totalPrice: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 10,
        }),
      ]);

      // Get product details for top products
      const productIds = topProducts.map(item => item.productId);
      const productDetails = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, price: true, images: true },
      });

      const topProductsWithDetails = topProducts.map(item => {
        const product = productDetails.find(p => p.id === item.productId);
        return {
          ...product,
          totalSold: item._sum.quantity || 0,
          revenue: Number(item._sum.totalPrice || 0),
        };
      });

      const stats: VendorDashboardStats = {
        totalProducts,
        totalOrders,
        totalRevenue: Number(totalRevenueResult._sum.netAmount || 0),
        pendingOrders,
        lowStockProducts,
        monthlyEarnings: Number(monthlyEarningsResult._sum.netAmount || 0),
        recentOrders,
        topProducts: topProductsWithDetails,
      };

      // Cache the result
      if (redisClient.isOpen) {
        await redisClient.setex(cacheKey, this.CACHE_TTL, JSON.stringify(stats));
      }

      return stats;
    } catch (error) {
      console.error('Failed to get vendor dashboard stats:', error);
      throw new Error('Failed to retrieve vendor dashboard statistics');
    }
  }

  /**
   * Get revenue data by period
   */
  static async getRevenueData(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: Date,
    endDate: Date,
    vendorId?: number
  ): Promise<RevenueData[]> {
    try {
      const whereClause: any = {
        paymentStatus: 'paid',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (vendorId) {
        whereClause.orderItems = {
          some: { vendorId },
        };
      }

      const orders = await prisma.order.findMany({
        where: whereClause,
        select: {
          totalAmount: true,
          createdAt: true,
          orderItems: vendorId ? {
            where: { vendorId },
            select: { totalPrice: true },
          } : undefined,
        },
      });

      // Group data by period
      const groupedData = new Map<string, { revenue: number; orders: number }>();

      orders.forEach(order => {
        const date = order.createdAt;
        let key: string;

        switch (period) {
          case 'daily':
            key = date.toISOString().split('T')[0];
            break;
          case 'weekly':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'monthly':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'yearly':
            key = date.getFullYear().toString();
            break;
        }

        const existing = groupedData.get(key) || { revenue: 0, orders: 0 };
        const revenue = vendorId 
          ? order.orderItems?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0
          : Number(order.totalAmount);

        groupedData.set(key, {
          revenue: existing.revenue + revenue,
          orders: existing.orders + 1,
        });
      });

      // Convert to array and sort
      return Array.from(groupedData.entries())
        .map(([period, data]) => ({
          period,
          revenue: data.revenue,
          orders: data.orders,
        }))
        .sort((a, b) => a.period.localeCompare(b.period));
    } catch (error) {
      console.error('Failed to get revenue data:', error);
      throw new Error('Failed to retrieve revenue data');
    }
  }

  /**
   * Get product performance data
   */
  static async getProductPerformance(vendorId?: number): Promise<ProductPerformance[]> {
    try {
      const whereClause = vendorId ? { vendorId } : {};

      const productStats = await prisma.product.findMany({
        where: {
          ...whereClause,
          isActive: true,
          orderItems: {
            some: {},
          },
        },
        select: {
          id: true,
          name: true,
          orderItems: {
            select: {
              quantity: true,
              totalPrice: true,
            },
          },
          reviews: {
            select: { rating: true },
          },
        },
        orderBy: {
          orderItems: {
            _count: 'desc',
          },
        },
        take: 20,
      });

      return productStats.map(product => {
        const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const revenue = product.orderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
        const averageRating = product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0;

        return {
          productId: product.id,
          productName: product.name,
          totalSold,
          revenue,
          averageRating: Math.round(averageRating * 10) / 10,
        };
      });
    } catch (error) {
      console.error('Failed to get product performance:', error);
      throw new Error('Failed to retrieve product performance data');
    }
  }

  /**
   * Get user growth data for the last 12 months
   */
  private static async getUserGrowthData(): Promise<any[]> {
    try {
      const result = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as new_users
        FROM users 
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month ASC
      `;

      return Array.isArray(result) ? result.map((row: any) => ({
        month: row.month,
        newUsers: Number(row.new_users),
      })) : [];
    } catch (error) {
      console.error('Failed to get user growth data:', error);
      return [];
    }
  }

  /**
   * Clear analytics cache
   */
  static async clearCache(pattern?: string): Promise<boolean> {
    try {
      const redisClient = getRedisClient();
      if (!redisClient.isOpen) {
        return false;
      }

      const searchPattern = pattern || `${this.CACHE_PREFIX}*`;
      const keys = await redisClient.keys(searchPattern);
      
      if (keys.length > 0) {
        await redisClient.del(keys);
      }

      return true;
    } catch (error) {
      console.error('Failed to clear analytics cache:', error);
      return false;
    }
  }
}