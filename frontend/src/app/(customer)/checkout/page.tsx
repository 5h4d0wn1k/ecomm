'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin,
  CreditCard,
  Truck,
  Check,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Shield,
  Lock,
  Loader2,
  Clock,
  Package
} from 'lucide-react'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartItems, useCartStore, useCartSubtotal, useCartTax, useCartTotal } from '@/lib/stores/cart-store'
import { useIsAuthenticated } from '@/lib/stores/auth-store'
import { PaymentAPI, CreateOrderData } from '@/lib/api/payments'
import RazorpayPayment from '@/components/payment/RazorpayPayment'

type Address = {
  id: string
  type: 'home' | 'work' | 'other'
  name: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

type PaymentMethod = {
  id: string
  type: 'card' | 'upi' | 'netbanking' | 'cod'
  name: string
  details: string
  isDefault: boolean
}

type ShippingMethod = {
  id: string
  name: string
  description: string
  cost: number
  estimatedDays: string
  isDefault: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()
  const items = useCartItems()
  const { clearCart } = useCartStore()
  const subtotal = useCartSubtotal()
  const taxAmount = useCartTax()
  const total = useCartTotal()

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [selectedShipping, setSelectedShipping] = useState<string>('')
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)

  // Mock data - in real app, this would come from API
  const [addresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      name: 'John Doe',
      phone: '+91 9876543210',
      address: '123 Main Street, Sector 15',
      city: 'Gurgaon',
      state: 'Haryana',
      zipCode: '122001',
      isDefault: true
    }
  ])

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      details: 'Visa, Mastercard, RuPay',
      isDefault: true
    },
    {
      id: 'upi',
      type: 'upi',
      name: 'UPI',
      details: 'Paytm, Google Pay, PhonePe, BHIM UPI',
      isDefault: false
    },
    {
      id: 'netbanking',
      type: 'netbanking',
      name: 'Net Banking',
      details: 'All major banks supported',
      isDefault: false
    }
  ])

  const [shippingMethods] = useState<ShippingMethod[]>([
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: 'Delivered in 5-7 business days',
      cost: 50,
      estimatedDays: '5-7 days',
      isDefault: true
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: 'Delivered in 2-3 business days',
      cost: 100,
      estimatedDays: '2-3 days',
      isDefault: false
    },
    {
      id: 'overnight',
      name: 'Overnight Delivery',
      description: 'Delivered next business day',
      cost: 200,
      estimatedDays: '1 day',
      isDefault: false
    }
  ])

  const [newAddress, setNewAddress] = useState<{
    type: 'home' | 'work' | 'other';
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }>({
    type: 'home',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout')
      return
    }

    if (items.length === 0) {
      router.push('/cart')
      return
    }
  }, [isAuthenticated, items.length, router])

  const handleAddressSubmit = () => {
    // In real app, save address to backend
    setShowNewAddressForm(false)
    setNewAddress({
      type: 'home',
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    })
  }

  const handlePlaceOrder = async () => {
    console.log('=== PAYMENT FLOW DEBUG ===');
    console.log('Selected payment method:', selectedPayment);
    console.log('Selected shipping method:', selectedShipping);
    console.log('Selected address:', selectedAddress);
    console.log('Cart items:', items);
    console.log('Total amount:', total);
    console.log('Current step:', currentStep);

    // Check if we have required data
    if (!selectedAddress) {
      console.error('No address selected');
      alert('Please select a delivery address');
      return;
    }

    if (!selectedShipping) {
      console.error('No shipping method selected');
      alert('Please select a shipping method');
      return;
    }

    if (!selectedPayment) {
      console.error('No payment method selected');
      alert('Please select a payment method');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Get selected address details
      const selectedAddressData = addresses.find(addr => addr.id === selectedAddress);
      if (!selectedAddressData) {
        throw new Error('Selected address not found');
      }

      // Prepare order data
      const orderData: CreateOrderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          variantId: item.variantId,
        })),
        shippingAddress: {
          name: selectedAddressData.name,
          phone: selectedAddressData.phone,
          address: selectedAddressData.address,
          city: selectedAddressData.city,
          state: selectedAddressData.state,
          zipCode: selectedAddressData.zipCode,
        },
        billingAddress: {
          name: selectedAddressData.name,
          phone: selectedAddressData.phone,
          address: selectedAddressData.address,
          city: selectedAddressData.city,
          state: selectedAddressData.state,
          zipCode: selectedAddressData.zipCode,
        },
        paymentMethod: selectedPayment === 'cod' ? 'cod' : 'card',
      };

      // Create order
      const orderResponse = await PaymentAPI.createOrder(orderData);
      const createdOrderId = orderResponse.data.id;
      setOrderId(createdOrderId);

      console.log('Order created:', createdOrderId);

      if (selectedPayment === 'cod') {
        // Cash on Delivery - order is already confirmed
        alert('Order placed successfully! You will pay on delivery.');
        clearCart();
        router.push('/orders');
      } else {
        // Online payment with Stripe - handled in the StripePayment component
        setCurrentStep(4) // Move to payment step
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment successful:', paymentIntentId);
    alert('Payment successful! Your order has been confirmed.');
    clearCart();
    router.push('/orders');
  }

  const handlePaymentFailure = (error: string) => {
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
    // Optionally, you could redirect back to payment step or retry
    setCurrentStep(3);
  }

  const steps = [
    { id: 1, name: 'Address', icon: MapPin },
    { id: 2, name: 'Shipping', icon: Truck },
    { id: 3, name: 'Payment', icon: CreditCard },
    { id: 4, name: 'Review', icon: Check },
    { id: 5, name: 'Pay', icon: Shield }
  ]

  if (!isAuthenticated || items.length === 0) {
    return null // Will redirect
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = step.id === currentStep
            const isCompleted = step.id < currentStep

            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'border-pink-500 text-pink-500'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <span className={`ml-3 font-medium ${
                  isActive ? 'text-pink-500' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Address Selection */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Delivery Address</h2>

                {/* Existing Addresses */}
                <div className="space-y-4 mb-6">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAddress === address.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAddress(address.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <input
                            type="radio"
                            checked={selectedAddress === address.id}
                            onChange={() => setSelectedAddress(address.id)}
                            className="mt-1 text-pink-500"
                          />
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">{address.name}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                address.type === 'home' ? 'bg-blue-100 text-blue-700' :
                                address.type === 'work' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {address.type}
                              </span>
                              {address.isDefault && (
                                <span className="px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-1">{address.phone}</p>
                            <p className="text-gray-700">{address.address}</p>
                            <p className="text-gray-700">{address.city}, {address.state} {address.zipCode}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-pink-500 hover:text-pink-600">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Address */}
                {!showNewAddressForm ? (
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="flex items-center space-x-2 text-pink-500 hover:text-pink-600 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add New Address</span>
                  </button>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <Input
                          value={newAddress.name}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <Input
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <Input
                          value={newAddress.address}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <Input
                          value={newAddress.city}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Enter city"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <Input
                          value={newAddress.state}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="Enter state"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                        <Input
                          value={newAddress.zipCode}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                          placeholder="Enter ZIP code"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                        <select
                          value={newAddress.type}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value as 'home' | 'work' | 'other' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setShowNewAddressForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddressSubmit}
                        className="bg-pink-500 hover:bg-pink-600"
                      >
                        Save Address
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedAddress}
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    Continue to Shipping
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Payment Method</h2>

                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPayment === method.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPayment(method.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          checked={selectedPayment === method.id}
                          onChange={() => setSelectedPayment(method.id)}
                          className="text-pink-500"
                        />
                        <div className="flex items-center space-x-3">
                          {method.type === 'card' && <CreditCard className="w-6 h-6 text-gray-600" />}
                          {method.type === 'upi' && <div className="w-6 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">UPI</div>}
                          {method.type === 'netbanking' && <div className="w-6 h-6 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">Bank</div>}
                          <div>
                            <p className="font-medium text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-600">{method.details}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Cash on Delivery */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPayment === 'cod'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPayment('cod')}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={selectedPayment === 'cod'}
                        onChange={() => setSelectedPayment('cod')}
                        className="text-pink-500"
                      />
                      <Truck className="w-6 h-6 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Cash on Delivery</p>
                        <p className="text-sm text-gray-600">Pay when you receive your order</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back to Address
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedPayment === 'cod') {
                        setCurrentStep(3);
                      } else {
                        setCurrentStep(3); // Go to review first, then payment
                      }
                    }}
                    disabled={!selectedPayment}
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    {selectedPayment === 'cod' ? 'Review Order' : 'Review Order'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Order Confirmation */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Order</h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-medium text-gray-900">Order Items</h3>
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <Image
                        src={item.product.images[0] || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        width={60}
                        height={60}
                        className="object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Delivery Address</h3>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    {addresses.find(addr => addr.id === selectedAddress) && (
                      <div>
                        <p className="font-medium text-gray-900">
                          {addresses.find(addr => addr.id === selectedAddress)?.name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {addresses.find(addr => addr.id === selectedAddress)?.phone}
                        </p>
                        <p className="text-gray-700">
                          {addresses.find(addr => addr.id === selectedAddress)?.address}
                        </p>
                        <p className="text-gray-700">
                          {addresses.find(addr => addr.id === selectedAddress)?.city},{' '}
                          {addresses.find(addr => addr.id === selectedAddress)?.state}{' '}
                          {addresses.find(addr => addr.id === selectedAddress)?.zipCode}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    {paymentMethods.find(method => method.id === selectedPayment) && (
                      <div className="flex items-center space-x-3">
                        {paymentMethods.find(method => method.id === selectedPayment)?.type === 'card' && <CreditCard className="w-5 h-5 text-gray-600" />}
                        {paymentMethods.find(method => method.id === selectedPayment)?.type === 'upi' && <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">UPI</div>}
                        {paymentMethods.find(method => method.id === selectedPayment)?.type === 'netbanking' && <div className="w-5 h-5 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">Bank</div>}
                        <div>
                          <p className="font-medium text-gray-900">
                            {paymentMethods.find(method => method.id === selectedPayment)?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {paymentMethods.find(method => method.id === selectedPayment)?.details}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedPayment === 'cod' && (
                      <div className="flex items-center space-x-3">
                        <Truck className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Cash on Delivery</p>
                          <p className="text-sm text-gray-600">Pay when you receive your order</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="mb-6">
                  <div className="flex items-start space-x-3">
                    <input type="checkbox" className="mt-1 text-pink-500" />
                    <p className="text-sm text-gray-600">
                      I agree to the{' '}
                      <Link href="/terms" className="text-pink-500 hover:text-pink-600">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-pink-500 hover:text-pink-600">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                  >
                    Back to Payment
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedPayment === 'cod') {
                        handlePlaceOrder();
                      } else {
                        handlePlaceOrder(); // This will create order and move to payment step
                      }
                    }}
                    disabled={isProcessingPayment}
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : selectedPayment === 'cod' ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Place Order
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Razorpay Payment */}
            {currentStep === 4 && orderId && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Complete Payment</h2>

                <RazorpayPayment
                  orderId={orderId}
                  amount={total}
                  currency="INR"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentFailure}
                />

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                  >
                    Back to Review
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <Image
                      src={item.product.images[0] || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      width={40}
                      height={40}
                      className="object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-sm text-gray-600 text-center">
                    +{items.length - 3} more items
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18% GST):</span>
                  <span className="font-medium">₹{taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Secure Checkout</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}