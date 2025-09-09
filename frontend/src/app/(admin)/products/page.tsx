'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Package,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  AlertTriangle,
  Star,
  DollarSign,
  Calendar,
  MoreHorizontal,
  Download,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { apiClient } from '@/lib/api/client'

type Product = {
  id: string
  name: string
  description: string
  price: number
  status: 'active' | 'inactive' | 'pending' | 'rejected'
  images: string[]
  sku: string
  createdAt: string
  vendor: {
    id: string
    businessName: string
    isVerified: boolean
  }
  category: {
    id: string
    name: string
  }
  _count?: {
    reviews: number
    orderItems: number
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  })

  useEffect(() => {
    fetchProducts()
  }, [activeTab, searchQuery, statusFilter, pagination.page])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (activeTab !== 'all') params.append('status', activeTab)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await apiClient.get<{
        success: boolean
        data: {
          products: Product[]
          pagination: {
            page: number
            limit: number
            total: number
            pages: number
          }
        }
      }>(`/admin/products?${params.toString()}`)

      if (response.data.success) {
        setProducts(response.data.data.products || [])
        setPagination({
          ...response.data.data.pagination,
          hasNext: response.data.data.pagination.page < response.data.data.pagination.pages,
          hasPrev: response.data.data.pagination.page > 1,
        })
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleProductAction = async (productId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject'
      const data = action === 'reject' ? { reason } : {}

      await apiClient.put(`/admin/products/${productId}/${endpoint}`, data)
      fetchProducts() // Refresh the list
      alert(`Product ${action}d successfully`)
    } catch (error) {
      console.error(`Failed to ${action} product:`, error)
      alert(`Failed to ${action} product`)
    }
  }

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      await apiClient.put(`/admin/products/${productId}/status`, { status: newStatus })
      fetchProducts() // Refresh the list
      alert('Product status updated successfully')
    } catch (error) {
      console.error('Failed to update product status:', error)
      alert('Failed to update product status')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive', icon: Package },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Review', icon: AlertTriangle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] ||
                   { color: 'bg-gray-100 text-gray-800', label: status, icon: Package }

    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getProductStats = () => {
    const stats = {
      total: products.length,
      active: products.filter(p => p.status === 'active').length,
      pending: products.filter(p => p.status === 'pending').length,
      rejected: products.filter(p => p.status === 'rejected').length,
      inactive: products.filter(p => p.status === 'inactive').length,
    }
    return stats
  }

  const stats = getProductStats()

  return (
    <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-1">Review and manage products across all vendors</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Products
              </Button>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                  <div className="text-sm text-gray-600">Active</div>
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
                  <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
                  <div className="text-sm text-gray-600">Inactive</div>
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
                      placeholder="Search products by name, SKU..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Products ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
              <TabsTrigger value="inactive">Inactive ({stats.inactive})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="space-y-6">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center text-white font-bold">
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{product.name}</CardTitle>
                              <p className="text-sm text-gray-600">SKU: {product.sku} • {product.category.name}</p>
                            </div>
                            {getStatusBadge(product.status)}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">
                              Added: {new Date(product.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Vendor Information</h4>
                            <div className="text-sm text-gray-600">
                              <div>{product.vendor.businessName}</div>
                              <div className="flex items-center mt-1">
                                {product.vendor.isVerified ? (
                                  <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">Unverified</Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Product Details</h4>
                            <div className="text-sm text-gray-600">
                              <div>Category: {product.category.name}</div>
                              {product._count && (
                                <>
                                  <div>Reviews: {product._count.reviews}</div>
                                  <div>Sales: {product._count.orderItems}</div>
                                </>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                            <div className="text-sm text-gray-600 line-clamp-3">
                              {product.description || 'No description provided'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product)
                                setShowProductDetails(true)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                          <div className="flex space-x-3">
                            {product.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleProductAction(product.id, 'approve')}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const reason = prompt('Enter rejection reason:')
                                    if (reason) {
                                      handleProductAction(product.id, 'reject', reason)
                                    }
                                  }}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {product.status !== 'pending' && (
                              <Select
                                value={product.status}
                                onValueChange={(value) => handleStatusChange(product.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600">
                      {activeTab === 'all'
                        ? "There are no products in the system yet."
                        : `There are no ${activeTab} products.`
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Product Details Modal */}
          <Dialog open={showProductDetails} onOpenChange={setShowProductDetails}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Product Details</DialogTitle>
              </DialogHeader>
              {selectedProduct && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                      {selectedProduct.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h3>
                      <p className="text-gray-600">{selectedProduct.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {getStatusBadge(selectedProduct.status)}
                        <Badge variant="outline">{selectedProduct.category.name}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Product Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">SKU:</span> {selectedProduct.sku}</div>
                        <div><span className="font-medium">Price:</span> ₹{selectedProduct.price.toLocaleString()}</div>
                        <div><span className="font-medium">Category:</span> {selectedProduct.category.name}</div>
                        <div><span className="font-medium">Created:</span> {new Date(selectedProduct.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Vendor Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Business:</span> {selectedProduct.vendor.businessName}</div>
                        <div>
                          <span className="font-medium">Status:</span>
                          {selectedProduct.vendor.isVerified ? (
                            <Badge className="bg-green-100 text-green-800 ml-2">Verified</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 ml-2">Unverified</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedProduct._count && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Statistics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{selectedProduct._count.reviews}</div>
                          <div className="text-sm text-blue-600">Reviews</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{selectedProduct._count.orderItems}</div>
                          <div className="text-sm text-green-600">Sales</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedProduct.images && selectedProduct.images.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Product Images</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedProduct.images.map((image, index) => (
                          <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={image}
                              alt={`${selectedProduct.name} - Image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}