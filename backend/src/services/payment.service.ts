import Stripe from 'stripe';
import { prisma } from '../config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface CreatePaymentIntentData {
  amount: number; // Amount in smallest currency unit (e.g., cents for USD)
  currency?: string;
  orderId: number;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export interface RefundData {
  paymentIntentId: string;
  amount?: number; // Amount to refund (optional, full refund if not specified)
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

/**
 * Payment Service
 * Handles payment processing with Stripe
 */
export class PaymentService {
  /**
   * Create a payment intent for order payment
   */
  static async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentIntentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency || 'inr',
        customer: data.customerId,
        metadata: {
          orderId: data.orderId.toString(),
          ...data.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Confirm payment intent and update order
   */
  static async confirmPayment(paymentIntentId: string): Promise<boolean> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        const orderId = parseInt(paymentIntent.metadata.orderId);
        
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
            where: { transactionId: paymentIntentId },
            create: {
              orderId,
              amount: paymentIntent.amount / 100, // Convert from cents
              currency: paymentIntent.currency.toUpperCase(),
              status: 'completed',
              transactionId: paymentIntentId,
              paymentMethod: 'card',
              paymentGateway: 'stripe',
              gatewayResponse: paymentIntent as any,
            },
            update: {
              status: 'completed',
              gatewayResponse: paymentIntent as any,
              updatedAt: new Date(),
            },
          });
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      throw new Error('Failed to confirm payment');
    }
  }

  /**
   * Process refund for payment
   */
  static async processRefund(data: RefundData): Promise<boolean> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: data.paymentIntentId,
        amount: data.amount,
        reason: data.reason,
      });

      if (refund.status === 'succeeded') {
        // Update payment status
        await prisma.payment.updateMany({
          where: { transactionId: data.paymentIntentId },
          data: {
            status: 'refunded',
            updatedAt: new Date(),
          },
        });

        // Update order status
        const payment = await prisma.payment.findFirst({
          where: { transactionId: data.paymentIntentId },
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
   * Handle Stripe webhook events
   */
  static async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.confirmPayment(paymentIntent.id);
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          const orderId = parseInt(failedPayment.metadata.orderId);
          
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: orderId },
              data: {
                paymentStatus: 'failed',
                updatedAt: new Date(),
              },
            });

            await tx.payment.upsert({
              where: { transactionId: failedPayment.id },
              create: {
                orderId,
                amount: failedPayment.amount / 100,
                currency: failedPayment.currency.toUpperCase(),
                status: 'failed',
                transactionId: failedPayment.id,
                paymentMethod: 'card',
                paymentGateway: 'stripe',
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
          const refund = event.data.object as Stripe.Refund;
          console.log('Refund created:', refund.id);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
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