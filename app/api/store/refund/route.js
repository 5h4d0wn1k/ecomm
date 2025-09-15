import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        }

        const { orderId, refundAmount, refundReason } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        // Fetch the order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { store: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check if the order belongs to the seller's store
        if (order.storeId !== storeId) {
            return NextResponse.json({ error: 'Not authorized to refund this order' }, { status: 403 });
        }

        // Check conditions: DELIVERED, paid via STRIPE, isPaid
        if (order.status !== 'DELIVERED' || order.paymentMethod !== 'STRIPE' || !order.isPaid) {
            return NextResponse.json({ error: 'Order is not eligible for refund' }, { status: 400 });
        }

        // Check if already refunded
        if (order.status === 'REFUNDED') {
            return NextResponse.json({ error: 'Order already refunded' }, { status: 400 });
        }

        // Determine refund amount
        const amountToRefund = refundAmount ? refundAmount : order.total;

        // Ensure refund amount doesn't exceed order total
        if (amountToRefund > order.total) {
            return NextResponse.json({ error: 'Refund amount cannot exceed order total' }, { status: 400 });
        }

        // Create refund via Stripe (amount in cents)
        const refund = await stripe.refunds.create({
            payment_intent: order.paymentIntentId,
            amount: Math.round(amountToRefund * 100), // Convert to cents
            reason: refundReason || 'requested_by_customer'
        });

        // Update order in database
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'REFUNDED',
                refundedAt: new Date(),
                refundAmount: amountToRefund,
                refundReason: refundReason || null
            }
        });

        return NextResponse.json({
            message: 'Refund processed successfully',
            refundId: refund.id,
            amountRefunded: amountToRefund
        });

    } catch (error) {
        console.error('Refund error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}