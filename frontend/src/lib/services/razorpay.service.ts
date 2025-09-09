import { PaymentAPI, PaymentResult } from '@/lib/api/payments'

declare global {
  interface Window {
    Razorpay: any
  }
}

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
  }
  handler: (response: RazorpayResponse) => void
  modal?: {
    ondismiss?: () => void
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export class RazorpayService {
  private static razorpay: any = null

  /**
   * Load Razorpay script dynamically
   */
  static async loadRazorpay(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Razorpay script'))
      document.body.appendChild(script)
    })
  }

  /**
   * Initialize Razorpay checkout
   */
  static async initializeCheckout(
    orderId: number,
    paymentMethod: string,
    onSuccess: (response: RazorpayResponse) => void,
    onFailure: (error: any) => void,
    onDismiss?: () => void,
    userDetails?: {
      name?: string
      email?: string
      contact?: string
    }
  ): Promise<void> {
    try {
      // Load Razorpay script if not already loaded
      await this.loadRazorpay()

      // Process payment to get Razorpay order details
      const paymentResult: PaymentResult = await PaymentAPI.processPayment({
        orderId,
        paymentMethod,
      })

      if (paymentResult.status !== 'pending' || !paymentResult.orderId) {
        throw new Error('Failed to create Razorpay order')
      }

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: paymentResult.key!,
        amount: paymentResult.amount!,
        currency: paymentResult.currency!,
        order_id: paymentResult.orderId,
        name: 'E-Commerce Store',
        description: `Order #${orderId}`,
        prefill: {
          name: userDetails?.name || 'Customer Name',
          email: userDetails?.email || 'customer@example.com',
          contact: userDetails?.contact || '+91xxxxxxxxxx',
        },
        notes: {
          orderId: orderId.toString(),
        },
        theme: {
          color: '#f97316', // Orange color matching the theme
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment on backend
            await PaymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            onSuccess(response)
          } catch (error) {
            console.error('Payment verification failed:', error)
            onFailure(error)
          }
        },
        modal: {
          ondismiss: onDismiss,
        },
      }

      // Create and open Razorpay checkout
      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error) {
      console.error('Razorpay initialization failed:', error)
      onFailure(error)
    }
  }

  /**
   * Handle successful payment
   */
  static async handlePaymentSuccess(response: RazorpayResponse): Promise<void> {
    console.log('Payment successful:', response)

    // The payment verification is already handled in the handler above
    // Additional success handling can be done here if needed
  }

  /**
   * Handle payment failure
   */
  static async handlePaymentFailure(error: any): Promise<void> {
    console.error('Payment failed:', error)

    // Handle payment failure - could show error message, retry, etc.
    alert('Payment failed. Please try again.')
  }

  /**
   * Handle payment modal dismissal
   */
  static async handlePaymentDismiss(): Promise<void> {
    console.log('Payment modal dismissed')

    // Handle when user closes the payment modal without completing payment
    // Could show a message asking if they want to retry
  }
}