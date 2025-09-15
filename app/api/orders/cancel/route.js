import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const { orderId } = await request.json();
        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        // Find the order and ensure it belongs to the user
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: userId,
            },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found or not owned by user" }, { status: 404 });
        }

        // Check if the order can be cancelled
        if (order.status !== OrderStatus.ORDER_PLACED && order.status !== OrderStatus.PROCESSING) {
            return NextResponse.json({ error: "Order cannot be cancelled" }, { status: 400 });
        }

        // Update the order status to CANCELLED and set cancelledAt
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: OrderStatus.CANCELLED,
                cancelledAt: new Date(),
            },
        });

        // If paid with Stripe, initiate refund
        if (order.isPaid && order.paymentMethod === PaymentMethod.STRIPE && order.paymentIntentId) {
            try {
                const refund = await stripe.refunds.create({
                    payment_intent: order.paymentIntentId,
                    amount: Math.round(order.total * 100), // Full amount in cents
                });

                // Update order with refund details on success
                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        refundedAt: new Date(),
                        refundAmount: order.total,
                        refundReason: "Order cancelled",
                    },
                });
            } catch (refundError) {
                // Handle refund failure gracefully - log error but proceed with cancellation
                console.error("Refund failed for order", orderId, refundError.message);
                // Order is still cancelled, but refund fields are not updated
            }
        }

        return NextResponse.json({ message: "Order cancelled successfully", order: updatedOrder });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}