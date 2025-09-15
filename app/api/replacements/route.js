import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ReplacementStatus, OrderStatus, PaymentMethod } from "@prisma/client";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: "not authorized" }, { status: 401 });
        }

        const { originalOrderId, reason, description, images, replacementItems } = await request.json();

        // Validate required fields
        if (!originalOrderId || !reason || !replacementItems || !Array.isArray(replacementItems)) {
            return NextResponse.json({
                error: "Original order ID, reason, and replacement items are required"
            }, { status: 400 });
        }

        // Get original order
        const originalOrder = await prisma.order.findUnique({
            where: { id: originalOrderId },
            include: {
                orderItems: { include: { product: true } },
                address: true,
                store: true,
                replacements: true
            }
        });

        if (!originalOrder) {
            return NextResponse.json({ error: "Original order not found" }, { status: 404 });
        }

        // Check if user owns the order
        if (originalOrder.userId !== userId) {
            return NextResponse.json({ error: "not authorized" }, { status: 403 });
        }

        // Check if order is delivered
        if (originalOrder.status !== OrderStatus.DELIVERED) {
            return NextResponse.json({ error: "Order must be delivered to request replacement" }, { status: 400 });
        }

        // Check if replacement already exists
        const existingReplacement = originalOrder.replacements.find(r => r.status !== 'REJECTED');
        if (existingReplacement) {
            return NextResponse.json({ error: "Replacement request already exists for this order" }, { status: 400 });
        }

        // Validate replacement items (should be subset of original items)
        const originalProductIds = originalOrder.orderItems.map(item => item.productId);
        const invalidItems = replacementItems.filter(item => !originalProductIds.includes(item.productId));

        if (invalidItems.length > 0) {
            return NextResponse.json({
                error: "Replacement items must be from the original order"
            }, { status: 400 });
        }

        // Calculate replacement order total
        let total = 0;
        for (const item of replacementItems) {
            const originalItem = originalOrder.orderItems.find(oi => oi.productId === item.productId);
            if (originalItem) {
                total += originalItem.price * item.quantity;
            }
        }

        // Create replacement order
        const replacementOrder = await prisma.order.create({
            data: {
                userId,
                storeId: originalOrder.storeId,
                addressId: originalOrder.addressId,
                total,
                paymentMethod: PaymentMethod.COD, // Replacement orders are typically COD
                isPaid: false,
                status: OrderStatus.ORDER_PLACED,
                orderItems: {
                    create: replacementItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: originalOrder.orderItems.find(oi => oi.productId === item.productId)?.price || 0
                    }))
                }
            }
        });

        // Create replacement request
        const replacement = await prisma.replacement.create({
            data: {
                originalOrderId,
                replacementOrderId: replacementOrder.id,
                userId,
                reason,
                description: description || null,
                images: images || [],
                status: ReplacementStatus.PENDING
            }
        });

        // Update original order status
        await prisma.order.update({
            where: { id: originalOrderId },
            data: {
                status: OrderStatus.REPLACEMENT_REQUESTED,
                replacementRequestedAt: new Date(),
                replacementReason: reason,
                replacementOrderId: replacementOrder.id
            }
        });

        return NextResponse.json({
            message: "Replacement request created successfully",
            replacement,
            replacementOrder
        });

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

        let replacements;

        if (isAdmin) {
            // Admin can see all replacements
            replacements = await prisma.replacement.findMany({
                include: {
                    originalOrder: {
                        include: {
                            user: true,
                            store: true,
                            orderItems: { include: { product: true } }
                        }
                    },
                    replacementOrder: {
                        include: {
                            orderItems: { include: { product: true } }
                        }
                    },
                    user: true
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Regular users can only see their own replacements
            replacements = await prisma.replacement.findMany({
                where: { userId },
                include: {
                    originalOrder: {
                        include: {
                            store: true,
                            orderItems: { include: { product: true } }
                        }
                    },
                    replacementOrder: {
                        include: {
                            orderItems: { include: { product: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        return NextResponse.json({ replacements });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}