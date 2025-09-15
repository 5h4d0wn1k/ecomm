/**
 * Input validation middleware for Razorpay API endpoints
 * Provides comprehensive validation for payment-related data
 */

// Validation patterns
const PATTERNS = {
    RAZORPAY_ORDER_ID: /^order_[a-zA-Z0-9]+$/,
    RAZORPAY_PAYMENT_ID: /^pay_[a-zA-Z0-9]+$/,
    RAZORPAY_SIGNATURE: /^[a-zA-Z0-9+/=]{43,}$/, // Base64 encoded signature
    USER_ID: /^[a-zA-Z0-9_-]+$/,
    APP_ID: /^[a-zA-Z0-9_-]+$/,
    ORDER_IDS: /^[a-zA-Z0-9_,]+$/, // Comma-separated order IDs
};

/**
 * Validates Razorpay payment verification input
 */
const validatePaymentVerificationInput = (data) => {
    const errors = [];
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    if (!razorpay_order_id || typeof razorpay_order_id !== 'string') {
        errors.push('razorpay_order_id is required and must be a string');
    } else if (!PATTERNS.RAZORPAY_ORDER_ID.test(razorpay_order_id)) {
        errors.push('Invalid razorpay_order_id format');
    }

    if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string') {
        errors.push('razorpay_payment_id is required and must be a string');
    } else if (!PATTERNS.RAZORPAY_PAYMENT_ID.test(razorpay_payment_id)) {
        errors.push('Invalid razorpay_payment_id format');
    }

    if (!razorpay_signature || typeof razorpay_signature !== 'string') {
        errors.push('razorpay_signature is required and must be a string');
    } else if (!PATTERNS.RAZORPAY_SIGNATURE.test(razorpay_signature)) {
        errors.push('Invalid razorpay_signature format');
    }

    return errors;
};

/**
 * Validates Razorpay webhook payload
 */
const validateWebhookPayload = (event) => {
    const errors = [];

    if (!event || typeof event !== 'object') {
        errors.push('Invalid webhook payload structure');
        return errors;
    }

    if (!event.event || typeof event.event !== 'string') {
        errors.push('event type is required and must be a string');
    }

    if (!event.payload || typeof event.payload !== 'object') {
        errors.push('payload is required and must be an object');
        return errors;
    }

    // Validate payment entity for payment events
    if (event.event.startsWith('payment.')) {
        const paymentEntity = event.payload.payment?.entity;
        if (!paymentEntity) {
            errors.push('payment.entity is required for payment events');
            return errors;
        }

        if (!paymentEntity.id || typeof paymentEntity.id !== 'string') {
            errors.push('payment.entity.id is required and must be a string');
        }

        if (!paymentEntity.order_id || typeof paymentEntity.order_id !== 'string') {
            errors.push('payment.entity.order_id is required and must be a string');
        }

        if (typeof paymentEntity.amount !== 'number' || paymentEntity.amount <= 0) {
            errors.push('payment.entity.amount must be a positive number');
        }

        if (!paymentEntity.currency || typeof paymentEntity.currency !== 'string') {
            errors.push('payment.entity.currency is required and must be a string');
        }

        if (!paymentEntity.status || typeof paymentEntity.status !== 'string') {
            errors.push('payment.entity.status is required and must be a string');
        }
    }

    return errors;
};

/**
 * Sanitizes sensitive data from request body for logging
 */
export const sanitizeForLogging = (data) => {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };

    // Mask sensitive fields
    const sensitiveFields = [
        'razorpay_signature',
        'signature',
        'key_secret',
        'webhook_secret',
        'authorization',
        'card',
        'bank_account'
    ];

    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            if (typeof sanitized[field] === 'string') {
                sanitized[field] = sanitized[field].substring(0, 4) + '****';
            } else if (typeof sanitized[field] === 'object') {
                sanitized[field] = '[REDACTED]';
            }
        }
    });

    return sanitized;
};

/**
 * Middleware function for payment verification endpoint
 */
export const validatePaymentVerification = (request) => {
    try {
        const body = request.json ? request.json() : request.body;
        const errors = validatePaymentVerificationInput(body);

        if (errors.length > 0) {
            return {
                isValid: false,
                errors,
                sanitizedData: sanitizeForLogging(body)
            };
        }

        return {
            isValid: true,
            data: body,
            sanitizedData: sanitizeForLogging(body)
        };
    } catch (error) {
        return {
            isValid: false,
            errors: ['Invalid JSON payload'],
            sanitizedData: null
        };
    }
};

/**
 * Middleware function for webhook endpoint
 */
export const validateWebhook = (rawBody) => {
    try {
        let event;

        try {
            event = JSON.parse(rawBody);
        } catch (parseError) {
            return {
                isValid: false,
                errors: ['Invalid JSON in webhook payload'],
                sanitizedData: null
            };
        }

        const errors = validateWebhookPayload(event);

        if (errors.length > 0) {
            return {
                isValid: false,
                errors,
                sanitizedData: sanitizeForLogging(event)
            };
        }

        return {
            isValid: true,
            data: event,
            sanitizedData: sanitizeForLogging(event)
        };
    } catch (error) {
        return {
            isValid: false,
            errors: ['Failed to process webhook payload'],
            sanitizedData: null
        };
    }
};

export default {
    validatePaymentVerification,
    validateWebhook,
    sanitizeForLogging
};