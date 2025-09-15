import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { validatePaymentVerification } from "@/middlewares/validateRazorpayInput";
import { rateLimitWebhook as rateLimitPaymentVerification } from "@/middlewares/rateLimit";
import {
    safeLog,
    createErrorResponse,
    createSuccessResponse,
    withTransactionSafety
} from "@/lib/razorpayUtils";

export async function POST(request) {
    const startTime = Date.now();

    try {
        // Rate limiting check
        const rateLimitResult = rateLimitPaymentVerification(request);
        if (!rateLimitResult.allowed) {
            safeLog('warn', 'Payment verification rate limit exceeded', {
                ip: request.headers.get('x-forwarded-for') || 'unknown',
                resetTime: rateLimitResult.error.resetTime
            });

            return NextResponse.json(
                createErrorResponse('Rate limit exceeded', 'payment_verification'),
                {
                    status: 429,
                    headers: {
                        'Retry-After': rateLimitResult.error.retryAfter.toString(),
                        'X-RateLimit-Reset': rateLimitResult.error.resetTime.toString()
                    }
                }
            );
        }

        // CSRF protection - validate origin
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');
        const allowedOrigins = [
            process.env.NEXT_PUBLIC_BASE_URL,
            'http://localhost:3000',
            'https://localhost:3000'
        ].filter(Boolean);

        const isValidOrigin = allowedOrigins.some(allowedOrigin => {
            if (origin) return origin.startsWith(allowedOrigin);
            if (referer) return referer.startsWith(allowedOrigin);
            return false;
        });

        if (!isValidOrigin) {
            safeLog('warn', 'CSRF protection triggered - invalid origin', {
                origin,
                referer,
                ip: request.headers.get('x-forwarded-for') || 'unknown'
            });
            return NextResponse.json(
                createErrorResponse('Invalid request origin', 'csrf_protection'),
                { status: 403 }
            );
        }

        // Authentication check
        const { userId } = getAuth(request);
        if (!userId) {
            safeLog('warn', 'Unauthorized payment verification attempt', {
                ip: request.headers.get('x-forwarded-for') || 'unknown'
            });
            return NextResponse.json(
                createErrorResponse('Not authorized', 'authentication'),
                { status: 401 }
            );
        }

        // Input validation
        const validation = validatePaymentVerification(request);
        if (!validation.isValid) {
            safeLog('warn', 'Invalid payment verification input', {
                userId,
                errors: validation.errors,
                sanitizedData: validation.sanitizedData
            });
            return NextResponse.json(
                createErrorResponse(`Validation failed: ${validation.errors.join(', ')}`, 'input_validation'),
                { status: 400 }
            );
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validation.data;

        // Verify payment signature with timing-safe comparison
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (!crypto.timingSafeEqual(
            Buffer.from(razorpay_signature, 'utf8'),
            Buffer.from(expectedSign, 'utf8')
        )) {
            safeLog('error', 'Payment signature verification failed', {
                userId,
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id
            });
            return NextResponse.json(
                createErrorResponse('Payment verification failed', 'signature_verification'),
                { status: 400 }
            );
        }

        // Database operations with transaction safety
        const result = await withTransactionSafety(async () => {
            // Find orders by razorpayOrderId
            const orders = await prisma.order.findMany({
                where: {
                    razorpayOrderId: razorpay_order_id,
                    userId: userId // Ensure user owns the orders
                }
            });

            if (orders.length === 0) {
                throw new Error('Orders not found');
            }

            // Check if already verified
            if (orders[0].isPaid) {
                return { alreadyVerified: true, orderIds: orders.map(o => o.id) };
            }

            // Update orders with payment details in a transaction
            await prisma.$transaction(async (tx) => {
                // Update all orders
                await Promise.all(orders.map(async (order) => {
                    await tx.order.update({
                        where: { id: order.id },
                        data: {
                            isPaid: true,
                            razorpayPaymentId: razorpay_payment_id,
                            razorpaySignature: razorpay_signature,
                            status: 'PROCESSING'
                        }
                    });
                }));

                // Clear user's cart
                await tx.user.update({
                    where: { id: userId },
                    data: { cart: {} }
                });
            });

            return { orderIds: orders.map(o => o.id) };
        }, 'payment_verification_transaction');

        const processingTime = Date.now() - startTime;

        if (result.alreadyVerified) {
            safeLog('info', 'Payment already verified', {
                userId,
                orderIds: result.orderIds,
                processingTime
            });
            return NextResponse.json(
                createSuccessResponse({ orderIds: result.orderIds }, 'Payment already verified'),
                { headers: rateLimitResult.headers }
            );
        }

        safeLog('info', 'Payment verified successfully', {
            userId,
            orderIds: result.orderIds,
            processingTime
        });

        return NextResponse.json(
            createSuccessResponse({ orderIds: result.orderIds }, 'Payment verified successfully'),
            { headers: rateLimitResult.headers }
        );

    } catch (error) {
        const processingTime = Date.now() - startTime;

        // Don't expose internal errors in production
        const isDevelopment = process.env.NODE_ENV === 'development';

        safeLog('error', 'Payment verification failed', {
            userId: request.headers.get('x-user-id') || 'unknown',
            processingTime,
            error: error.message,
            stack: isDevelopment ? error.stack : undefined
        });

        return NextResponse.json(
            createErrorResponse(error, 'payment_verification', isDevelopment),
            { status: 500 }
        );
    }
}