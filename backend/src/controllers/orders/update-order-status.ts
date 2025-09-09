import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';
import { NotificationService } from '../../services';

/**
 * Update order status (Vendor/Admin only)
 */
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { id } = req.params;
    const { status } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to update order status',
        },
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Order ID is required',
        error: {
          code: 'MISSING_ID',
          details: 'Order ID parameter is missing',
        },
      });
      return;
    }

    const orderId = parseInt(id as string);
    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order ID',
        error: {
          code: 'INVALID_ID',
          details: 'Order ID must be a valid number',
        },
      });
      return;
    }

    // Get the order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            vendor: {
              select: {
                id: true,
                userId: true,
                businessName: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
        error: {
          code: 'ORDER_NOT_FOUND',
          details: 'The requested order does not exist',
        },
      });
      return;
    }

    // Check permissions
    let hasPermission = false;
    if (userRole === 'admin' || userRole === 'super_admin') {
      hasPermission = true;
    } else if (userRole === 'vendor') {
      // Check if user is vendor for any item in the order
      hasPermission = order.orderItems.some(item => item.vendor.userId === userId);
    }

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'You do not have permission to update this order status',
        },
      });
      return;
    }

    // Validate status transition
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status',
        error: {
          code: 'INVALID_STATUS',
          details: `Status must be one of: ${validStatuses.join(', ')}`,
        },
      });
      return;
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
            vendor: {
              select: {
                id: true,
                businessName: true,
              },
            },
          },
        },
      },
    });

    // Send notification to customer
    const notificationType = status === 'shipped' ? 'shipped' :
                           status === 'delivered' ? 'delivered' :
                           status === 'cancelled' ? 'cancelled' : 'confirmed';

    await NotificationService.createOrderNotification(
      order.userId,
      order.id,
      order.orderNumber,
      notificationType as any
    );

    // Audit log
    await logAuditEvent({
      userId,
      action: AUDIT_ACTIONS.ORDER_UPDATE,
      resource: AUDIT_RESOURCES.ORDER,
      resourceId: orderId.toString(),
      details: {
        orderId,
        orderNumber: order.orderNumber,
        oldStatus: order.status,
        newStatus: status,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to update order status',
      },
    });
  }
};