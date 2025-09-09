'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  MessageCircle,
  AlertTriangle
} from 'lucide-react'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api/client'
import { Order, OrderItem, PaginatedResponse } from '@/lib/types'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

type OrderWithItems = Order & {
  items: (OrderItem & {
    product: {
      id: string
      name: string
      images: string[]
      vendor: {
        businessName: string
      }
    }
  })[]
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
  }
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  })

  useEffect(() => {
    fetchOrders()
  }, [activeTab, searchQuery, statusFilter, dateFilter, pagination.page])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (dateFilter !== 'all') params.append('dateRange', dateFilter)
      if (activeTab !== 'all') params.append('status', activeTab)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      params.append('include', 'items,shippingAddress')

      const response = await apiClient.get<PaginatedResponse<OrderWithItems>>(
        `/orders?${params.toString()}`
      )

      setOrders(response.data.data || [])
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      // For demo purposes, set mock data if API fails
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Package className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      shipped: { color: 'bg-blue-100 text-blue-800', label: 'Shipped' },
      processing: { color: 'bg-yellow-100 text-yellow-800', label: 'Processing' },
      pending: { color: 'bg-orange-100 text-orange-800', label: 'Pending' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      refunded: { color: 'bg-purple-100 text-purple-800', label: 'Refunded' },
    }

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] ||
                  { color: 'bg-gray-100 text-gray-800', label: status }

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {getStatusIcon(status)}
        {config.label}
      </Badge>
    )
  }

  const handleCancelOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      try {
        await apiClient.patch(`/orders/${orderId}/cancel`)
        fetchOrders() // Refresh orders
        alert('Order cancelled successfully')
      } catch (error) {
        console.error('Failed to cancel order:', error)
        alert('Failed to cancel order. Please try again.')
      }
    }
  }

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const response = await apiClient.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${orderId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to download invoice:', error)
      alert('Failed to download invoice. Please try again.')
    }
  }

  const getOrderStats = () => {
    const stats = {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    }
    return stats
  }

  const stats = getOrderStats()

  return (
    <ProtectedRoute requiredRoles={['customer']}>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Track and manage your orders</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Orders
              </Button>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.all}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
                  <div className="text-sm text-gray-600">Processing</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
                  <div className="text-sm text-gray-600">Shipped</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                  <div className="text-sm text-gray-600">Delivered</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                  <div className="text-sm text-gray-600">Cancelled</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search orders by ID, product name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 3 months</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All Orders ({stats.all})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="processing">Processing ({stats.processing})</TabsTrigger>
              <TabsTrigger value="shipped">Shipped ({stats.shipped})</TabsTrigger>
              <TabsTrigger value="delivered">Delivered ({stats.delivered})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({stats.cancelled})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                              <p className="text-sm text-gray-600">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ₹{order.totalAmount.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.items.length} item{order.items.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6">
                        {/* Order Items */}
                        <div className="space-y-4 mb-6">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                              <Image
                                src={item.product.images[0] || '/placeholder-product.jpg'}
                                alt={item.product.name}
                                width={60}
                                height={60}
                                className="object-cover rounded"
                              />
                              <div className="flex-1">
                                <Link href={`/products/${item.product.id}`}>
                                  <h4 className="font-medium text-gray-900 hover:text-pink-600">
                                    {item.product.name}
                                  </h4>
                                </Link>
                                <p className="text-sm text-gray-600">
                                  Sold by: {item.product.vendor.businessName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Quantity: {item.quantity} × ₹{item.price.toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">
                                  ₹{(item.price * item.quantity).toLocaleString()}
                                </div>
                                <div className="flex items-center mt-1">
                                  <Button variant="ghost" size="sm">
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    Contact Seller
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                                <p className="text-sm text-gray-700">{order.shippingAddress.name}</p>
                                <p className="text-sm text-gray-700">{order.shippingAddress.phone}</p>
                                <p className="text-sm text-gray-700">
                                  {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                                  {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Order Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex space-x-3">
                            <Link href={`/orders/${order.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadInvoice(order.id)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Invoice
                            </Button>
                            {order.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelOrder(order.id)}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Order
                              </Button>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            Expected delivery: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex justify-center items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={!pagination.hasPrev}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={!pagination.hasNext}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600 mb-6">
                      {activeTab === 'all'
                        ? "You haven't placed any orders yet."
                        : `You don't have any ${activeTab} orders.`
                      }
                    </p>
                    <Link href="/products">
                      <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                        Start Shopping
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}