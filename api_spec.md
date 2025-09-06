# API Architecture Specification for Multi-Vendor E-Commerce Platform

## Overview
This document specifies the RESTful API architecture for the multi-vendor e-commerce platform. All endpoints follow REST conventions with JSON request/response formats.

## Base URL
```
https://api.ecommerce-platform.com/v1
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All responses follow this structure:
```json
{
  "success": true|false,
  "data": { ... } | null,
  "message": "string",
  "errors": [ ... ] | null,
  "pagination": { ... } | null
}
```

## Error Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Internal Server Error

---

## 1. Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer"
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

### POST /auth/refresh
Refresh JWT token.

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here"
  },
  "message": "Token refreshed successfully"
}
```

### POST /auth/logout
Logout user (invalidate token).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### POST /auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "new_password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 2. User Management Endpoints

### GET /users/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "customer",
    "isActive": true,
    "emailVerified": true
  }
}
```

### PUT /users/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Profile updated successfully"
}
```

### PUT /users/change-password
Change user password.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 3. Vendor Management Endpoints

### POST /vendors/register
Register as a vendor.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "businessName": "My Store",
  "businessDescription": "Description of business",
  "businessAddress": "123 Main St, City, State 12345",
  "businessPhone": "+1234567890",
  "taxId": "123456789"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Vendor registration submitted"
}
```

### GET /vendors/profile
Get vendor profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "businessName": "My Store",
    "businessDescription": "Description",
    "businessAddress": "Address",
    "isVerified": true,
    "commissionRate": 10.00
  }
}
```

### PUT /vendors/profile
Update vendor profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "businessName": "Updated Store Name",
  "businessDescription": "Updated description"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Vendor profile updated"
}
```

---

## 4. Product Management Endpoints

### GET /products
Get products with filtering and pagination.

**Query Parameters:**
- page: 1
- limit: 20
- category: 1
- vendor: 1
- search: "laptop"
- min_price: 100
- max_price: 1000
- sort: "price_asc"

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "High-performance laptop",
      "price": 999.99,
      "images": ["url1", "url2"],
      "category": { "id": 1, "name": "Electronics" },
      "vendor": { "id": 1, "businessName": "Tech Store" },
      "stockQuantity": 50,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### GET /products/{id}
Get product details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop",
    "description": "Detailed description",
    "price": 999.99,
    "images": ["url1", "url2"],
    "variants": [
      {
        "id": 1,
        "name": "Color",
        "value": "Black",
        "priceModifier": 0
      }
    ],
    "reviews": {
      "averageRating": 4.5,
      "totalReviews": 25
    }
  }
}
```

### POST /products
Create new product (Vendor/Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "categoryId": 1,
  "stockQuantity": 100,
  "images": ["url1", "url2"],
  "sku": "PROD-001"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Product created successfully"
}
```

### PUT /products/{id}
Update product (Vendor/Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 109.99
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Product updated successfully"
}
```

### DELETE /products/{id}
Delete product (Vendor/Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 5. Category Management Endpoints

### GET /categories
Get all categories.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices",
      "parentId": null,
      "subcategories": [
        {
          "id": 2,
          "name": "Laptops",
          "parentId": 1
        }
      ]
    }
  ]
}
```

### POST /categories
Create category (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description",
  "parentId": null
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Category created successfully"
}
```

---

## 6. Order Management Endpoints

### GET /orders
Get user orders.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- page: 1
- limit: 10
- status: "pending"

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderNumber": "ORD-001",
      "status": "pending",
      "totalAmount": 1099.99,
      "createdAt": "2023-01-01T10:00:00Z",
      "items": [
        {
          "id": 1,
          "product": { "id": 1, "name": "Laptop" },
          "quantity": 1,
          "unitPrice": 999.99
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

### GET /orders/{id}
Get order details.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-001",
    "status": "pending",
    "subtotal": 999.99,
    "taxAmount": 100.00,
    "shippingAmount": 50.00,
    "totalAmount": 1149.99,
    "shippingAddress": { ... },
    "billingAddress": { ... },
    "items": [ ... ],
    "payments": [ ... ]
  }
}
```

### POST /orders
Create new order.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 1,
      "variantId": null
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "US"
  },
  "billingAddress": { ... },
  "paymentMethod": "credit_card"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Order created successfully"
}
```

### PUT /orders/{id}/status
Update order status (Vendor/Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Order status updated"
}
```

---

## 7. Payment Endpoints

### POST /payments/process
Process payment for order.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "orderId": 1,
  "paymentMethod": "stripe",
  "paymentToken": "tok_123456789"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "paymentId": 1,
    "status": "completed",
    "transactionId": "txn_123456789"
  },
  "message": "Payment processed successfully"
}
```

### GET /payments/{id}
Get payment details.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderId": 1,
    "amount": 1149.99,
    "status": "completed",
    "transactionId": "txn_123456789"
  }
}
```

---

## 8. Review Endpoints

### GET /products/{id}/reviews
Get product reviews.

**Query Parameters:**
- page: 1
- limit: 10

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": { "id": 1, "firstName": "John" },
      "rating": 5,
      "title": "Great product",
      "comment": "Excellent quality",
      "isVerified": true,
      "createdAt": "2023-01-01T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### POST /products/{id}/reviews
Create product review.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "rating": 5,
  "title": "Great product",
  "comment": "Excellent quality and fast shipping"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Review submitted successfully"
}
```

---

## 9. Wishlist Endpoints

### GET /wishlist
Get user wishlist.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Laptop",
        "price": 999.99,
        "images": ["url1"]
      },
      "addedAt": "2023-01-01T10:00:00Z"
    }
  ]
}
```

### POST /wishlist
Add product to wishlist.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "productId": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product added to wishlist"
}
```

### DELETE /wishlist/{productId}
Remove product from wishlist.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product removed from wishlist"
}
```

---

## 10. Coupon Endpoints

### GET /coupons/validate
Validate coupon code.

**Query Parameters:**
- code: "SAVE10"
- orderAmount: 100

**Response (200):**
```json
{
  "success": true,
  "data": {
    "code": "SAVE10",
    "discountType": "percentage",
    "discountValue": 10,
    "minimumOrderAmount": 50,
    "isValid": true,
    "discountAmount": 10.00
  }
}
```

### POST /coupons
Create coupon (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "code": "SAVE10",
  "description": "10% off orders over $50",
  "discountType": "percentage",
  "discountValue": 10,
  "minimumOrderAmount": 50,
  "validFrom": "2023-01-01T00:00:00Z",
  "validUntil": "2023-12-31T23:59:59Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Coupon created successfully"
}
```

---

## 11. Vendor Dashboard Endpoints

### GET /vendor/dashboard
Get vendor dashboard data.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalProducts": 25,
    "totalOrders": 150,
    "totalRevenue": 15000.00,
    "pendingOrders": 5,
    "lowStockProducts": 3,
    "recentOrders": [ ... ],
    "earnings": {
      "thisMonth": 2500.00,
      "lastMonth": 2200.00,
      "pending": 500.00
    }
  }
}
```

### GET /vendor/products
Get vendor's products.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

### GET /vendor/orders
Get vendor's orders.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

### GET /vendor/earnings
Get vendor earnings.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEarned": 15000.00,
    "pendingPayout": 500.00,
    "lastPayout": {
      "amount": 1000.00,
      "date": "2023-01-15T00:00:00Z"
    },
    "monthlyEarnings": [ ... ]
  }
}
```

---

## 12. Admin Endpoints

### GET /admin/dashboard
Get admin dashboard data.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "totalVendors": 50,
    "totalProducts": 5000,
    "totalOrders": 2500,
    "totalRevenue": 250000.00,
    "recentOrders": [ ... ],
    "topProducts": [ ... ],
    "userRegistrations": [ ... ]
  }
}
```

### GET /admin/users
Get all users (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- page: 1
- limit: 20
- role: "vendor"
- search: "john"

**Response (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

### PUT /admin/users/{id}/status
Update user status (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User status updated"
}
```

### GET /admin/vendors/pending
Get pending vendor approvals (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": { "id": 1, "email": "vendor@example.com" },
      "businessName": "New Store",
      "businessDescription": "Description",
      "submittedAt": "2023-01-01T10:00:00Z"
    }
  ]
}
```

### PUT /admin/vendors/{id}/approve
Approve vendor application (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vendor approved successfully"
}
```

---

## 13. Notification Endpoints

### GET /notifications
Get user notifications.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- page: 1
- limit: 20
- unreadOnly: true

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "order_status",
      "title": "Order Shipped",
      "message": "Your order ORD-001 has been shipped",
      "isRead": false,
      "createdAt": "2023-01-01T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### PUT /notifications/{id}/read
Mark notification as read.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### PUT /notifications/mark-all-read
Mark all notifications as read.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Rate Limiting
- General endpoints: 100 requests per minute
- Authentication endpoints: 10 requests per minute
- File upload endpoints: 20 requests per minute

## Caching Strategy
- Product listings: 5 minutes
- Product details: 10 minutes
- User profile: 30 minutes
- Categories: 1 hour

## API Versioning
- Current version: v1
- Future versions will be added as /v2, /v3, etc.
- Backward compatibility maintained for 2 major versions