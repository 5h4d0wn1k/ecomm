'use client'

import { useState, useEffect } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, Shield, Lock } from 'lucide-react'
import { apiClient } from '@/lib/api/client'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface StripePaymentProps {
  orderId: number
  amount: number
  currency: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
}

function CheckoutForm({ orderId, amount, currency, onSuccess, onError }: StripePaymentProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string>('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setMessage(error.message || 'An error occurred during payment.')
        onError(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment succeeded!')
        onSuccess(paymentIntent.id)
      } else {
        setMessage('Payment processing...')
      }
    } catch (error: any) {
      setMessage('An unexpected error occurred.')
      onError('Payment failed')
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {message && (
        <Alert className={message.includes('succeeded') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.includes('succeeded') ? 'text-green-800' : 'text-red-800'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-600" />
          <span>Secure payment powered by Stripe</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Lock className="w-4 h-4 text-blue-600" />
          <span>256-bit SSL encryption</span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || !elements || isLoading}
        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 text-lg font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay ₹{amount.toLocaleString()} {currency.toUpperCase()}
          </>
        )}
      </Button>
    </form>
  )
}

export default function StripePayment({ orderId, amount, currency, onSuccess, onError }: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    initializePayment()
  }, [orderId])

  const initializePayment = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await apiClient.post('/payments/process', {
        orderId,
        paymentMethod: 'card',
      })

      if (response.data.success) {
        setClientSecret(response.data.data.clientSecret)
      } else {
        setError(response.data.message || 'Failed to initialize payment')
        onError(response.data.message || 'Failed to initialize payment')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to initialize payment'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#ec4899',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        spacingUnit: '2px',
        borderRadius: '6px',
      },
      rules: {
        '.Input': {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        '.Input:focus': {
          borderColor: '#ec4899',
          boxShadow: '0 0 0 1px #ec4899',
        },
      },
    },
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
            <span className="text-gray-600">Initializing payment...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
          <Button
            onClick={initializePayment}
            variant="outline"
            className="w-full mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!clientSecret) {
    return (
      <Card>
        <CardContent className="p-8">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertDescription className="text-yellow-800">
              Unable to initialize payment. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-pink-500" />
          <span>Secure Payment</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm
            orderId={orderId}
            amount={amount}
            currency={currency}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </CardContent>
    </Card>
  )
}