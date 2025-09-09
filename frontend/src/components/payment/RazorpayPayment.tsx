'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, Smartphone, Building } from 'lucide-react'
import { PaymentAPI } from '@/lib/api/payments'

interface RazorpayPaymentProps {
  orderId: number
  amount: number
  currency: string
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function RazorpayPayment({
  orderId,
  amount,
  currency,
  onSuccess,
  onError
}: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => setRazorpayLoaded(true)
    script.onerror = () => onError('Failed to load Razorpay SDK')
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [onError])

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      onError('Razorpay SDK not loaded')
      return
    }

    setIsLoading(true)

    try {
      // Get order details from backend
      const orderResponse = await PaymentAPI.getOrderDetails(orderId)
      const orderData = orderResponse.data

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'DAV Creations',
        description: 'Multi-Vendor E-Commerce Platform',
        order_id: orderData.razorpayOrderId,
        handler: function (response: any) {
          // Handle successful payment
          console.log('Payment successful:', response)
          onSuccess(response.razorpay_payment_id)
        },
        prefill: {
          name: orderData.customerName,
          email: orderData.customerEmail,
          contact: orderData.customerPhone,
        },
        notes: {
          orderId: orderId.toString(),
        },
        theme: {
          color: '#ec4899',
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed')
            setIsLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)

      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error)
        onError(response.error.description || 'Payment failed')
        setIsLoading(false)
      })

      rzp.open()
    } catch (error) {
      console.error('Error initiating payment:', error)
      onError('Failed to initiate payment')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-medium">#{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-bold text-lg">₹{amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Currency:</span>
            <span className="font-medium">{currency}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-900">Available Payment Methods</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
            <CreditCard className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-medium text-sm">Credit/Debit Cards</p>
              <p className="text-xs text-gray-600">Visa, Mastercard, RuPay</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
            <Smartphone className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-medium text-sm">UPI</p>
              <p className="text-xs text-gray-600">Google Pay, PhonePe, Paytm</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
            <Building className="w-6 h-6 text-purple-500" />
            <div>
              <p className="font-medium text-sm">Net Banking</p>
              <p className="text-xs text-gray-600">All major banks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Now Button */}
      <div className="text-center">
        <Button
          onClick={handlePayment}
          disabled={isLoading || !razorpayLoaded}
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Pay ₹{amount.toLocaleString()} Now
            </>
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <span className="text-sm font-medium text-green-800">Secure Payment</span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          Your payment is secured with 256-bit SSL encryption and processed by Razorpay, India's most trusted payment gateway.
        </p>
      </div>
    </div>
  )
}