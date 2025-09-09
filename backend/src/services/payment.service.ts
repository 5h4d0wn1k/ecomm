import Razorpay from 'razorpay';
import { prisma } from '../config';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export interface CreateOrderData {
  amount: number; // Amount in cents (smallest currency unit)
  currency?: string;
  orderId: number;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface OrderResult {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  paymentIntentId?: string;
  clientSecret?: string;
  publishableKey?: string;
}

export interface RefundData {
  paymentId: string;
  amount?: number; // Amount to refund (optional, full refund if not specified)
  reason?: string;
}

export interface CreatePaymentIntentData {
  amount: number;
  currency?: string;
  orderId: number;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  publishableKey: string;
}

/**
 * Payment Service
 * Handles payment processing with Razorpay
 */
export class PaymentService {
  /**
    * Create a Razorpay order for payment
    */
  static async createOrder(data: CreateOrderData): Promise<OrderResult> {
    try {
      const orderOptions = {
        amount: data.amount, // Amount in paise
        currency: data.currency || 'INR',
        receipt: `order_${data.orderId}`,
        notes: {
          orderId: data.orderId.toString(),
          ...data.metadata,
        },
      };

      const order = await razorpay.orders.create(orderOptions);

      return {
        orderId: order.id,
        amount: +order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID || '',
        paymentIntentId: order.id, // For backward compatibility
        clientSecret: '', // Razorpay doesn't use client secrets like Stripe
        publishableKey: process.env.RAZORPAY_KEY_ID || '', // For backward compatibility
      };
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
    * Verify and confirm Razorpay payment
    */
  static async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<boolean> {
    try {
      // Verify payment signature
      const sign = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSign = require('crypto')
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(sign.toString())
        .digest('hex');

      if (razorpaySignature === expectedSign) {
        // Fetch payment details
        const payment = await razorpay.payments.fetch(razorpayPaymentId);

        if (payment.status === 'captured') {
          const orderId = parseInt(payment.notes?.orderId || '0');

          // Update order and payment status
          await prisma.$transaction(async (tx) => {
            // Update order status
            await tx.order.update({
              where: { id: orderId },
              data: {
                paymentStatus: 'paid',
                status: 'confirmed',
                updatedAt: new Date(),
              },
            });

            // Create or update payment record
            await tx.payment.upsert({
              where: { transactionId: razorpayPaymentId },
              create: {
                orderId,
                amount: +payment.amount / 100, // Convert from paise
                currency: payment.currency.toUpperCase(),
                status: 'paid',
                transactionId: razorpayPaymentId,
                paymentMethod: payment.method,
                paymentGateway: 'razorpay',
                gatewayResponse: payment as any,
              },
              update: {
                status: 'paid',
                gatewayResponse: payment as any,
                updatedAt: new Date(),
              },
            });
          });

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw new Error('Failed to verify payment');
    }
  }

  /**
    * Process refund for Razorpay payment
    */
  static async processRefund(data: RefundData): Promise<boolean> {
    try {
      const refundOptions: any = {
        payment_id: data.paymentId,
      };

      if (data.amount !== undefined) {
        refundOptions.amount = data.amount;
      }

      if (data.reason !== undefined) {
        refundOptions.notes = { reason: data.reason };
      }

      const refund = await razorpay.payments.refund(data.paymentId, refundOptions);

      if (refund.status === 'processed' || refund.status === 'pending') {
        // Update payment status
        await prisma.payment.updateMany({
          where: { transactionId: data.paymentId },
          data: {
            status: 'refunded',
            updatedAt: new Date(),
          },
        });

        // Update order status
        const payment = await prisma.payment.findFirst({
          where: { transactionId: data.paymentId },
          select: { orderId: true },
        });

        if (payment) {
          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'refunded',
              paymentStatus: 'refunded',
              updatedAt: new Date(),
            },
          });
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Refund processing failed:', error);
      throw new Error('Failed to process refund');
    }
  }

  /**
   * Handle Razorpay webhook events
   */
  static async handleWebhook(event: any): Promise<void> {
    try {
      switch (event.event) {
        case 'payment.captured':
          const capturedPayment = event.payload.payment.entity;
          // For webhook events, we don't need to verify signature again as it's already verified
          // Just update the order status
          const capturedOrderId = parseInt(capturedPayment.notes?.orderId || '0');

          await prisma.$transaction(async (tx) => {
            // Update order status
            await tx.order.update({
              where: { id: capturedOrderId },
              data: {
                paymentStatus: 'paid',
                status: 'confirmed',
                updatedAt: new Date(),
              },
            });

            // Create or update payment record
            await tx.payment.upsert({
              where: { transactionId: capturedPayment.id },
              create: {
                orderId: capturedOrderId,
                amount: Number(capturedPayment.amount) / 100, // Convert from paise
                currency: capturedPayment.currency.toUpperCase(),
                status: 'paid',
                transactionId: capturedPayment.id,
                paymentMethod: capturedPayment.method,
                paymentGateway: 'razorpay',
                gatewayResponse: capturedPayment as any,
              },
              update: {
                status: 'paid',
                gatewayResponse: capturedPayment as any,
                updatedAt: new Date(),
              },
            });
          });
          break;

        case 'payment.failed':
          const failedPayment = event.payload.payment.entity;
          const failedOrderId = parseInt(failedPayment.notes?.orderId || '0');

          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: failedOrderId },
              data: {
                paymentStatus: 'failed',
                updatedAt: new Date(),
              },
            });

            await tx.payment.upsert({
              where: { transactionId: failedPayment.id },
              create: {
                orderId: failedOrderId,
                amount: Number(failedPayment.amount) / 100,
                currency: failedPayment.currency.toUpperCase(),
                status: 'failed',
                transactionId: failedPayment.id,
                paymentMethod: failedPayment.method,
                paymentGateway: 'razorpay',
                gatewayResponse: failedPayment as any,
              },
              update: {
                status: 'failed',
                gatewayResponse: failedPayment as any,
                updatedAt: new Date(),
              },
            });
          });
          break;

        case 'refund.created':
          const refund = event.payload.refund.entity;
          console.log('Refund created:', refund.id);
          break;

        default:
          console.log(`Unhandled event type: ${event.event}`);
      }
    } catch (error) {
      console.error('Webhook handling failed:', error);
      throw error;
    }
  }

  /**
   * Get payment history for customer
   */
  static async getPaymentHistory(userId: number, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: {
            order: {
              userId,
            },
          },
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.payment.count({
          where: {
            order: {
              userId,
            },
          },
        }),
      ]);

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Failed to get payment history:', error);
      throw new Error('Failed to retrieve payment history');
    }
  }
}