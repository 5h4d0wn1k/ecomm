// Environment configuration
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'

// API URLs
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Authentication
export const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET

// Payment
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

// File Upload
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

// Analytics
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID

// Feature flags
export const FEATURES = {
  analytics: !!GA_TRACKING_ID,
  payments: !!STRIPE_PUBLISHABLE_KEY,
  fileUpload: !!CLOUDINARY_CLOUD_NAME,
}