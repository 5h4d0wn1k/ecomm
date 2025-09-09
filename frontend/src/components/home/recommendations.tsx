'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Star, TrendingUp, Sparkles, RefreshCw } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'
import { apiClient } from '@/lib/api/client'

interface Recommendation {
  id: number
  name: string
  price: number
  images: string[]
  averageRating: number
  totalReviews: number
  vendor: {
    businessName: string
    isVerified: boolean
  }
  category: {
    name: string
  }
  recommendationReason: string
}

interface RecommendationsProps {
  title?: string
  type?: 'personalized' | 'trending'
  limit?: number
  className?: string
}

export function Recommendations({
  title = "Recommended for You",
  type = 'personalized',
  limit = 6,
  className = ""
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const fetchRecommendations = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)
      setError(null)

      const endpoint = isAuthenticated && type === 'personalized'
        ? `/recommendations/personalized?limit=${limit}&type=mixed`
        : `/recommendations/trending?limit=${limit}`

      const response = await apiClient.get(endpoint)
      setRecommendations(response.data.data || [])
    } catch (err: unknown) {
      console.error('Failed to fetch recommendations:', err)
      setError('Failed to load recommendations')
      // Fallback to empty array
      setRecommendations([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [isAuthenticated, type, limit])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  const handleRefresh = () => {
    fetchRecommendations(true)
  }

  if (loading) {
    return (
      <section className={`py-12 bg-white ${className}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center mb-2">
                <Sparkles className="w-5 h-5 text-pink-500 mr-2" />
                <span className="text-sm font-medium text-pink-500 uppercase tracking-wide">AI Powered</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error || recommendations.length === 0) {
    return (
      <section className={`py-12 bg-white ${className}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center mb-2">
                <Sparkles className="w-5 h-5 text-pink-500 mr-2" />
                <span className="text-sm font-medium text-pink-500 uppercase tracking-wide">AI Powered</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-pink-500 text-pink-500 hover:bg-pink-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error ? 'Unable to load recommendations' : 'No recommendations available'}
            </h3>
            <p className="text-gray-600 mb-4">
              {error
                ? 'Please try again later or browse our featured products.'
                : 'Start shopping to get personalized recommendations!'
              }
            </p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`py-12 bg-white ${className}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center mb-2">
              <Sparkles className="w-5 h-5 text-pink-500 mr-2" />
              <span className="text-sm font-medium text-pink-500 uppercase tracking-wide">
                {type === 'personalized' ? 'AI Powered' : 'Trending Now'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 text-sm mt-1">
              {type === 'personalized'
                ? 'Curated just for you based on your preferences'
                : 'Most popular products this week'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-pink-500 text-pink-500 hover:bg-pink-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/products">
              <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50">
                View All
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommendations.map((product) => (
            <div key={product.id} className="group relative">
              <ProductCard
                product={{
                  ...product,
                  images: product.images || [],
                  vendor: product.vendor,
                  category: product.category,
                }}
                className="h-full"
              />

              {/* Recommendation Badge */}
              <div className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {product.recommendationReason}
              </div>

              {/* Trust Indicators */}
              {product.vendor.isVerified && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                  <Star className="h-3 w-3 fill-current" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recommendation Stats */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center bg-gray-50 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-pink-500 mr-2" />
            <span className="text-sm text-gray-600">
              {type === 'personalized'
                ? `${recommendations.length} personalized recommendations`
                : `${recommendations.length} trending products`
              }
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}