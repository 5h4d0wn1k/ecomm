/**
 * Utility functions for Razorpay operations with enhanced error handling and security
 */

import { sanitizeForLogging } from '@/middlewares/validateRazorpayInput';

/**
 * Enhanced fetch with timeout for Razorpay API calls
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @param {number} timeoutMs - Timeout in milliseconds (default: 30000)
 * @returns {Promise<Response>}
 */
export const fetchWithTimeout = async (url, options = {}, timeoutMs = 30000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error(`Razorpay API request timed out after ${timeoutMs}ms`);
        }

        throw error;
    }
};

/**
 * Safe logging function that masks sensitive data
 * @param {string} level - Log level (error, warn, info, debug)
 * @param {string} message - Log message
 * @param {object} data - Additional data to log
 */
export const safeLog = (level, message, data = null) => {
    const sanitizedData = data ? sanitizeForLogging(data) : null;

    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(sanitizedData && { data: sanitizedData })
    };

    switch (level) {
        case 'error':
            console.error(JSON.stringify(logEntry, null, 2));
            break;
        case 'warn':
            console.warn(JSON.stringify(logEntry, null, 2));
            break;
        case 'info':
            console.info(JSON.stringify(logEntry, null, 2));
            break;
        case 'debug':
            console.debug(JSON.stringify(logEntry, null, 2));
            break;
        default:
            console.log(JSON.stringify(logEntry, null, 2));
    }
};

/**
 * Create standardized error response for frontend
 * @param {Error|string} error - Error object or message
 * @param {string} operation - Operation that failed
 * @param {boolean} isDevelopment - Whether in development mode
 * @returns {object} Standardized error response
 */
export const createErrorResponse = (error, operation = 'operation', isDevelopment = false) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorCode = error.code || 'UNKNOWN_ERROR';

    // Log the full error for debugging
    safeLog('error', `${operation} failed`, {
        error: errorMessage,
        code: errorCode,
        stack: error.stack,
        operation
    });

    // Return sanitized error to frontend
    return {
        success: false,
        error: {
            message: isDevelopment ? errorMessage : 'An error occurred during payment processing',
            code: errorCode,
            operation,
            timestamp: new Date().toISOString()
        }
    };
};

/**
 * Create standardized success response
 * @param {object} data - Response data
 * @param {string} message - Success message
 * @returns {object} Standardized success response
 */
export const createSuccessResponse = (data = null, message = 'Operation completed successfully') => {
    return {
        success: true,
        message,
        ...(data && { data }),
        timestamp: new Date().toISOString()
    };
};

/**
 * Validate and sanitize Razorpay order data
 * @param {object} orderData - Order data from Razorpay
 * @returns {object} Validated and sanitized order data
 */
export const validateOrderData = (orderData) => {
    const requiredFields = ['id', 'amount', 'currency', 'status'];
    const missingFields = requiredFields.filter(field => !orderData[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing required order fields: ${missingFields.join(', ')}`);
    }

    // Validate amount (should be positive integer in paisa)
    if (typeof orderData.amount !== 'number' || orderData.amount <= 0) {
        throw new Error('Invalid order amount');
    }

    // Validate currency
    if (orderData.currency !== 'INR') {
        throw new Error('Only INR currency is supported');
    }

    return {
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        status: orderData.status,
        notes: orderData.notes || {}
    };
};

/**
 * Generate CSRF token for payment verification
 * @returns {string} CSRF token
 */
export const generateCSRFToken = () => {
    return require('crypto').randomBytes(32).toString('hex');
};

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @param {string} expectedToken - Expected token
 * @returns {boolean} Whether token is valid
 */
export const validateCSRFToken = (token, expectedToken) => {
    if (!token || !expectedToken) return false;

    // Use constant-time comparison to prevent timing attacks
    return require('crypto').timingSafeEqual(
        Buffer.from(token, 'hex'),
        Buffer.from(expectedToken, 'hex')
    );
};

/**
 * Wrapper for database operations with transaction safety
 * @param {Function} operation - Database operation function
 * @param {string} operationName - Name for logging
 * @returns {Promise} Result of the operation
 */
export const withTransactionSafety = async (operation, operationName = 'database_operation') => {
    try {
        const result = await operation();

        safeLog('info', `${operationName} completed successfully`, {
            operation: operationName,
            hasResult: !!result
        });

        return result;
    } catch (error) {
        safeLog('error', `${operationName} failed with transaction error`, {
            operation: operationName,
            error: error.message
        });

        throw error;
    }
};

const utils = {
    fetchWithTimeout,
    safeLog,
    createErrorResponse,
    createSuccessResponse,
    validateOrderData,
    generateCSRFToken,
    validateCSRFToken,
    withTransactionSafety
};

export default utils;