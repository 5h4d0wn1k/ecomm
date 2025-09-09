'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function OrderDetailsPage() {
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockOrder = {
      id: orderId,
      orderNumber: `ORD-${orderId}`,
      status: 'shipped',
      createdAt: '2024-01-15T10:30:00Z',
      total: 2999,
      shipping: 100,
      tax: 240,
      items: [
        {
          id: '1',
          name: 'Wireless Headphones',
          vendor: 'Tech Solutions Ltd',
          price: 2999,
          quantity: 1,
          image: '/api/placeholder/100/100'
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        address: '123 Main St, Apt 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '+91 9876543210'
      },
      paymentMethod: {
        type: 'card',
        last4: '4242',
        brand: 'Visa'
      },
      tracking: {
        number: 'TRK123456789',
        carrier: 'Delhivery',
        status: 'In Transit',
        estimatedDelivery: '2024-01-20'
      }
    }

    setOrder(mockOrder)
    setLoading(false)
  }, [orderId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'processing': return <Package className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
        <Link href="/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/orders" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
              {getStatusIcon(order.status)}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={item.image} />
                      <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">Sold by {item.vendor}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Tracking */}
          {order.tracking && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Track your order status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{order.tracking.carrier}</p>
                        <p className="text-sm text-gray-600">Tracking: {order.tracking.number}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{order.tracking.status}</Badge>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600">
                      Estimated delivery: {new Date(order.tracking.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{(order.total - order.shipping - order.tax).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">₹{order.shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{order.tax.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{order.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                <p className="text-gray-600">{order.shippingAddress.address}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                </p>
                <div className="flex items-center text-gray-600 mt-3">
                  <Phone className="w-4 h-4 mr-2" />
                  {order.shippingAddress.phone}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {order.paymentMethod.brand} •••• {order.paymentMethod.last4}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">{order.paymentMethod.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}