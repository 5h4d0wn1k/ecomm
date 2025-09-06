import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';
import { PaymentService } from '../../services';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';
import { NotificationService } from '../../services';

/**
 * Process payment for an order
 */
export const processPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      orderId,
      paymentMethod,
      paymentToken,
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to process payments',
        },
      });
      return;
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
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
              },
            },
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
          details: 'The specified order does not exist',
        },
      });
      return;
    }

    // Check if user owns the order
    if (order.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'You can only process payments for your own orders',
        },
      });
      return;
    }

    // Check if order is in valid state for payment
    if (order.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: 'Order cannot be processed',
        error: {
          code: 'INVALID_ORDER_STATUS',
          details: 'Order must be in pending status to process payment',
        },
      });
      return;
    }

    // Check if payment is already completed
    if (order.paymentStatus === 'paid') {
      res.status(400).json({
        success: false,
        message: 'Payment already completed',
        error: {
          code: 'PAYMENT_ALREADY_COMPLETED',
          details: 'This order has already been paid',
        },
      });
      return;
    }

    let paymentResult;

    if (paymentMethod === 'cod') {
      // Cash on Delivery - No payment processing needed
      await prisma.$transaction(async (tx) => {
        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentMethod: 'cod',
            status: 'confirmed',
            paymentStatus: 'pending', // Will be paid on delivery
            updatedAt: new Date(),
          },
        });

        // Create payment record
        await tx.payment.create({
          data: {
            orderId,
            amount: order.totalAmount,
            currency: order.currency,
            status: 'pending',
            paymentMethod: 'cod',
            paymentGateway: 'cod',
          },
        });

        // Update vendor earnings to available (since order is confirmed)
        await tx.vendorEarning.updateMany({
          where: { orderId },
          data: { status: 'available' },
        });
      });

      paymentResult = {
        paymentId: null,
        status: 'confirmed',
        message: 'Order confirmed for Cash on Delivery',
      };
    } else {
      // Process online payment through Stripe
      try {
        const paymentIntent = await PaymentService.createPaymentIntent({
          amount: Math.round(Number(order.totalAmount) * 100), // Convert to cents
          currency: order.currency.toLowerCase(),
          orderId: order.id,
          metadata: {
            userId: userId.toString(),
            orderNumber: order.orderNumber,
          },
        });

        // Create payment record
        const payment = await prisma.payment.create({
          data: {
            orderId,
            amount: order.totalAmount,
            currency: order.currency,
            status: 'pending',
            transactionId: paymentIntent.paymentIntentId,
            paymentMethod,
            paymentGateway: 'stripe',
          },
        });

        paymentResult = {
          paymentId: payment.id,
          clientSecret: paymentIntent.clientSecret,
          status: 'pending',
          message: 'Payment intent created successfully',
        };
      } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
          success: false,
          message: 'Payment processing failed',
          error: {
            code: 'PAYMENT_FAILED',
            details: 'Failed to process payment with gateway',
          },
        });
        return;
      }
    }

    // Send notification
    if (paymentMethod === 'cod') {
      await NotificationService.createOrderNotification(
        userId,
        order.id,
        order.orderNumber,
        'confirmed'
      );
    }

    // Audit log
    await logAuditEvent({
      userId,
      action: AUDIT_ACTIONS.PAYMENT_PROCESS,
      resource: AUDIT_RESOURCES.PAYMENT,
      resourceId: orderId.toString(),
      details: {
        orderId,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        paymentMethod,
        status: paymentResult.status,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
      success: true,
      data: paymentResult,
      message: 'Payment processed successfully',
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to process payment',
      },
    });
  }
};

/**
 * Handle Stripe webhook events
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      res.status(400).json({
        success: false,
        message: 'Missing stripe signature',
      });
      return;
    }

    // TODO: Verify webhook signature with Stripe
    // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // For now, parse the event directly
    const event = req.body;

    await PaymentService.handleWebhook(event);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook handling failed',
    });
  }
};