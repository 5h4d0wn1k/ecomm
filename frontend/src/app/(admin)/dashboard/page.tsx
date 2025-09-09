'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  Filter,
  Search,
  Plus
} from 'lucide-react'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [timeRange, setTimeRange] = useState('30d')

  // Mock data for demonstration
  const [stats] = useState({
    totalUsers: 1250,
    totalVendors: 45,
    totalProducts: 3200,
    totalOrders: 1850,
    totalRevenue: 2500000,
    pendingVendors: 8,
    lowStockProducts: 23,
    activeOrders: 156
  })

  const [recentUsers] = useState([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
      status: 'active',
      joinDate: '2024-01-15',
      orders: 12
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'vendor',
      status: 'active',
      joinDate: '2024-01-14',
      orders: 0
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'customer',
      status: 'active',
      joinDate: '2024-01-13',
      orders: 8
    }
  ])

  const [pendingVendors] = useState([
    {
      id: '1',
      businessName: 'Tech Solutions Ltd',
      ownerName: 'Sarah Wilson',
      email: 'sarah@techsolutions.com',
      submittedDate: '2024-01-10',
      status: 'pending'
    },
    {
      id: '2',
      businessName: 'Fashion Hub',
      ownerName: 'David Brown',
      email: 'david@fashionhub.com',
      submittedDate: '2024-01-09',
      status: 'pending'
    }
  ])

  const [topProducts] = useState([
    {
      id: '1',
      name: 'Wireless Headphones',
      vendor: 'Tech Solutions Ltd',
      sales: 145,
      revenue: 434955,
      rating: 4.8
    },
    {
      id: '2',
      name: 'Smart Watch',
      vendor: 'Gadget World',
      sales: 98,
      revenue: 489902,
      rating: 4.7
    },
    {
      id: '3',
      name: 'Bluetooth Speaker',
      vendor: 'Audio Masters',
      sales: 87,
      revenue: 173913,
      rating: 4.6
    }
  ])

  const [recentOrders] = useState([
    {
      id: 'ORD-001',
      customer: 'John Doe',
      vendor: 'Tech Solutions Ltd',
      product: 'Wireless Headphones',
      amount: 2999,
      status: 'delivered',
      date: '2024-01-15'
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      vendor: 'Fashion Hub',
      product: 'Designer Dress',
      amount: 4999,
      status: 'shipped',
      date: '2024-01-14'
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      vendor: 'Gadget World',
      product: 'Smart Watch',
      amount: 9999,
      status: 'processing',
      date: '2024-01-14'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'vendor': return 'bg-blue-100 text-blue-800'
      case 'customer': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your multi-vendor marketplace</p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
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
              <div className="text-2xl font-bold">₹{(stats.totalRevenue / 100000).toFixed(1)}L</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15.3%</span> from last month
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
                <span className="text-green-600">+12.1%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVendors}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingVendors} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.lowStockProducts} low stock items
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(stats.pendingVendors > 0 || stats.lowStockProducts > 0) && (
          <div className="mb-8 space-y-4">
            {stats.pendingVendors > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <p className="font-medium text-orange-800">
                        {stats.pendingVendors} vendor applications pending approval
                      </p>
                      <p className="text-sm text-orange-700">
                        Review and approve vendor applications to grow your marketplace
                      </p>
                    </div>
                    <Button size="sm" className="ml-auto bg-orange-600 hover:bg-orange-700">
                      Review Applications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.lowStockProducts > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-medium text-red-800">
                        {stats.lowStockProducts} products running low on stock
                      </p>
                      <p className="text-sm text-red-700">
                        Monitor inventory levels to prevent stockouts
                      </p>
                    </div>
                    <Button size="sm" className="ml-auto bg-red-600 hover:bg-red-700">
                      View Inventory
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest orders across all vendors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
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
                            {order.status}
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
                  <CardDescription>Best-selling products across all vendors</CardDescription>
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
                          <p className="text-xs text-gray-600">{product.vendor}</p>
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

            {/* Platform Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Key metrics and performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      {Math.round(stats.totalOrders / 30)}
                    </p>
                    <p className="text-sm text-gray-600">Orders per Day</p>
                    <p className="text-xs text-green-600 mt-1">+8% from last week</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600 mb-2">
                      ₹{Math.round(stats.totalRevenue / stats.totalOrders)}
                    </p>
                    <p className="text-sm text-gray-600">Average Order Value</p>
                    <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600 mb-2">
                      {Math.round((stats.totalUsers / stats.totalVendors) * 10) / 10}
                    </p>
                    <p className="text-sm text-gray-600">Customers per Vendor</p>
                    <p className="text-xs text-purple-600 mt-1">+15% growth</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600 mb-2">
                      {Math.round(stats.totalProducts / stats.totalVendors)}
                    </p>
                    <p className="text-sm text-gray-600">Products per Vendor</p>
                    <p className="text-xs text-orange-600 mt-1">+5% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Manage customers, vendors, and admins</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="customer">Customers</SelectItem>
                        <SelectItem value="vendor">Vendors</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
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
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>{user.orders}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Vendors */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Vendor Applications</CardTitle>
                  <CardDescription>Vendors waiting for approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingVendors.map((vendor) => (
                      <div key={vendor.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{vendor.businessName}</h4>
                            <p className="text-sm text-gray-600">{vendor.ownerName}</p>
                            <p className="text-sm text-gray-600">{vendor.email}</p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          Submitted on {vendor.submittedDate}
                        </p>
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Vendor Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Statistics</CardTitle>
                  <CardDescription>Overview of vendor performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Active Vendors</span>
                        <span className="text-sm text-gray-600">{stats.totalVendors}</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Pending Applications</span>
                        <span className="text-sm text-gray-600">{stats.pendingVendors}</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Average Products per Vendor</span>
                        <span className="text-sm text-gray-600">
                          {Math.round(stats.totalProducts / stats.totalVendors)}
                        </span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Products</CardTitle>
                    <CardDescription>Manage products across all vendors</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
                        <p className="text-sm text-gray-600 mb-3">{product.vendor}</p>
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
                    <CardDescription>Monitor orders across all vendors</CardDescription>
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
                      <TableHead>Vendor</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
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
                        <TableCell>{order.vendor}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell>₹{order.amount.toLocaleString()}</TableCell>
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
        </Tabs>
      </div>
    </Layout>
  )
}