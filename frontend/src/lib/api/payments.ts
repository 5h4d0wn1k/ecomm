import { apiClient } from './client'

export interface CreateOrderData {
  items: Array<{
    productId: number
    quantity: number
    variantId?: number
  }>
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  billingAddress: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  paymentMethod: string
  couponCode?: string
  notes?: string
}

export interface ProcessPaymentData {
  orderId: number
  paymentMethod: string
}

export interface PaymentResult {
  paymentId?: number
  orderId?: string
  amount?: number
  currency?: string
  key?: string
  status: string
  message: string
}

export interface VerifyPaymentData {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export class PaymentAPI {
  /**
   * Create a new order
   */
  static async createOrder(data: CreateOrderData) {
    const response = await apiClient.post('/orders', data)
    return response.data
  }

  /**
   * Process payment for an order
   */
  static async processPayment(data: ProcessPaymentData): Promise<PaymentResult> {
    const response = await apiClient.post('/payments/process', data)
    return response.data.data
  }

  /**
   * Verify Razorpay payment
   */
  static async verifyPayment(data: VerifyPaymentData) {
    const response = await apiClient.post('/payments/verify', data)
    return response.data
  }

  /**
   * Get payment history
   */
  static async getPaymentHistory(page: number = 1, limit: number = 10) {
    const response = await apiClient.get(`/payments/history?page=${page}&limit=${limit}`)
    return response.data.data
  }
}