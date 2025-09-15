import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import crypto from "crypto"
import { validateWebhook } from "@/middlewares/validateRazorpayInput"
import { rateLimitWebhook } from "@/middlewares/rateLimit"
import {
    fetchWithTimeout,
    safeLog,
    createErrorResponse,
    createSuccessResponse,
    validateOrderData,
    withTransactionSafety
} from "@/lib/razorpayUtils"

export async function POST(request){
    const startTime = Date.now();

    try {
        // Read raw body since bodyParser is false
        const rawBody = await new Promise((resolve, reject) => {
            let data = '';
            request.on('data', chunk => data += chunk.toString());
            request.on('end', () => resolve(data));
            request.on('error', reject);
        });

        // Rate limiting check
        const rateLimitResult = rateLimitWebhook(request);
        if (!rateLimitResult.allowed) {
            safeLog('warn', 'Webhook rate limit exceeded', {
                ip: request.headers.get('x-forwarded-for') || 'unknown',
                resetTime: rateLimitResult.error.resetTime
            });

            return NextResponse.json(
                createErrorResponse('Rate limit exceeded', 'webhook'),
                {
                    status: 429,
                    headers: {
                        'Retry-After': rateLimitResult.error.retryAfter.toString(),
                        'X-RateLimit-Reset': rateLimitResult.error.resetTime.toString()
                    }
                }
            );
        }

        // Input validation
        const validation = validateWebhook(rawBody);
        if (!validation.isValid) {
            safeLog('warn', 'Invalid webhook payload', {
                errors: validation.errors,
                sanitizedData: validation.sanitizedData,
                ip: request.headers.get('x-forwarded-for') || 'unknown'
            });
            return NextResponse.json(
                createErrorResponse(`Webhook validation failed: ${validation.errors.join(', ')}`, 'webhook_validation'),
                { status: 400 }
            );
        }

        const event = validation.data;
        const signature = request.headers.get('x-razorpay-signature');

        // Verify webhook signature with timing-safe comparison
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('hex');

        if (!signature || !crypto.timingSafeEqual(
            Buffer.from(signature, 'utf8'),
            Buffer.from(expectedSignature, 'utf8')
        )) {
            safeLog('error', 'Invalid webhook signature', {
                eventType: event.event,
                signatureProvided: !!signature
            });
            return NextResponse.json(
                createErrorResponse('Invalid webhook signature', 'signature_verification'),
                { status: 401 }
            );
        }

        const handlePaymentCaptured = async (paymentEntity, orderEntity) => {
            const orderId = paymentEntity.order_id;
            const paymentId = paymentEntity.id;

            // Use order data from webhook payload instead of API call
            const validatedOrder = validateOrderData(orderEntity);

            const { orderIds, userId, appId } = validatedOrder.notes;

            if (appId !== 'davcreations') {
                safeLog('warn', 'Invalid app ID in webhook', { appId, orderId });
                return createSuccessResponse(null, 'Invalid app ID - webhook ignored');
            }

            const orderIdsArray = orderIds.split(',');

            // Process payment capture with transaction safety
            await withTransactionSafety(async () => {
                await prisma.$transaction(async (tx) => {
                    // Mark orders as paid
                    await Promise.all(orderIdsArray.map(async (orderId) => {
                        await tx.order.update({
                            where: { id: orderId },
                            data: {
                                isPaid: true,
                                razorpayPaymentId: paymentId,
                                razorpayOrderId: orderId,
                                razorpaySignature: paymentEntity.signature || '',
                                status: 'PROCESSING'
                            }
                        });
                    }));

                    // Clear the cart
                    await tx.user.update({
                        where: { id: userId },
                        data: { cart: {} }
                    });
                });
            }, 'webhook_payment_captured');

            safeLog('info', 'Payment captured via webhook', {
                orderId,
                paymentId,
                userId,
                orderCount: orderIdsArray.length
            });

            return createSuccessResponse({ orderIds: orderIdsArray }, 'Payment captured successfully');
        };

        const handlePaymentFailed = async (paymentEntity, orderEntity) => {
            const orderId = paymentEntity.order_id;

            // Use order data from webhook payload instead of API call
            const validatedOrder = validateOrderData(orderEntity);

            const { orderIds } = validatedOrder.notes;
            const orderIdsArray = orderIds.split(',');

            // Process payment failure with transaction safety
            await withTransactionSafety(async () => {
                await prisma.$transaction(async (tx) => {
                    // Delete orders on payment failure
                    await Promise.all(orderIdsArray.map(async (orderId) => {
                        await tx.order.delete({
                            where: { id: orderId }
                        });
                    }));
                });
            }, 'webhook_payment_failed');

            safeLog('info', 'Payment failed via webhook', {
                orderId,
                paymentId: paymentEntity.id,
                orderCount: orderIdsArray.length
            });

            return createSuccessResponse({ orderIds: orderIdsArray }, 'Payment failure processed');
        };

        let result;
        switch (event.event) {
            case 'payment.captured': {
                result = await handlePaymentCaptured(event.payload.payment.entity, event.payload.order.entity);
                break;
            }

            case 'payment.failed': {
                result = await handlePaymentFailed(event.payload.payment.entity, event.payload.order.entity);
                break;
            }

            default:
                safeLog('info', 'Unhandled webhook event type', {
                    eventType: event.event,
                    eventId: event.id
                });
                result = createSuccessResponse(null, `Unhandled event type: ${event.event}`);
                break;
        }

        const processingTime = Date.now() - startTime;
        safeLog('info', 'Webhook processed successfully', {
            eventType: event.event,
            processingTime,
            eventId: event.id
        });

        return NextResponse.json(result, { headers: rateLimitResult.headers });

    } catch (error) {
        const processingTime = Date.now() - startTime;
        const isDevelopment = process.env.NODE_ENV === 'development';

        safeLog('error', 'Webhook processing failed', {
            processingTime,
            error: error.message,
            stack: isDevelopment ? error.stack : undefined,
            ip: request.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json(
            createErrorResponse(error, 'webhook_processing', isDevelopment),
            { status: 500 }
        );
    }
}

export const config = {
    api: { bodyParser: false }
}