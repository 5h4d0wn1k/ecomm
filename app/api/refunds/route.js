import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { RefundStatus, OrderStatus, PaymentMethod } from "@prisma/client";
import razorpay from "@/configs/razorpay";
import { validateCSRFForRequest, setCSRFToken } from "@/lib/csrf";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: "not authorized" }, { status: 401 });
        }

        // Validate CSRF token
        const csrfError = validateCSRFForRequest(request);
        if (csrfError) {
            return csrfError;
        }

        const { orderId, amount, reason } = await request.json();

        // Validate required fields
        if (!orderId || !amount) {
            return NextResponse.json({ error: "Order ID and amount are required" }, { status: 400 });
        }

        // Get order with return request
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                returnRequests: true,
                store: true
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Check if user is admin or store owner
        const isAdmin = await prisma.user.findFirst({
            where: { id: userId, role: 'admin' }
        });

        const isStoreOwner = order.store.userId === userId;

        if (!isAdmin && !isStoreOwner) {
            return NextResponse.json({ error: "not authorized to process refunds" }, { status: 403 });
        }

        // Check if there's an approved return request
        const approvedReturn = order.returnRequests.find(r => r.status === 'APPROVED');
        if (!approvedReturn) {
            return NextResponse.json({ error: "No approved return request found for this order" }, { status: 400 });
        }

        // Check if refund already exists
        const existingRefund = await prisma.refund.findFirst({
            where: { orderId }
        });

        if (existingRefund) {
            return NextResponse.json({ error: "Refund already processed for this order" }, { status: 400 });
        }

        let refundResult = null;
        let razorpayRefundId = null;

        // Process refund based on payment method
        if (order.paymentMethod === PaymentMethod.RAZORPAY && order.razorpayPaymentId) {
            try {
                // Create Razorpay refund
                const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
                    amount: Math.round(amount * 100), // Convert to paisa
                    notes: {
                        orderId,
                        reason: reason || 'Return refund'
                    }
                });
                razorpayRefundId = refund.id;
                refundResult = refund;
            } catch (razorpayError) {
                console.error('Razorpay refund error:', razorpayError);
                return NextResponse.json({
                    error: "Failed to process Razorpay refund",
                    details: razorpayError.message
                }, { status: 500 });
            }
        }

        // Create refund record
        const refund = await prisma.refund.create({
            data: {
                orderId,
                userId: order.userId,
                amount,
                reason: reason || 'Return refund',
                status: refundResult ? RefundStatus.PROCESSED : RefundStatus.PENDING,
                processedAt: refundResult ? new Date() : null,
                razorpayRefundId
            }
        });

        // Update order status and refund details
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: OrderStatus.REFUNDED,
                refundedAt: new Date(),
                refundAmount: amount,
                refundReason: reason || 'Return refund'
            }
        });

        const response = NextResponse.json({
            message: "Refund processed successfully",
            refund,
            razorpayRefund: refundResult
        });
        setCSRFToken(response);
        return response;

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: "not authorized" }, { status: 401 });
        }

        // Check if user is admin
        const isAdmin = await prisma.user.findFirst({
            where: { id: userId, role: 'admin' }
        });

        let refunds;

        if (isAdmin) {
            // Admin can see all refunds
            refunds = await prisma.refund.findMany({
                include: {
                    order: {
                        include: {
                            user: true,
                            store: true,
                            orderItems: { include: { product: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Regular users can only see their own refunds
            refunds = await prisma.refund.findMany({
                where: { userId },
                include: {
                    order: {
                        include: {
                            store: true,
                            orderItems: { include: { product: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        return NextResponse.json({ refunds });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}