'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Plus,
  MoreHorizontal,
  Download,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/stores/auth-store'

interface DashboardData {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  lowStockProducts: number
  recentOrders: any[]
  earnings: {
    thisMonth: number
    lastMonth: number
    pending: number
    totalEarned: number
    commissionPaid: number
  }
  lastPayout?: {
    amount: number
    date: string
  }
}

interface RevenueData {
  period: string
  revenue: number
  orders: number
}

interface ProductPerformance {
  productId: number
  productName: string
  totalSold: number
  revenue: number
  averageRating: number
}

export default function VendorDashboard() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user?.vendor?.id) {
      fetchDashboardData()
      fetchAnalyticsData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get<{
        success: boolean
        data: DashboardData
        message?: string
      }>('/api/v1/vendors/dashboard')

      if (response.data.success) {
        setDashboardData(response.data.data)
      } else {
        setError(response.data.message || 'Failed to fetch dashboard data')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalyticsData = async () => {
    try {
      // Fetch revenue data for the selected time range
      const endDate = new Date()
      const startDate = new Date()

      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      const [revenueResponse, performanceResponse] = await Promise.all([
        apiClient.get<{
          success: boolean
          data: RevenueData[]
        }>(`/api/v1/analytics/vendor/revenue?period=daily&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        apiClient.get<{
          success: boolean
          data: ProductPerformance[]
        }>('/api/v1/analytics/vendor/products/performance')
      ])

      if (revenueResponse.data.success) {
        setRevenueData(revenueResponse.data.data || [])
      }

      if (performanceResponse.data.success) {
        setProductPerformance(performanceResponse.data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch analytics data:', err)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchDashboardData(), fetchAnalyticsData()])
    setRefreshing(false)
  }

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange)
    // Refetch analytics data with new time range
    setTimeout(fetchAnalyticsData, 100)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchDashboardData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  if (!dashboardData) {
    return null
  }

  const stats = {
    totalRevenue: dashboardData.totalRevenue,
    totalOrders: dashboardData.totalOrders,
    totalProducts: dashboardData.totalProducts,
    pendingOrders: dashboardData.pendingOrders,
    lowStockProducts: dashboardData.lowStockProducts,
    averageRating: 4.6, // This would come from API
    totalReviews: 234 // This would come from API
  }

  const earnings = dashboardData.earnings
  const recentOrders = dashboardData.recentOrders || []
  const topProducts = productPerformance.slice(0, 5).map(product => ({
    id: product.productId.toString(),
    name: product.productName,
    sales: product.totalSold,
    revenue: product.revenue,
    rating: product.averageRating,
    image: '/placeholder-product.jpg'
  }))

  const lowStockProducts = [] // This would come from a separate API call

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'shipped': return <Package className="w-4 h-4" />
      case 'processing': return <Clock className="w-4 h-4" />
      case 'pending': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your store and track performance</p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.2%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.lowStockProducts} low stock items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalReviews} reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
          <div className="mb-8 space-y-4">
            {stats.pendingOrders > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <p className="font-medium text-orange-800">
                        {stats.pendingOrders} orders pending processing
                      </p>
                      <p className="text-sm text-orange-700">
                        Process these orders to improve customer satisfaction
                      </p>
                    </div>
                    <Button size="sm" className="ml-auto bg-orange-600 hover:bg-orange-700">
                      Process Orders
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.lowStockProducts > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-medium text-red-800">
                        {stats.lowStockProducts} products running low on stock
                      </p>
                      <p className="text-sm text-red-700">
                        Restock these items to avoid missing sales
                      </p>
                    </div>
                    <Button size="sm" className="ml-auto bg-red-600 hover:bg-red-700">
                      Manage Inventory
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest orders from your store</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{order.customer.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{order.id}</p>
                            <p className="text-xs text-gray-600">{order.customer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(order.status)} text-xs`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </Badge>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            ₹{order.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Orders
                  </Button>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                  <CardDescription>Your best-selling products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-600">{product.sales} sales</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 text-sm">
                            ₹{product.revenue.toLocaleString()}
                          </p>
                          <div className="flex items-center text-xs text-gray-600">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            {product.rating}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Your earnings and commission details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">₹{earnings.thisMonth.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-xs text-green-600 mt-1">
                      +{Math.round(((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth) * 100)}% from last month
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">₹{earnings.available.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-xs text-gray-600 mt-1">Ready for withdrawal</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">₹{earnings.pending.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-xs text-orange-600 mt-1">Processing</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">10%</p>
                    <p className="text-sm text-gray-600">Commission Rate</p>
                    <p className="text-xs text-gray-600 mt-1">Platform fee</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Orders</CardTitle>
                    <CardDescription>Manage and track all your orders</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                        <TableCell>₹{order.commission}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Products</h2>
                <p className="text-gray-600">Manage your product catalog</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Low Stock Alert
                  </CardTitle>
                  <CardDescription className="text-red-700">
                    These products are running low on stock
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            Current stock: {product.stock} (Threshold: {product.threshold})
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={(product.stock / product.threshold) * 100} className="w-20" />
                          <Button size="sm" variant="outline">
                            Restock
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{product.revenue.toLocaleString()}
                      </span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{product.sales} units sold</p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Revenue over time ({timeRange})</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="period"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            if (timeRange === '1y') return value
                            const date = new Date(value)
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                          labelFormatter={(label) => `Period: ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Orders Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Volume</CardTitle>
                  <CardDescription>Orders over time ({timeRange})</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="period"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            if (timeRange === '1y') return value
                            const date = new Date(value)
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number) => [value, 'Orders']}
                          labelFormatter={(label) => `Period: ${label}`}
                        />
                        <Bar dataKey="orders" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Revenue by product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productPerformance.slice(0, 8)} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="productName"
                        tick={{ fontSize: 12 }}
                        width={120}
                        tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                      />
                      <Tooltip
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        labelFormatter={(label) => `Product: ${label}`}
                      />
                      <Bar dataKey="revenue" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders/Day</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalOrders > 0 ? (stats.totalOrders / 30).toFixed(1) : '0'}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Average daily orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : '0'}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Per order</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue/Day</CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    ₹{(stats.totalRevenue / 30).toFixed(0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Average daily revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <Users className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.totalOrders > 0 ? ((stats.totalOrders / (stats.totalOrders + stats.pendingOrders)) * 100).toFixed(1) : '0'}%
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Order completion rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}