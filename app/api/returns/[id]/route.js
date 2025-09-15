import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ReturnStatus, OrderStatus } from "@prisma/client";

export async function PUT(request, { params }) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: "not authorized" }, { status: 401 });
        }

        const { id } = params;
        const { status, adminNote } = await request.json();

        // Validate status
        if (!Object.values(ReturnStatus).includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // Get return request with order details
        const returnRequest = await prisma.returnRequest.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        store: true,
                        user: true
                    }
                }
            }
        });

        if (!returnRequest) {
            return NextResponse.json({ error: "Return request not found" }, { status: 404 });
        }

        // Check if user is admin or the store owner
        const isAdmin = await prisma.user.findFirst({
            where: { id: userId, role: 'admin' }
        });

        const isStoreOwner = returnRequest.order.store.userId === userId;

        if (!isAdmin && !isStoreOwner) {
            return NextResponse.json({ error: "not authorized to update this return" }, { status: 403 });
        }

        // Update return request status
        const updatedReturnRequest = await prisma.returnRequest.update({
            where: { id },
            data: {
                status,
                updatedAt: new Date()
            }
        });

        // Update order status based on return status
        let newOrderStatus = returnRequest.order.status;

        if (status === ReturnStatus.APPROVED) {
            newOrderStatus = OrderStatus.RETURN_APPROVED;
        } else if (status === ReturnStatus.REJECTED) {
            newOrderStatus = OrderStatus.RETURN_REJECTED;
        } else if (status === ReturnStatus.PROCESSED) {
            newOrderStatus = OrderStatus.RETURNED;
        }

        await prisma.order.update({
            where: { id: returnRequest.orderId },
            data: {
                status: newOrderStatus,
                returnApprovedAt: status === ReturnStatus.APPROVED ? new Date() : undefined,
                returnRejectedAt: status === ReturnStatus.REJECTED ? new Date() : undefined
            }
        });

        return NextResponse.json({
            message: "Return status updated successfully",
            returnRequest: updatedReturnRequest
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request, { params }) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: "not authorized" }, { status: 401 });
        }

        const { id } = params;

        const returnRequest = await prisma.returnRequest.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        orderItems: { include: { product: true } },
                        address: true,
                        store: true
                    }
                },
                user: true
            }
        });

        if (!returnRequest) {
            return NextResponse.json({ error: "Return request not found" }, { status: 404 });
        }

        // Check if user owns the return request or is admin/store owner
        const isAdmin = await prisma.user.findFirst({
            where: { id: userId, role: 'admin' }
        });

        const isStoreOwner = returnRequest.order.store.userId === userId;
        const isOwner = returnRequest.userId === userId;

        if (!isAdmin && !isStoreOwner && !isOwner) {
            return NextResponse.json({ error: "not authorized" }, { status: 403 });
        }

        return NextResponse.json({ returnRequest });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}