import { validateCSRFForRequest } from '@/lib/csrf';

/**
 * CSRF protection middleware for API routes
 * Validates CSRF token for state-changing operations
 * @param {Request} request - The incoming request
 * @returns {Response|null} Error response if CSRF validation fails, null if valid
 */
export default function csrfMiddleware(request) {
  // Only validate for POST, PUT, DELETE, PATCH methods
  const methodsToProtect = ['POST', 'PUT', 'DELETE', 'PATCH'];

  if (methodsToProtect.includes(request.method)) {
    return validateCSRFForRequest(request);
  }

  return null; // No validation needed for GET, etc.
}

/**
 * Higher-order function to wrap API route handlers with CSRF protection
 * @param {Function} handler - The API route handler function
 * @returns {Function} Wrapped handler with CSRF validation
 */
export function withCSRFProtection(handler) {
  return async (request, ...args) => {
    const csrfError = csrfMiddleware(request);
    if (csrfError) {
      return csrfError;
    }

    return handler(request, ...args);
  };
}