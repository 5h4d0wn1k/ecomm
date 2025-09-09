'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useCartItems,
  useCartStore,
  useCartSubtotal,
  useCartTax,
  useCartTotal,
  useCartShipping,
  useCartDiscount,
  useCartCoupon,
  useVendorCarts,
  useApplyCoupon
} from '@/lib/stores/cart-store'

export default function CartPage() {
  const items = useCartItems()
  const vendorCarts = useVendorCarts()
  const { updateQuantity, removeItem, clearCart } = useCartStore()
  const subtotal = useCartSubtotal()
  const taxAmount = useCartTax()
  const shippingAmount = useCartShipping()
  const discountAmount = useCartDiscount()
  const total = useCartTotal()
  const coupon = useCartCoupon()
  const applyCoupon = useApplyCoupon()

  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId)
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    try {
      // In real app, this would call the coupon validation API
      // For now, simulate a valid coupon
      if (couponCode.toUpperCase() === 'SAVE10') {
        const mockCoupon = {
          code: 'SAVE10',
          discountType: 'percentage' as const,
          discountValue: 10,
          minimumOrderAmount: 500,
          isValid: subtotal >= 500,
          discountAmount: subtotal >= 500 ? subtotal * 0.1 : 0
        }
        applyCoupon(mockCoupon)
        setCouponError('')
        setCouponCode('')
      } else {
        setCouponError('Invalid coupon code')
      }
    } catch (error) {
      setCouponError('Failed to apply coupon')
    }
  }

  const handleRemoveCoupon = () => {
    applyCoupon(null)
    setCouponError('')
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {vendorCarts.map((vendorCart) => (
                <div key={vendorCart.vendorId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Vendor Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {vendorCart.vendorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{vendorCart.vendorName}</h3>
                          <p className="text-sm text-gray-600">{vendorCart.items.length} item(s)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="font-medium text-gray-900">₹{vendorCart.subtotal.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Items */}
                  <div className="divide-y divide-gray-200">
                    {vendorCart.items.map((item) => {
                      const price = item.variant
                        ? item.product.price + (item.variant.priceModifier || 0)
                        : item.product.price
                      const maxQuantity = item.variant
                        ? item.variant.stockQuantity
                        : item.product.stockQuantity

                      return (
                        <div key={item.id} className="p-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <Image
                                src={item.product.images[0] || '/placeholder-product.jpg'}
                                alt={item.product.name}
                                width={100}
                                height={100}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            </div>

                            {/* Product Details */}
                            <div className="flex-1">
                              <Link href={`/products/${item.product.id}`}>
                                <h4 className="text-base font-medium text-gray-900 hover:text-blue-600">
                                  {item.product.name}
                                </h4>
                              </Link>
                              {item.variant && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Variant: {item.variant.name} - {item.variant.value}
                                </p>
                              )}
                              <p className="text-sm font-medium text-gray-900 mt-2">
                                ₹{price.toLocaleString()}
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="min-h-[44px] min-w-[44px]"
                                >
                                  <Minus className="h-5 w-5" />
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  max={maxQuantity}
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                  className="w-16 text-center min-h-[44px]"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= maxQuantity}
                                  className="min-h-[44px] min-w-[44px]"
                                >
                                  <Plus className="h-5 w-5" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[44px]"
                              >
                                <Trash2 className="h-5 w-5 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                            <span className="text-sm text-gray-600">Item Total:</span>
                            <span className="text-base font-medium text-gray-900">
                              ₹{(price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Vendor Footer */}
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Shipping:</span>
                      <span className={`text-sm font-medium ${vendorCart.shippingAmount === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {vendorCart.shippingAmount === 0 ? 'FREE' : `₹${vendorCart.shippingAmount.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart */}
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cart Summary</h2>

              {/* Coupon Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have a coupon?
                </label>
                {coupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-green-700">{coupon.code}</span>
                      <span className="text-xs text-green-600">
                        -₹{coupon.discountAmount.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        variant="outline"
                        size="sm"
                      >
                        Apply
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-sm text-red-600">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className={`font-medium ${shippingAmount === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {shippingAmount === 0 ? 'FREE' : `₹${shippingAmount.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18% GST):</span>
                  <span className="font-medium">₹{taxAmount.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-600">Discount:</span>
                    <span className="font-medium text-green-600">-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link href="/checkout">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}