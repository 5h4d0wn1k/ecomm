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
  console.log('=== BACKEND PAYMENT PROCESSING DEBUG ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('User ID:', req.user?.id);
  console.log('Headers:', req.headers);

  try {
    const {
      orderId,
      paymentMethod,
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

        // Update vendor earnings to paid (since order is confirmed)
        await tx.vendorEarning.updateMany({
          where: { orderId },
          data: { status: 'paid' },
        });
      });

      paymentResult = {
        paymentId: null,
        status: 'confirmed',
        message: 'Order confirmed for Cash on Delivery',
      };
    } else {
      // Process online payment through Razorpay
      try {
        const razorpayOrder = await PaymentService.createOrder({
          amount: Math.round(Number(order.totalAmount) * 100), // Convert to paise
          currency: order.currency.toUpperCase(),
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
            transactionId: razorpayOrder.orderId,
            paymentMethod,
            paymentGateway: 'razorpay',
          },
        });

        paymentResult = {
          paymentId: payment.id,
          orderId: razorpayOrder.orderId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: razorpayOrder.key,
          status: 'pending',
          message: 'Razorpay order created successfully',
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
 * Verify Razorpay payment
 */
export const verifyPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const isVerified = await PaymentService.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (isVerified) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: {
        code: 'VERIFICATION_FAILED',
        details: 'Failed to verify payment',
      },
    });
  }
};

/**
 * Handle Razorpay webhook events
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // Verify webhook signature
    const expectedSignature = require('crypto')
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    const signature = req.headers['x-razorpay-signature'] as string;

    if (signature !== expectedSignature) {
      res.status(400).json({
        success: false,
        message: 'Invalid signature',
      });
      return;
    }

    await PaymentService.handleWebhook(req.body);

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook handling failed',
    });
  }
};