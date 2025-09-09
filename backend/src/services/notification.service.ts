import { prisma } from '../config';
import { getRedisClient } from '../config';

export interface CreateNotificationData {
  userId: number;
  type: 'order' | 'payment' | 'shipping' | 'vendor' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface BulkNotificationData {
  userIds: number[];
  type: 'order' | 'payment' | 'shipping' | 'vendor' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * Notification Service
 * Handles in-app notifications, email notifications, and real-time updates
 */
export class NotificationService {
  private static readonly CACHE_PREFIX = 'notifications:';
  private static readonly UNREAD_COUNT_PREFIX = 'unread_count:';

  /**
   * Create a single notification
   */
  static async createNotification(notificationData: CreateNotificationData): Promise<any> {
    try {
      const notification = await prisma.notification.create({
        data: notificationData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Update unread count in cache
      await this.updateUnreadCount(notificationData.userId);

      // TODO: Send push notification if enabled
      // await this.sendPushNotification(notification);

      // TODO: Send real-time notification via WebSocket
      // await this.sendRealtimeNotification(notification);

      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Create bulk notifications for multiple users
   */
  static async createBulkNotifications(bulkData: BulkNotificationData): Promise<boolean> {
    try {
      const notifications = bulkData.userIds.map(userId => ({
        userId,
        type: bulkData.type,
        title: bulkData.title,
        message: bulkData.message,
        ...(bulkData.data && { data: bulkData.data }),
      } as any));

      await prisma.notification.createMany({
        data: notifications,
      });

      // Update unread counts for all users
      await Promise.all(
        bulkData.userIds.map(userId => this.updateUnreadCount(userId))
      );

      return true;
    } catch (error) {
      console.error('Failed to create bulk notifications:', error);
      return false;
    }
  }

  /**
   * Get notifications for a user with pagination
   */
  static async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ) {
    try {
      const skip = (page - 1) * limit;
      const where: any = { userId };

      if (unreadOnly) {
        where.isRead = false;
      }

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            type: true,
            title: true,
            message: true,
            data: true,
            isRead: true,
            createdAt: true,
          },
        }),
        prisma.notification.count({ where }),
        this.getUnreadCount(userId),
      ]);

      return {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      throw new Error('Failed to retrieve notifications');
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        return false;
      }

      if (!notification.isRead) {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { isRead: true },
        });

        // Update unread count
        await this.updateUnreadCount(userId);
      }

      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: number): Promise<boolean> {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      // Reset unread count
      await this.setUnreadCount(userId, 0);

      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: number, userId: number): Promise<boolean> {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (result.count > 0) {
        await this.updateUnreadCount(userId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  }

  /**
   * Get unread count for user
   */
  static async getUnreadCount(userId: number): Promise<number> {
    try {
      const redisClient = getRedisClient();
      const cacheKey = `${this.UNREAD_COUNT_PREFIX}${userId}`;

      // Try to get from cache first
      if (redisClient.isOpen) {
        const cachedCount = await redisClient.get(cacheKey);
        if (cachedCount !== null) {
          return parseInt(cachedCount);
        }
      }

      // Get from database
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      // Cache the result
      if (redisClient.isOpen) {
        await redisClient.setEx(cacheKey, 300, count.toString()); // Cache for 5 minutes
      }

      return count;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Update unread count in cache
   */
  private static async updateUnreadCount(userId: number): Promise<void> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      await this.setUnreadCount(userId, count);
    } catch (error) {
      console.error('Failed to update unread count:', error);
    }
  }

  /**
   * Set unread count in cache
   */
  private static async setUnreadCount(userId: number, count: number): Promise<void> {
    try {
      const redisClient = getRedisClient();
      if (redisClient.isOpen) {
        const cacheKey = `${this.UNREAD_COUNT_PREFIX}${userId}`;
        await redisClient.setEx(cacheKey, 300, count.toString());
      }
    } catch (error) {
      console.error('Failed to set unread count in cache:', error);
    }
  }

  /**
   * Create order-related notifications
   */
  static async createOrderNotification(
    userId: number,
    orderId: number,
    orderNumber: string,
    type: 'created' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  ): Promise<void> {
    const notifications = {
      created: {
        title: 'Order Placed Successfully',
        message: `Your order #${orderNumber} has been placed successfully.`,
      },
      confirmed: {
        title: 'Order Confirmed',
        message: `Your order #${orderNumber} has been confirmed and is being prepared.`,
      },
      shipped: {
        title: 'Order Shipped',
        message: `Your order #${orderNumber} has been shipped and is on its way.`,
      },
      delivered: {
        title: 'Order Delivered',
        message: `Your order #${orderNumber} has been delivered successfully.`,
      },
      cancelled: {
        title: 'Order Cancelled',
        message: `Your order #${orderNumber} has been cancelled.`,
      },
    };

    const notification = notifications[type];

    await this.createNotification({
      userId,
      type: 'order',
      title: notification.title,
      message: notification.message,
      data: { orderId, orderNumber },
    });
  }

  /**
   * Create vendor-related notifications
   */
  static async createVendorNotification(
    userId: number,
    type: 'approved' | 'rejected' | 'suspended' | 'new_order' | 'payout'
  ): Promise<void> {
    const notifications = {
      approved: {
        title: 'Vendor Application Approved',
        message: 'Congratulations! Your vendor application has been approved.',
      },
      rejected: {
        title: 'Vendor Application Rejected',
        message: 'Your vendor application has been rejected. Please check your email for details.',
      },
      suspended: {
        title: 'Account Suspended',
        message: 'Your vendor account has been suspended. Please contact support.',
      },
      new_order: {
        title: 'New Order Received',
        message: 'You have received a new order. Please check your dashboard.',
      },
      payout: {
        title: 'Payout Processed',
        message: 'Your earnings have been processed and will be transferred shortly.',
      },
    };

    const notification = notifications[type];

    await this.createNotification({
      userId,
      type: 'vendor',
      title: notification.title,
      message: notification.message,
    });
  }

  /**
   * Create system-wide announcement
   */
  static async createSystemAnnouncement(
    title: string,
    message: string,
    userIds?: number[]
  ): Promise<boolean> {
    try {
      let targetUserIds = userIds;

      if (!targetUserIds) {
        // Get all active users if no specific users provided
        const users = await prisma.user.findMany({
          where: { isActive: true },
          select: { id: true },
        });
        targetUserIds = users.map(user => user.id);
      }

      await this.createBulkNotifications({
        userIds: targetUserIds,
        type: 'system',
        title,
        message,
      });

      return true;
    } catch (error) {
      console.error('Failed to create system announcement:', error);
      return false;
    }
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  static async cleanupOldNotifications(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      console.log(`Cleaned up ${result.count} old notifications`);
      return result.count;
    } catch (error) {
      console.error('Failed to cleanup old notifications:', error);
      return 0;
    }
  }
}