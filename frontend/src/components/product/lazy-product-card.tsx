'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Star, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LazyProductImage } from '@/components/ui/lazy-image'

interface LazyProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  rating: number
  reviewCount: number
  image: string
  badge?: string
  isNew?: boolean
  isBestSeller?: boolean
  category?: string
  onAddToCart?: () => void
  onToggleWishlist?: () => void
  isInWishlist?: boolean
  priority?: boolean
}

export function LazyProductCard({
  id,
  name,
  price,
  originalPrice,
  discount,
  rating,
  reviewCount,
  image,
  badge,
  isNew,
  isBestSeller,
  category,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  priority = false
}: LazyProductCardProps) {


  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
      {/* Product Image */}
      <div className="relative">
        <Link href={`/products/${id}`}>
          <LazyProductImage
            src={image}
            alt={name}
            className="w-full bg-gradient-to-br from-gray-50 to-gray-100"
            priority={priority}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-2">
          {badge && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              {badge}
            </span>
          )}
          {isNew && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              NEW
            </span>
          )}
          {isBestSeller && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              BEST SELLER
            </span>
          )}
          {discount && discount > 0 && (
            <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleWishlist?.()
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
            isInWishlist
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100'
          }`}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {category && (
          <span className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">
            {category}
          </span>
        )}

        {/* Product Name */}
        <Link href={`/products/${id}`}>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors leading-tight">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < Math.floor(rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs text-gray-600 ml-1">
            ({reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            ₹{price.toLocaleString()}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-500 line-through">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
          {discount && discount > 0 && (
            <span className="text-sm text-green-600 font-semibold">
              {discount}% off
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={(e) => {
            e.preventDefault()
            onAddToCart?.()
          }}
          size="sm"
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          aria-label={`Add ${name} to cart`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  )
}

// Optimized Product Grid with Lazy Loading
interface LazyProductGridProps {
  products: LazyProductCardProps[]
  columns?: {
    default: number
    md: number
    lg: number
  }
  className?: string
}

export function LazyProductGrid({
  products,
  columns = { default: 2, md: 4, lg: 6 },
  className = ''
}: LazyProductGridProps) {
  const gridClasses = `grid grid-cols-${columns.default} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} gap-4`

  return (
    <div className={`${gridClasses} ${className}`}>
      {products.map((product, index) => (
        <LazyProductCard
          key={product.id}
          {...product}
          priority={index < 4} // Prioritize first 4 images
        />
      ))}
    </div>
  )
}