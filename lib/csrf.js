import crypto from 'crypto';
import { NextResponse } from 'next/server';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Generates a random CSRF token
 * @returns {string} The generated token
 */
export function generateCSRFToken() {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Sets the CSRF token in the response cookies and returns the token
 * @param {NextResponse} response - The NextResponse object
 * @returns {string} The generated token
 */
export function setCSRFToken(response) {
  const token = generateCSRFToken();

  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Allow client to read the cookie
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return token;
}

/**
 * Validates the CSRF token from the request
 * @param {Request} request - The incoming request
 * @returns {boolean} True if valid, false otherwise
 */
export function validateCSRFToken(request) {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get('x-csrf-token');

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken, 'utf8'),
      Buffer.from(headerToken, 'utf8')
    );
  } catch (error) {
    // If lengths don't match, timingSafeEqual throws
    return false;
  }
}

/**
 * Middleware function to validate CSRF token for sensitive operations
 * @param {Request} request - The incoming request
 * @returns {NextResponse|null} Error response if invalid, null if valid
 */
export function validateCSRFForRequest(request) {
  if (!validateCSRFToken(request)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Adds CSRF token to a successful response
 * @param {NextResponse} response - The response object
 * @returns {NextResponse} The response with CSRF token
 */
export function addCSRFTokenToResponse(response) {
  const token = setCSRFToken(response);
  const responseData = response.json ? response.json() : {};

  // If it's a JSON response, add the token to the data
  if (response.json) {
    return NextResponse.json(
      { ...responseData, csrfToken: token },
      {
        status: response.status,
        headers: response.headers,
      }
    );
  }

  return response;
}