'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  MapPin,
  CreditCard,
  Heart,
  ShoppingBag,
  Settings,
  Bell,
  Shield,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'
import { apiClient } from '@/lib/api/client'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  // Mock data for demonstration
  const [stats] = useState({
    totalOrders: 24,
    totalSpent: 45670,
    wishlistItems: 12,
    reviewsGiven: 18
  })

  const [recentOrders] = useState([
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 2340,
      items: 2
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      status: 'shipped',
      total: 1890,
      items: 1
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      status: 'processing',
      total: 3450,
      items: 3
    }
  ])

  const [addresses] = useState([
    {
      id: '1',
      type: 'home',
      name: 'John Doe',
      address: '123 Main Street, Sector 15',
      city: 'Gurgaon',
      state: 'Haryana',
      zipCode: '122001',
      isDefault: true
    },
    {
      id: '2',
      type: 'work',
      name: 'John Doe',
      address: '456 Business Park, Phase 2',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      isDefault: false
    }
  ])

  const [paymentMethods] = useState([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: '2',
      type: 'upi',
      upiId: 'john@ybl',
      isDefault: false
    }
  ])

  const handleProfileUpdate = async (data: ProfileForm) => {
    setIsLoading(true)
    try {
      // In real app, make API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateUser({ ...user!, ...data })
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      alert('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (data: PasswordForm) => {
    setIsLoading(true)
    try {
      // In real app, make API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      passwordForm.reset()
      alert('Password changed successfully!')
    } catch (error) {
      alert('Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please login to view your profile</h1>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src="" alt={user.firstName} />
              <AvatarFallback className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xl">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified Customer
                </Badge>
                <Badge variant="outline">
                  Member since {new Date().getFullYear()}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.wishlistItems}</div>
              <p className="text-xs text-muted-foreground">
                3 new this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews Given</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reviewsGiven}</div>
              <p className="text-xs text-muted-foreground">
                4.8 average rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isEditing ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">First Name</label>
                          <p className="text-gray-900">{user.firstName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Last Name</label>
                          <p className="text-gray-900">{user.lastName}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                      </div>
                      <Button onClick={() => setIsEditing(true)} className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </>
                  ) : (
                    <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">First Name</label>
                          <Input {...profileForm.register('firstName')} />
                          {profileForm.formState.errors.firstName && (
                            <p className="text-sm text-red-600 mt-1">
                              {profileForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Last Name</label>
                          <Input {...profileForm.register('lastName')} />
                          {profileForm.formState.errors.lastName && (
                            <p className="text-sm text-red-600 mt-1">
                              {profileForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <Input {...profileForm.register('email')} type="email" />
                        {profileForm.formState.errors.email && (
                          <p className="text-sm text-red-600 mt-1">
                            {profileForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <Input {...profileForm.register('phone')} />
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" disabled={isLoading} className="flex-1">
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest orders and interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{order.id}</p>
                          <p className="text-sm text-gray-600">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            ₹{order.total.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and manage your past orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{order.id}</h4>
                          <p className="text-sm text-gray-600">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <p className="font-medium text-gray-900 mt-1">
                            ₹{order.total.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">{order.items} items</p>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Addresses
                </CardTitle>
                <CardDescription>Manage your delivery addresses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={address.type === 'home' ? 'default' : 'secondary'}>
                              {address.type}
                            </Badge>
                            {address.isDefault && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-gray-900 mb-1">{address.name}</p>
                          <p className="text-gray-700">{address.address}</p>
                          <p className="text-gray-700">{address.city}, {address.state} {address.zipCode}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline">
                    <MapPin className="w-4 h-4 mr-2" />
                    Add New Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Methods
                </CardTitle>
                <CardDescription>Manage your saved payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {method.type === 'card' ? (
                            <CreditCard className="w-6 h-6 text-gray-600" />
                          ) : (
                            <div className="w-6 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                              UPI
                            </div>
                          )}
                          <div>
                            {method.type === 'card' ? (
                              <>
                                <p className="font-medium text-gray-900">
                                  {method.brand} **** {method.last4}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Expires {method.expiryMonth}/{method.expiryYear}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-medium text-gray-900">UPI ID</p>
                                <p className="text-sm text-gray-600">{method.upiId}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {method.isDefault && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Default
                            </Badge>
                          )}
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add New Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Current Password</label>
                      <div className="relative">
                        <Input
                          {...passwordForm.register('currentPassword')}
                          type={showPassword ? 'text' : 'password'}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-600 mt-1">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">New Password</label>
                      <Input
                        {...passwordForm.register('newPassword')}
                        type="password"
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-red-600 mt-1">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                      <Input
                        {...passwordForm.register('confirmPassword')}
                        type="password"
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-600 mt-1">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Manage your notification settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Order Updates</p>
                      <p className="text-sm text-gray-600">Get notified about order status changes</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Promotional Emails</p>
                      <p className="text-sm text-gray-600">Receive offers and discounts</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">New Product Alerts</p>
                      <p className="text-sm text-gray-600">Be first to know about new arrivals</p>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Receive order updates via SMS</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}