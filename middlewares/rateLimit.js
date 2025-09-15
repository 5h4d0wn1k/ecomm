// Simple in-memory rate limiter for return requests
// In production, use Redis or a proper rate limiting service

const rateLimitMap = new Map();

export function checkRateLimit(userId, action = 'return', maxRequests = 5, windowMs = 24 * 60 * 60 * 1000) {
    const key = `${userId}_${action}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this user/action
    let userRequests = rateLimitMap.get(key) || [];

    // Filter out requests outside the current window
    userRequests = userRequests.filter(timestamp => timestamp > windowStart);

    // Check if under limit
    if (userRequests.length >= maxRequests) {
        return {
            allowed: false,
            remainingTime: Math.ceil((userRequests[0] + windowMs - now) / 1000 / 60) // minutes
        };
    }

    // Add current request
    userRequests.push(now);
    rateLimitMap.set(key, userRequests);

    return { allowed: true };
}

// Rate limiting for webhooks based on IP address
export function rateLimitWebhook(request, maxRequests = 100, windowMs = 15 * 60 * 1000) { // 100 requests per 15 minutes
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const key = `webhook_${ip}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this IP
    let requests = rateLimitMap.get(key) || [];

    // Filter out requests outside the current window
    requests = requests.filter(timestamp => timestamp > windowStart);

    // Check if under limit
    if (requests.length >= maxRequests) {
        const resetTime = requests[0] + windowMs;
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        return {
            allowed: false,
            error: {
                resetTime,
                retryAfter
            },
            headers: {
                'X-RateLimit-Limit': maxRequests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': resetTime.toString()
            }
        };
    }

    // Add current request
    requests.push(now);
    rateLimitMap.set(key, requests);

    const remaining = maxRequests - requests.length;
    const resetTime = requests[0] + windowMs;

    return {
        allowed: true,
        headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': resetTime.toString()
        }
    };
}

// Clean up old entries periodically (simple cleanup)
setInterval(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    for (const [key, requests] of rateLimitMap.entries()) {
        const filtered = requests.filter(timestamp => timestamp > oneDayAgo);
        if (filtered.length === 0) {
            rateLimitMap.delete(key);
        } else {
            rateLimitMap.set(key, filtered);
        }
    }
}, 60 * 60 * 1000); // Clean up every hour