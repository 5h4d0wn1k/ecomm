'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Search,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
  Phone,
  Mail,
  ShoppingCart,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/lib/stores/auth-store'
import { apiClient } from '@/lib/api/client'
import { Order, OrderItem, ApiResponse, PaginatedResponse } from '@/lib/types'
import { format } from 'date-fns'

interface VendorOrder extends Order {
  orderItems: (OrderItem & {
    product: {
      id: number
      name: string
      images: string[]
      sku: string
    }
    vendor: {
      id: number
      businessName: string
      businessAddress: string
    }
  })[]
}

interface OrderStats {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalRevenue: number
  monthlyRevenue: number
  averageOrderValue: number
}

export default function VendorOrdersPage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<VendorOrder[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!user?.vendor?.id) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        vendorId: user.vendor.id.toString()
      })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }

      const response = await apiClient.get<PaginatedResponse<VendorOrder>>(
        `/orders?${params.toString()}`
      )

      if (response.data.success) {
        setOrders(response.data.data || [])
        setTotalPages(response.data.pagination?.pages || 1)
      } else {
        setError(response.data.message || 'Failed to fetch orders')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [user?.vendor?.id, currentPage, statusFilter, searchQuery])

  const fetchStats = useCallback(async () => {
    if (!user?.vendor?.id) return

    try {
      const response = await apiClient.get<ApiResponse<OrderStats>>(
        `/vendors/order-stats`
      )

      if (response.data.success) {
        setStats(response.data.data || null)
      }
    } catch (err) {
      // Stats are optional, don't show error
      console.error('Failed to fetch order stats:', err)
    }
  }, [user?.vendor?.id])

  useEffect(() => {
    fetchOrders()
    fetchStats()
  }, [fetchOrders, fetchStats])

  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      setUpdatingStatus(orderId)
      const response = await apiClient.patch<ApiResponse<VendorOrder>>(
        `/orders/${orderId}/status`,
        { status: newStatus }
      )

      if (response.data.success) {
        setOrders(prev => prev.map(order =>
          order.id === orderId ? response.data.data! : order
        ))
        fetchStats() // Refresh stats after status update
      } else {
        setError(response.data.message || 'Failed to update order status')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      case 'confirmed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Confirmed</Badge>
      case 'processing':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">Processing</Badge>
      case 'shipped':
        return <Badge variant="outline" className="text-indigo-600 border-indigo-600">Shipped</Badge>
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'refunded':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Refunded</Badge>
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-purple-600" />
      case 'shipped':
        return <Truck className="w-4 h-4 text-indigo-600" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'refunded':
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const canUpdateStatus = (currentStatus: Order['status'], newStatus: Order['status']) => {
    const statusFlow = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
      refunded: []
    }
    return statusFlow[currentStatus]?.includes(newStatus) || false
  }

  const getNextStatuses = (status: Order['status']) => {
    const statusFlow = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
      refunded: []
    }
    return statusFlow[status] || []
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatAddress = (address: Record<string, string | number>) => {
    const { street, city, state, zipCode, country } = address
    return [street, city, state, zipCode, country].filter(Boolean).join(', ')
  }

  if (loading && orders.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Track and manage customer orders</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={fetchOrders}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Orders
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                <p className="text-xs text-gray-600 mt-1">
                  +{stats.pendingOrders} pending
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  +{formatCurrency(stats.monthlyRevenue)} this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.averageOrderValue)}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Per order
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Delivered</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.deliveredOrders}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.totalOrders > 0 ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0}% completion rate
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders by number, customer, or product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">
                            {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.user.firstName} {order.user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{order.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.orderItems.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-center space-x-2">
                              <Image
                                src={item.product.images[0] || '/placeholder-product.jpg'}
                                alt={item.product.name}
                                width={32}
                                height={32}
                                className="object-cover rounded"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                          {order.orderItems.length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{order.orderItems.length - 2} more items
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          {getStatusBadge(order.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowOrderModal(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {getNextStatuses(order.status).map((nextStatus) => (
                            <Button
                              key={nextStatus}
                              variant="ghost"
                              size="sm"
                              disabled={updatingStatus === order.id}
                              onClick={() => updateOrderStatus(order.id, nextStatus as Order['status'])}
                            >
                              {updatingStatus === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : nextStatus === 'confirmed' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : nextStatus === 'processing' ? (
                                <RefreshCw className="w-4 h-4" />
                              ) : nextStatus === 'shipped' ? (
                                <Truck className="w-4 h-4" />
                              ) : nextStatus === 'delivered' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        <Modal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          title={`Order ${selectedOrder?.orderNumber}`}
          size="lg"
        >
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedOrder.orderNumber}</h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedOrder.createdAt), 'PPP')}
                  </p>
                </div>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">
                        {selectedOrder.user.firstName} {selectedOrder.user.lastName}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {selectedOrder.user.email}
                      </p>
                      {selectedOrder.user.phone && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {selectedOrder.user.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Shipping Address
                      </p>
                      <p className="text-sm">{formatAddress(selectedOrder.shippingAddress)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Image
                          src={item.product.images[0] || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Amount</span>
                      <span className="text-lg font-bold">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Actions */}
              <div className="flex justify-end space-x-3">
                {getNextStatuses(selectedOrder.status).map((nextStatus) => (
                  <Button
                    key={nextStatus}
                    variant={nextStatus === 'cancelled' ? 'destructive' : 'default'}
                    disabled={updatingStatus === selectedOrder.id}
                    onClick={() => updateOrderStatus(selectedOrder.id, nextStatus as Order['status'])}
                  >
                    {updatingStatus === selectedOrder.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {nextStatus === 'confirmed' ? 'Confirm Order' :
                     nextStatus === 'processing' ? 'Start Processing' :
                     nextStatus === 'shipped' ? 'Mark as Shipped' :
                     nextStatus === 'delivered' ? 'Mark as Delivered' :
                     'Cancel Order'}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  )
}