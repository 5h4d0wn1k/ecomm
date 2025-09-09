import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';
import { NotificationService } from '../../services';

/**
 * Get user notifications
 */
export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to access notifications',
        },
      });
      return;
    }

    const result = await NotificationService.getUserNotifications(
      userId,
      Number(page),
      Number(limit),
      unreadOnly === 'true'
    );

    res.status(200).json({
      success: true,
      data: result.notifications,
      unreadCount: result.unreadCount,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve notifications',
      },
    });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to modify notifications',
        },
      });
      return;
    }

    const notificationId = parseInt(id || '0');
    if (isNaN(notificationId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
        error: {
          code: 'INVALID_ID',
          details: 'Notification ID must be a valid number',
        },
      });
      return;
    }

    const success = await NotificationService.markAsRead(notificationId, userId);

    if (!success) {
      res.status(404).json({
        success: false,
        message: 'Notification not found',
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          details: 'The requested notification does not exist or does not belong to you',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to mark notification as read',
      },
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to modify notifications',
        },
      });
      return;
    }

    const success = await NotificationService.markAllAsRead(userId);

    if (!success) {
      res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read',
        error: {
          code: 'UPDATE_FAILED',
          details: 'Could not update notification status',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to mark all notifications as read',
      },
    });
  }
};