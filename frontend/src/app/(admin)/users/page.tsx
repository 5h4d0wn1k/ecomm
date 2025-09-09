'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Users,
  Search,
  Filter,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  Download,
  UserPlus,
  Shield,
  AlertTriangle,
  Eye
} from 'lucide-react'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { apiClient } from '@/lib/api/client'

type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'customer' | 'vendor' | 'admin' | 'super_admin'
  isActive: boolean
  isVerified: boolean
  createdAt: string
  lastLoginAt?: string
  avatar?: string
  phoneNumber?: string
  totalOrders?: number
  totalSpent?: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  })

  useEffect(() => {
    fetchUsers()
  }, [searchQuery, roleFilter, statusFilter, pagination.page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (searchQuery) params.append('search', searchQuery)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await apiClient.get<{
        success: boolean
        data: User[]
        pagination: {
          page: number
          limit: number
          total: number
          pages: number
        }
      }>(`/admin/users?${params.toString()}`)

      if (response.data.success) {
        setUsers(response.data.data || [])
        setPagination({
          ...response.data.pagination,
          hasNext: response.data.pagination.page < response.data.pagination.pages,
          hasPrev: response.data.pagination.page > 1,
        })
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiClient.put(`/admin/users/${userId}/role`, { role: newRole })
      fetchUsers() // Refresh the list
      alert('User role updated successfully')
    } catch (error) {
      console.error('Failed to update user role:', error)
      alert('Failed to update user role')
    }
  }

  const handleStatusChange = async (userId: string, action: 'activate' | 'deactivate') => {
    try {
      const endpoint = action === 'activate' ? 'reactivate' : 'deactivate'
      await apiClient.put(`/admin/users/${userId}/${endpoint}`)
      fetchUsers() // Refresh the list
      alert(`User ${action}d successfully`)
    } catch (error) {
      console.error(`Failed to ${action} user:`, error)
      alert(`Failed to ${action} user`)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      customer: { color: 'bg-blue-100 text-blue-800', label: 'Customer' },
      vendor: { color: 'bg-green-100 text-green-800', label: 'Vendor' },
      admin: { color: 'bg-purple-100 text-purple-800', label: 'Admin' },
      super_admin: { color: 'bg-red-100 text-red-800', label: 'Super Admin' },
    }

    const config = roleConfig[role as keyof typeof roleConfig] ||
                  { color: 'bg-gray-100 text-gray-800', label: role }

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Shield className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) {
      return <Badge variant="destructive">Inactive</Badge>
    }
    if (!isVerified) {
      return <Badge className="bg-yellow-100 text-yellow-800">Unverified</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>
  }

  const getUserStats = () => {
    const stats = {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      verified: users.filter(u => u.isVerified).length,
      customers: users.filter(u => u.role === 'customer').length,
      vendors: users.filter(u => u.role === 'vendor').length,
      admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
    }
    return stats
  }

  const stats = getUserStats()

  return (
    <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Users
              </Button>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
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
                  <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
                  <div className="text-sm text-gray-600">Inactive</div>
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
                  <div className="text-2xl font-bold text-purple-600">{stats.customers}</div>
                  <div className="text-sm text-gray-600">Customers</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.vendors}</div>
                  <div className="text-sm text-gray-600">Vendors</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.admins}</div>
                  <div className="text-sm text-gray-600">Admins</div>
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
                      placeholder="Search users by name, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                              {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                              {user.phoneNumber && (
                                <div className="text-xs text-gray-500 flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {user.phoneNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.isActive, user.isVerified)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {user.lastLoginAt
                              ? new Date(user.lastLoginAt).toLocaleDateString()
                              : 'Never'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{user.totalOrders || 0}</div>
                            {user.totalSpent && (
                              <div className="text-gray-600">₹{user.totalSpent.toLocaleString()}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowUserDetails(true)
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  const newRole = prompt('Enter new role (customer, vendor, admin, super_admin):', user.role)
                                  if (newRole && ['customer', 'vendor', 'admin', 'super_admin'].includes(newRole)) {
                                    handleRoleChange(user.id, newRole)
                                  }
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              {user.isActive ? (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(user.id, 'deactivate')}
                                  className="text-red-600"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(user.id, 'activate')}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
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
            </CardContent>
          </Card>

          {/* User Details Modal */}
          <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {selectedUser.firstName?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-gray-600">{selectedUser.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {getRoleBadge(selectedUser.role)}
                        {getStatusBadge(selectedUser.isActive, selectedUser.isVerified)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedUser.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Joined</label>
                      <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Login</label>
                      <p className="text-gray-900">
                        {selectedUser.lastLoginAt
                          ? new Date(selectedUser.lastLoginAt).toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Total Orders</label>
                      <p className="text-gray-900">{selectedUser.totalOrders || 0}</p>
                    </div>
                  </div>

                  {selectedUser.totalSpent && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Total Spent</label>
                      <p className="text-gray-900">₹{selectedUser.totalSpent.toLocaleString()}</p>
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