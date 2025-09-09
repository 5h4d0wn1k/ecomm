'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Brain, Target, Gift, TrendingUp, Clock, Star, Heart, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Progress } from '@/components/ui/progress'

interface SmartNotificationsProps {
  isOpen: boolean
  onClose: () => void
}

interface SmartNotification {
  id: string
  type: 'personalized_offer' | 'abandoned_cart' | 'price_alert' | 'restock_alert' | 'style_recommendation' | 'loyalty_reward'
  title: string
  message: string
  reasoning: string
  confidence: number
  product?: {
    id: number
    name: string
    image: string
    price: number
    originalPrice?: number
  }
  action: {
    label: string
    url: string
    type: 'primary' | 'secondary'
  }
  timestamp: Date
  expiresAt?: Date
  isRead: boolean
  priority: 'low' | 'medium' | 'high'
}

export function SmartNotifications({ isOpen, onClose }: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<SmartNotification[]>([
    {
      id: '1',
      type: 'personalized_offer',
      title: '🎯 Personalized for You',
      message: 'Based on your recent fashion purchases, you might love this trending dress!',
      reasoning: 'AI analysis of your browsing history and purchase patterns shows 85% match with your style preferences',
      confidence: 0.85,
      product: {
        id: 1,
        name: 'Floral Maxi Dress',
        image: '/api/placeholder/150/200',
        price: 2499,
        originalPrice: 3999
      },
      action: {
        label: 'View & Buy',
        url: '/products/floral-maxi-dress',
        type: 'primary'
      },
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'abandoned_cart',
      title: '🛒 Don\'t Forget Your Cart!',
      message: 'You left 3 items in your cart. Complete your purchase now!',
      reasoning: 'Cart abandonment detected 2 hours ago with high-value items still available',
      confidence: 0.95,
      action: {
        label: 'Complete Purchase',
        url: '/cart',
        type: 'primary'
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isRead: false,
      priority: 'high'
    },
    {
      id: '3',
      type: 'price_alert',
      title: '📉 Price Drop Alert!',
      message: 'iPhone 15 Pro is now ₹10,000 cheaper than when you viewed it',
      reasoning: 'Price monitoring system detected significant drop on item you showed interest in',
      confidence: 0.90,
      product: {
        id: 2,
        name: 'iPhone 15 Pro',
        image: '/api/placeholder/150/200',
        price: 124900,
        originalPrice: 134900
      },
      action: {
        label: 'Buy Now',
        url: '/products/iphone-15-pro',
        type: 'primary'
      },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: false,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'style_recommendation',
      title: '✨ Style Match Found',
      message: 'Complete your outfit with these perfectly matching accessories',
      reasoning: 'Style analysis of your wardrobe shows these items complement your existing pieces',
      confidence: 0.78,
      action: {
        label: 'Explore Matches',
        url: '/style-recommendations',
        type: 'secondary'
      },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isRead: true,
      priority: 'medium'
    },
    {
      id: '5',
      type: 'loyalty_reward',
      title: '🎉 Loyalty Reward Unlocked!',
      message: 'You\'ve earned 500 bonus points for your continued shopping',
      reasoning: 'Loyalty program analysis shows you\'ve reached the monthly spending milestone',
      confidence: 1.0,
      action: {
        label: 'Claim Reward',
        url: '/rewards',
        type: 'primary'
      },
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      isRead: false,
      priority: 'medium'
    }
  ])

  const [activeTab, setActiveTab] = useState<'all' | 'offers' | 'alerts' | 'insights'>('all')
  const [aiInsights, setAiInsights] = useState({
    spendingPattern: 'Fashion enthusiast with preference for premium brands',
    favoriteCategory: 'Electronics & Fashion',
    averageOrderValue: 4500,
    shoppingFrequency: 'Weekly',
    styleProfile: 'Modern & Trendy',
    nextPredictedPurchase: 'Accessories within 3 days'
  })

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'offers':
        return ['personalized_offer', 'loyalty_reward'].includes(notification.type)
      case 'alerts':
        return ['abandoned_cart', 'price_alert', 'restock_alert'].includes(notification.type)
      case 'insights':
        return ['style_recommendation'].includes(notification.type)
      default:
        return true
    }
  })

  // Mark as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'personalized_offer':
        return <Target className="h-5 w-5 text-purple-500" />
      case 'abandoned_cart':
        return <ShoppingCart className="h-5 w-5 text-orange-500" />
      case 'price_alert':
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'restock_alert':
        return <Star className="h-5 w-5 text-blue-500" />
      case 'style_recommendation':
        return <Heart className="h-5 w-5 text-pink-500" />
      case 'loyalty_reward':
        return <Gift className="h-5 w-5 text-yellow-500" />
      default:
        return <Brain className="h-5 w-5 text-gray-500" />
    }
  }

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  // Format time ago
  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Smart Notifications</h2>
                <p className="text-purple-100">AI-powered personalized alerts & insights</p>
              </div>
            </div>
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

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'offers', label: 'Offers', count: notifications.filter(n => ['personalized_offer', 'loyalty_reward'].includes(n.type)).length },
              { id: 'alerts', label: 'Alerts', count: notifications.filter(n => ['abandoned_cart', 'price_alert', 'restock_alert'].includes(n.type)).length },
              { id: 'insights', label: 'Insights', count: notifications.filter(n => n.type === 'style_recommendation').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-500 border-b-2 border-purple-500 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-500 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Insights Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-6 w-6 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">AI Shopping Profile</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600">Style Profile</div>
              <div className="font-semibold text-purple-600">{aiInsights.styleProfile}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600">Favorite Category</div>
              <div className="font-semibold text-purple-600">{aiInsights.favoriteCategory}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600">Avg Order Value</div>
              <div className="font-semibold text-purple-600">₹{aiInsights.averageOrderValue.toLocaleString()}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600">Shopping Frequency</div>
              <div className="font-semibold text-purple-600">{aiInsights.shoppingFrequency}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600">Next Prediction</div>
              <div className="font-semibold text-purple-600 text-sm">{aiInsights.nextPredictedPurchase}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600">Unread Alerts</div>
              <div className="font-semibold text-red-600">{unreadCount}</div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications in this category</h3>
              <p className="text-gray-600">Check back later for personalized recommendations!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-purple-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>

                      <p className="text-gray-700 mb-3">
                        {notification.message}
                      </p>

                      {/* AI Reasoning */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-700">AI Analysis</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(notification.confidence)}`}>
                            {Math.round(notification.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{notification.reasoning}</p>
                      </div>

                      {/* Product Preview */}
                      {notification.product && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                          <div className="flex items-center gap-4">
                            <Image
                              src={notification.product.image}
                              alt={notification.product.name}
                              width={64}
                              height={80}
                              className="w-16 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{notification.product.name}</h5>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-bold text-gray-900">
                                  ₹{notification.product.price.toLocaleString()}
                                </span>
                                {notification.product.originalPrice && (
                                  <span className="text-sm text-gray-500 line-through">
                                    ₹{notification.product.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
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
                    <div className="flex-shrink-0 flex flex-col gap-2">
                      <Button
                        onClick={() => window.location.href = notification.action.url}
                        className={notification.action.type === 'primary'
                          ? 'bg-purple-500 hover:bg-purple-600'
                          : 'bg-gray-500 hover:bg-gray-600'
                        }
                      >
                        {notification.action.label}
                      </Button>
                      {!notification.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span>AI-powered recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Learning from your preferences</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}