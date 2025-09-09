'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ThumbsUp, ThumbsDown, Flag, MessageCircle, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SocialShare } from '@/components/ui/social-share'
import { useAuthStore } from '@/lib/stores/auth-store'
import { apiClient } from '@/lib/api/client'

interface Review {
  id: number
  rating: number
  title: string
  comment: string
  createdAt: string
  helpful: number
  notHelpful: number
  userVote?: 'helpful' | 'notHelpful'
  user: {
    firstName: string
    lastName: string
  }
  verified: boolean
}

interface EnhancedReviewsProps {
  productId: number
  productName: string
  productImage?: string
  className?: string
}

export function EnhancedReviews({
  productId,
  productName,
  productImage,
  className = ""
}: EnhancedReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful' | 'rating'>('newest')
  const [filterRating, setFilterRating] = useState<number | null>(null)


  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)

      let url = `/reviews?productId=${productId}&sort=${sortBy}`
      if (filterRating) {
        url += `&rating=${filterRating}`
      }

      const response = await apiClient.get(url)
      setReviews(response.data.data || [])
    } catch (err: unknown) {
      console.error('Failed to fetch reviews:', err)
    } finally {
      setLoading(false)
    }
  }, [productId, sortBy, filterRating])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleVote = async (reviewId: number, voteType: 'helpful' | 'notHelpful') => {
    if (!isAuthenticated) {
      // Redirect to login or show message
      return
    }

    try {
      await apiClient.post(`/reviews/${reviewId}/vote`, { voteType })

      // Update local state
      setReviews(prev => prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              userVote: voteType,
              helpful: voteType === 'helpful' ? review.helpful + 1 : review.helpful,
              notHelpful: voteType === 'notHelpful' ? review.notHelpful + 1 : review.notHelpful
            }
          : review
      ))
    } catch (err) {
      console.error('Failed to vote on review:', err)
    }
  }

  const handleReport = async (reviewId: number) => {
    if (!isAuthenticated) return

    try {
      await apiClient.post(`/reviews/${reviewId}/report`, {
        reason: 'inappropriate_content'
      })
      // Show success message
    } catch (err) {
      console.error('Failed to report review:', err)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]
    reviews.forEach(review => {
      distribution[review.rating - 1]++
    })
    return distribution
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
          <div className="flex items-center mt-2">
            <div className="flex items-center mr-4">
              {renderStars(Math.round(getAverageRating()))}
              <span className="ml-2 text-lg font-semibold">
                {getAverageRating().toFixed(1)}
              </span>
            </div>
            <span className="text-gray-600">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <SocialShare
            url={`/products/${productId}`}
            title={`Check out ${productName}`}
            description={`Rated ${getAverageRating().toFixed(1)} stars by ${reviews.length} customers`}
            image={productImage}
          />

          {isAuthenticated && (
            <Button
              onClick={() => setShowReviewForm(true)}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              Write a Review
            </Button>
          )}
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Rating Breakdown</h4>
        <div className="space-y-2">
          {getRatingDistribution().reverse().map((count, index) => {
            const rating = 5 - index
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0

            return (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-current ml-1" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'helpful' | 'rating')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rated</option>
          </select>

          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share your experience with this product!</p>
            {isAuthenticated && (
              <Button
                onClick={() => setShowReviewForm(true)}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                Write the First Review
              </Button>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {review.user.firstName} {review.user.lastName}
                      </span>
                      {review.verified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <SocialShare
                    url={`/products/${productId}#review-${review.id}`}
                    title={`Review of ${productName}`}
                    description={`${review.user.firstName}'s ${review.rating}-star review`}
                  />
                  <button
                    onClick={() => handleReport(review.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Report review"
                  >
                    <Flag className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              )}

              <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVote(review.id, 'helpful')}
                    disabled={!isAuthenticated || review.userVote === 'helpful'}
                    className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-full transition-colors ${
                      review.userVote === 'helpful'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Helpful ({review.helpful})</span>
                  </button>

                  <button
                    onClick={() => handleVote(review.id, 'notHelpful')}
                    disabled={!isAuthenticated || review.userVote === 'notHelpful'}
                    className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-full transition-colors ${
                      review.userVote === 'notHelpful'
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>Not helpful ({review.notHelpful})</span>
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  {review.helpful + review.notHelpful} people found this review helpful
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {reviews.length >= 10 && (
        <div className="text-center">
          <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50">
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  )
}