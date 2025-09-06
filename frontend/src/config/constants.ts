// Application constants
export const APP_CONFIG = {
  name: 'E-Commerce Platform',
  version: '1.0.0',
  description: 'Multi-vendor e-commerce platform',
}

// API constants
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
}

// Pagination constants
export const PAGINATION_CONFIG = {
  defaultLimit: 20,
  maxLimit: 100,
}

// File upload constants
export const UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
}

// Payment constants
export const PAYMENT_CONFIG = {
  currency: 'USD',
  supportedMethods: ['card', 'paypal'],
}