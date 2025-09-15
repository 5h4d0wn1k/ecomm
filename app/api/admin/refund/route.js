import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const { orderId, refundAmount, refundReason } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.paymentMethod !== 'STRIPE' || !order.isPaid) {
            return NextResponse.json({ error: 'Order not eligible for refund' }, { status: 400 });
        }

        if (order.status === 'REFUNDED') {
            return NextResponse.json({ error: 'Order already refunded' }, { status: 400 });
        }

        const amountToRefund = refundAmount ? refundAmount : order.total;

        // Create Stripe refund
        const refund = await stripe.refunds.create({
            payment_intent: order.paymentIntentId,
            amount: Math.round(amountToRefund * 100), // Stripe expects cents
        });

        // Update order in DB
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'REFUNDED',
                refundedAt: new Date(),
                refundAmount: amountToRefund,
                refundReason: refundReason || null,
            }
        });

        return NextResponse.json({ message: 'Refund processed successfully', refundId: refund.id });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}