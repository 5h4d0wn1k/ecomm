import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { checkRateLimit } from "@/middlewares/rateLimit";
import { validateRequest } from "@/middlewares/validationMiddleware";
import schemas from "@/lib/validationSchemas";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: "not authorized" }, { status: 401 });
        }

        // Validate and sanitize input
        const validation = await validateRequest(schemas.returnRequest)(request);
        if (validation instanceof NextResponse) {
            return validation; // Validation failed, return error response
        }

        const { orderId, reason, description, images } = validation.data;

        // Rate limiting: max 5 return requests per day per user
        const rateLimit = checkRateLimit(userId, 'return', 5, 24 * 60 * 60 * 1000);
        if (!rateLimit.allowed) {
            return NextResponse.json({
                error: `Rate limit exceeded. You can make ${rateLimit.remainingTime} more return requests in the next hour.`
            }, { status: 429 });
        }

        // Check if order exists and belongs to user
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId,
                status: OrderStatus.DELIVERED
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found or not eligible for return" }, { status: 404 });
        }

        // Check return window (7 days for most items, 30 days for defective items)
        const deliveredAt = order.deliveredAt || order.createdAt;
        const daysSinceDelivery = Math.floor((new Date() - new Date(deliveredAt)) / (1000 * 60 * 60 * 24));
        const isDefective = reason.toLowerCase().includes('defective') || reason.toLowerCase().includes('damaged');
        const maxReturnDays = isDefective ? 30 : 7;

        if (daysSinceDelivery > maxReturnDays) {
            return NextResponse.json({
                error: `Return window has expired. Returns allowed within ${maxReturnDays} days of delivery.`
            }, { status: 400 });
        }

        // Check if return request already exists
        const existingReturn = await prisma.returnRequest.findUnique({
            where: { orderId_userId: { orderId, userId } }
        });

        if (existingReturn) {
            return NextResponse.json({ error: "Return request already exists for this order" }, { status: 400 });
        }

        // Create return request
        const returnRequest = await prisma.returnRequest.create({
            data: {
                orderId,
                userId,
                reason,
                description: description || null,
                images: images || []
            }
        });

        // Update order status
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: OrderStatus.RETURN_REQUESTED,
                returnRequestedAt: new Date(),
                returnReason: reason
            }
        });

        return NextResponse.json({
            message: "Return request created successfully",
            returnRequest
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

        const returnRequests = await prisma.returnRequest.findMany({
            where: { userId },
            include: {
                order: {
                    include: {
                        orderItems: { include: { product: true } },
                        address: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ returnRequests });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}