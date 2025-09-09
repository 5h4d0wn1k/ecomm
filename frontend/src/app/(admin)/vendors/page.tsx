'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Store,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package,
  TrendingUp,
  Users,
  MoreHorizontal,
  Download
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

type Vendor = {
  id: string
  businessName: string
  businessDescription: string
  businessType: string
  businessCategory: string
  contactEmail: string
  contactPhone: string
  businessAddress: string
  city: string
  state: string
  zipCode: string
  gstNumber?: string
  panNumber?: string
  isVerified: boolean
  isActive: boolean
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  owner: {
    firstName: string
    lastName: string
    email: string
  }
  documents: {
    id: string
    type: string
    url: string
    status: 'pending' | 'approved' | 'rejected'
  }[]
  stats?: {
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    rating: number
  }
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showVendorDetails, setShowVendorDetails] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  })

  useEffect(() => {
    fetchVendors()
  }, [activeTab, searchQuery, statusFilter, pagination.page])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (activeTab !== 'all') params.append('status', activeTab)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      params.append('include', 'owner,documents,stats')

      const response = await apiClient.get<{
        success: boolean
        data: Vendor[]
        pagination: {
          page: number
          limit: number
          total: number
          pages: number
        }
      }>(`/admin/vendors?${params.toString()}`)

      if (response.data.success) {
        setVendors(response.data.data || [])
        setPagination({
          ...response.data.pagination,
          hasNext: response.data.pagination.page < response.data.pagination.pages,
          hasPrev: response.data.pagination.page > 1,
        })
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error)
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  const handleVendorAction = async (vendorId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject'
      const data = action === 'reject' ? { reason } : {}

      await apiClient.put(`/admin/vendors/${vendorId}/${endpoint}`, data)
      fetchVendors() // Refresh the list
      alert(`Vendor ${action}d successfully`)
    } catch (error) {
      console.error(`Failed to ${action} vendor:`, error)
      alert(`Failed to ${action} vendor`)
    }
  }

  const getStatusBadge = (status: string, isVerified: boolean) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Review', icon: AlertTriangle },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] ||
                  { color: 'bg-gray-100 text-gray-800', label: status, icon: Store }

    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getVendorStats = () => {
    const stats = {
      total: vendors.length,
      pending: vendors.filter(v => v.status === 'pending').length,
      approved: vendors.filter(v => v.status === 'approved').length,
      rejected: vendors.filter(v => v.status === 'rejected').length,
      verified: vendors.filter(v => v.isVerified).length,
      active: vendors.filter(v => v.isActive).length,
    }
    return stats
  }

  const stats = getVendorStats()

  return (
    <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
              <p className="text-gray-600 mt-1">Review and manage vendor applications</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Vendors
              </Button>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                <Store className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Vendors</div>
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
                  <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                  <div className="text-sm text-gray-600">Approved</div>
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
                  <div className="text-2xl font-bold text-blue-600">{stats.verified}</div>
                  <div className="text-sm text-gray-600">Verified</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.active}</div>
                  <div className="text-sm text-gray-600">Active</div>
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
                      placeholder="Search vendors by name, email..."
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
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Vendors Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Vendors ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : vendors.length > 0 ? (
                <div className="space-y-6">
                  {vendors.map((vendor) => (
                    <Card key={vendor.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                              {vendor.businessName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{vendor.businessName}</CardTitle>
                              <p className="text-sm text-gray-600">{vendor.businessType} • {vendor.businessCategory}</p>
                            </div>
                            {getStatusBadge(vendor.status, vendor.isVerified)}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              Applied: {new Date(vendor.createdAt).toLocaleDateString()}
                            </div>
                            {vendor.stats && (
                              <div className="text-sm text-gray-600 mt-1">
                                {vendor.stats.totalProducts} products • ₹{vendor.stats.totalRevenue.toLocaleString()} revenue
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-2" />
                                {vendor.contactEmail}
                              </div>
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                {vendor.contactPhone}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Business Address</h4>
                            <div className="text-sm text-gray-600">
                              <div className="flex items-start">
                                <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                                <div>
                                  {vendor.businessAddress}<br />
                                  {vendor.city}, {vendor.state} {vendor.zipCode}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Owner Details</h4>
                            <div className="text-sm text-gray-600">
                              <div>{vendor.owner.firstName} {vendor.owner.lastName}</div>
                              <div>{vendor.owner.email}</div>
                            </div>
                          </div>
                        </div>

                        {vendor.documents && vendor.documents.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                            <div className="flex flex-wrap gap-2">
                              {vendor.documents.map((doc) => (
                                <Badge key={doc.id} variant="outline" className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  {doc.type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedVendor(vendor)
                                setShowVendorDetails(true)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                          <div className="flex space-x-3">
                            {vendor.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleVendorAction(vendor.id, 'approve')}
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
                                      handleVendorAction(vendor.id, 'reject', reason)
                                    }
                                  }}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </>
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
                    <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
                    <p className="text-gray-600">
                      {activeTab === 'all'
                        ? "There are no vendors in the system yet."
                        : `There are no ${activeTab} vendors.`
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Vendor Details Modal */}
          <Dialog open={showVendorDetails} onOpenChange={setShowVendorDetails}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Vendor Details</DialogTitle>
              </DialogHeader>
              {selectedVendor && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {selectedVendor.businessName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedVendor.businessName}</h3>
                      <p className="text-gray-600">{selectedVendor.businessDescription}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {getStatusBadge(selectedVendor.status, selectedVendor.isVerified)}
                        <Badge variant="outline">{selectedVendor.businessType}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Business Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Category:</span> {selectedVendor.businessCategory}</div>
                        <div><span className="font-medium">GST:</span> {selectedVendor.gstNumber || 'Not provided'}</div>
                        <div><span className="font-medium">PAN:</span> {selectedVendor.panNumber || 'Not provided'}</div>
                        <div><span className="font-medium">Applied:</span> {new Date(selectedVendor.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {selectedVendor.contactEmail}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {selectedVendor.contactPhone}
                        </div>
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                          <div>
                            {selectedVendor.businessAddress}<br />
                            {selectedVendor.city}, {selectedVendor.state} {selectedVendor.zipCode}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedVendor.stats && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Performance Statistics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{selectedVendor.stats.totalProducts}</div>
                          <div className="text-sm text-blue-600">Products</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{selectedVendor.stats.totalOrders}</div>
                          <div className="text-sm text-green-600">Orders</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">₹{selectedVendor.stats.totalRevenue.toLocaleString()}</div>
                          <div className="text-sm text-purple-600">Revenue</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{selectedVendor.stats.rating}</div>
                          <div className="text-sm text-yellow-600">Rating</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedVendor.documents && selectedVendor.documents.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Submitted Documents</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedVendor.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">{doc.type}</div>
                                <Badge variant={doc.status === 'approved' ? 'default' : doc.status === 'rejected' ? 'destructive' : 'secondary'}>
                                  {doc.status}
                                </Badge>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
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