'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Bell, X, Zap, Package, TrendingDown, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

interface RealTimeNotificationsProps {
  isOpen: boolean
  onClose: () => void
}

interface Notification {
  id: string
  type: 'flash_sale' | 'inventory_update' | 'price_drop' | 'restock' | 'personalized_offer'
  title: string
  message: string
  product?: {
    id: number
    name: string
    image: string
    originalPrice?: number
    salePrice?: number
  }
  timestamp: Date
  isRead: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionUrl?: string
  expiresAt?: Date
}

export function RealTimeNotifications({ isOpen, onClose }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'flash_sale',
      title: '⚡ Flash Sale Alert!',
      message: 'iPhone 15 Pro Max - 30% off for next 15 minutes!',
      product: {
        id: 1,
        name: 'iPhone 15 Pro Max',
        image: '/api/placeholder/100/100',
        originalPrice: 139900,
        salePrice: 97930
      },
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      isRead: false,
      priority: 'urgent',
      actionUrl: '/products/iphone-15-pro-max',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // expires in 15 minutes
    },
    {
      id: '2',
      type: 'inventory_update',
      title: 'Stock Update',
      message: 'Only 3 items left in stock for Samsung Galaxy S24',
      product: {
        id: 2,
        name: 'Samsung Galaxy S24',
        image: '/api/placeholder/100/100'
      },
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      isRead: false,
      priority: 'high',
      actionUrl: '/products/samsung-galaxy-s24'
    },
    {
      id: '3',
      type: 'price_drop',
      title: 'Price Drop!',
      message: 'Nike Air Max just dropped ₹2,000',
      product: {
        id: 3,
        name: 'Nike Air Max 270',
        image: '/api/placeholder/100/100',
        originalPrice: 12999,
        salePrice: 10999
      },
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      isRead: true,
      priority: 'medium',
      actionUrl: '/products/nike-air-max-270'
    },
    {
      id: '4',
      type: 'restock',
      title: 'Back in Stock!',
      message: 'Your wishlist item "MacBook Pro M3" is now available',
      product: {
        id: 4,
        name: 'MacBook Pro M3',
        image: '/api/placeholder/100/100'
      },
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: true,
      priority: 'medium',
      actionUrl: '/products/macbook-pro-m3'
    },
    {
      id: '5',
      type: 'personalized_offer',
      title: 'Special Offer for You!',
      message: 'Get 20% off on your next fashion purchase',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      isRead: false,
      priority: 'low',
      actionUrl: '/categories/fashion'
    }
  ])

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'urgent'>('all')
  const [showToast, setShowToast] = useState(false)
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket connection for real-time updates
  useEffect(() => {
    // Simulate WebSocket connection
    const connectWebSocket = () => {
      // In a real implementation, this would connect to your WebSocket server
      console.log('Connecting to notification WebSocket...')

      // Simulate receiving notifications
      const interval = setInterval(() => {
        // Randomly simulate new notifications
        if (Math.random() < 0.1) { // 10% chance every 5 seconds
          const mockNotification: Notification = {
            id: Date.now().toString(),
            type: 'flash_sale',
            title: '🚨 Limited Time Deal!',
            message: 'Sony WH-1000XM5 Headphones - 25% off!',
            product: {
              id: Math.floor(Math.random() * 1000),
              name: 'Sony WH-1000XM5',
              image: '/api/placeholder/100/100',
              originalPrice: 29999,
              salePrice: 22499
            },
            timestamp: new Date(),
            isRead: false,
            priority: 'urgent',
            actionUrl: '/products/sony-wh-1000xm5',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
          }

          setNotifications(prev => [mockNotification, ...prev])
          setLatestNotification(mockNotification)
          setShowToast(true)

          // Auto-hide toast after 5 seconds
          setTimeout(() => setShowToast(false), 5000)
        }
      }, 5000)

      return () => clearInterval(interval)
    }

    if (isOpen) {
      connectWebSocket()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [isOpen])

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    switch (activeFilter) {
      case 'unread':
        return !notification.isRead
      case 'urgent':
        return notification.priority === 'urgent' || notification.priority === 'high'
      default:
        return true
    }
  })

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  // Delete notification
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'flash_sale':
        return <Zap className="h-5 w-5 text-orange-500" />
      case 'inventory_update':
        return <Package className="h-5 w-5 text-blue-500" />
      case 'price_drop':
        return <TrendingDown className="h-5 w-5 text-green-500" />
      case 'restock':
        return <CheckCircle className="h-5 w-5 text-purple-500" />
      case 'personalized_offer':
        return <Bell className="h-5 w-5 text-pink-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50'
      case 'high':
        return 'border-orange-500 bg-orange-50'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-gray-500 bg-gray-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

  // Format time ago
  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (!isOpen) return null

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-8 w-8" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Notifications</h2>
                  <p className="text-blue-100">Stay updated with real-time alerts</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-white hover:bg-white/20"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  ×
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All', count: notifications.length },
                { id: 'unread', label: 'Unread', count: unreadCount },
                { id: 'urgent', label: 'Urgent', count: notifications.filter(n => n.priority === 'urgent' || n.priority === 'high').length }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[500px] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeFilter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </h3>
                <p className="text-gray-600">
                  {activeFilter === 'unread'
                    ? 'You\'re all caught up!'
                    : 'Notifications will appear here when there are updates.'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-gray-700 text-sm mt-1">
                              {notification.message}
                            </p>

                            {/* Product Info */}
                            {notification.product && (
                              <div className="flex items-center gap-3 mt-3 p-2 bg-white rounded-lg border">
                                <Image
                                  src={notification.product.image}
                                  alt={notification.product.name}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.product.name}
                                  </p>
                                  {notification.product.originalPrice && notification.product.salePrice && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-500 line-through">
                                        ₹{notification.product.originalPrice.toLocaleString()}
                                      </span>
                                      <span className="text-sm font-bold text-green-600">
                                        ₹{notification.product.salePrice.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Timestamp and Expiry */}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{formatTimeAgo(notification.timestamp)}</span>
                              {notification.expiresAt && (
                                <span className="flex items-center gap-1 text-orange-600">
                                  <Clock className="h-3 w-3" />
                                  Expires {formatTimeAgo(notification.expiresAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            {notification.actionUrl && (
                              <Button
                                size="sm"
                                onClick={() => window.location.href = notification.actionUrl!}
                                className="bg-purple-500 hover:bg-purple-600"
                              >
                                View
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mark as read button for unread notifications */}
                    {!notification.isRead && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Mark as read
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Real-time notifications active</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Connected</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {showToast && latestNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-right">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${getPriorityColor(latestNotification.priority)}`}>
                {getNotificationIcon(latestNotification.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {latestNotification.title}
                </h4>
                <p className="text-gray-700 text-sm mt-1">
                  {latestNotification.message}
                </p>
                {latestNotification.product && (
                  <p className="text-sm font-medium text-purple-600 mt-2">
                    {latestNotification.product.name}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowToast(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {latestNotification.actionUrl && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <Button
                  size="sm"
                  onClick={() => {
                    window.location.href = latestNotification.actionUrl!
                    setShowToast(false)
                  }}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  View Deal
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}