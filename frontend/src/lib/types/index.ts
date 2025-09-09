// User types
export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  role: 'customer' | 'vendor' | 'admin' | 'super_admin'
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Vendor {
  id: number
  userId: number
  businessName: string
  businessDescription?: string
  businessAddress: string
  businessPhone?: string
  taxId?: string
  commissionRate: number
  status: 'pending' | 'approved' | 'suspended' | 'rejected'
  totalSales: number
  rating: number
  isVerified: boolean
  createdAt: string
  updatedAt: string
  user: User
}

// Product types
export interface Product {
  id: number
  vendorId: number
  categoryId: number
  name: string
  slug: string
  description?: string
  shortDescription?: string
  sku: string
  price: number
  compareAtPrice?: number
  costPrice?: number
  stockQuantity: number
  minStockLevel: number
  weight?: number
  dimensions?: Record<string, number>
  images: string[]
  tags: string[]
  status: 'draft' | 'active' | 'archived'
  isActive: boolean
  isFeatured: boolean
  requiresShipping: boolean
  seoTitle?: string
  seoDescription?: string
  createdAt: string
  updatedAt: string
  vendor: Vendor
  category: Category
  variants?: ProductVariant[]
  reviews?: Review[]
  // Additional properties for compare functionality
  specifications?: Record<string, string>
  features?: string[]
  rating?: number
  reviewCount?: number
  originalPrice?: number
  inStock?: boolean
  brand?: string
  image?: string // Convenience property, maps to images[0]
}

export interface ProductVariant {
  id: number
  productId: number
  name: string
  value: string
  skuSuffix?: string
  priceModifier: number
  stockQuantity: number
  isActive: boolean
  sortOrder: number
  createdAt: string
}

// Category types
export interface Category {
  id: number
  name: string
  description?: string
  parentId?: number
  slug: string
  imageUrl?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  parent?: Category
  children?: Category[]
  products?: Product[]
}

// Order types
export interface Order {
  id: number
  userId: number
  orderNumber: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  shippingAddress: Record<string, string | number>
  billingAddress: Record<string, string | number>
  paymentMethod?: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  notes?: string
  couponCode?: string
  shiprocketOrderId?: number
  trackingNumber?: string
  createdAt: string
  updatedAt: string
  user: User
  orderItems: OrderItem[]
  payments?: Payment[]
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  vendorId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  productSnapshot: Record<string, string | number | boolean>
  product: Product
  vendor: Vendor
}

// Payment types
export interface Payment {
  id: number
  orderId: number
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  transactionId?: string
  paymentMethod: string
  paymentGateway?: string
  gatewayResponse?: Record<string, string | number | boolean>
  createdAt: string
  updatedAt: string
}

// Review types
export interface Review {
  id: number
  productId: number
  userId: number
  orderId?: number
  rating: number
  title?: string
  comment?: string
  isVerified: boolean
  isApproved: boolean
  createdAt: string
  updatedAt: string
  user: User
  product: Product
}

// Cart types
export interface CartItem {
  id: string
  productId: number
  variantId?: number
  quantity: number
  product: Product
  variant?: ProductVariant
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  total: number
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Auth response types
export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
  role: 'customer' | 'vendor'
}

export interface ProductForm {
  name: string
  description?: string
  shortDescription?: string
  price: number
  compareAtPrice?: number
  costPrice?: number
  sku: string
  stockQuantity: number
  minStockLevel: number
  categoryId: number
  images: string[]
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  requiresShipping: boolean
  seoTitle?: string
  seoDescription?: string
}

// Filter types
export interface ProductFilters {
  category?: number
  vendor?: number
  minPrice?: number
  maxPrice?: number
  search?: string
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular' | 'created_desc' | 'name_asc' | 'name_desc' | 'rating_desc' | 'discount_desc'
  inStock?: boolean
  rating?: number
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}