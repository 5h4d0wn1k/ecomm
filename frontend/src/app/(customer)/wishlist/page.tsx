'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Share2, Star, Grid, List } from 'lucide-react'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { Product } from '@/lib/types'

type ProductWithRating = Product & {
  averageRating?: number
  totalReviews?: number
}

export default function WishlistPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('recent')
  const {
    items: wishlistItems,
    fetchWishlist,
    removeFromWishlist,
  } = useWishlistStore()
  const { addItem } = useCartStore()

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const addToCart = (product: ProductWithRating) => {
    addItem(product, 1)
    alert(`${product.name} added to cart!`)
    removeFromWishlist(product.id)
  }

  const shareWishlist = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Wishlist',
        text: 'Check out my wishlist on MultiVendor',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Wishlist link copied to clipboard!')
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
              <p className="text-gray-600">{wishlistItems.length} items saved for later</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={shareWishlist}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Wishlist
              </Button>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="recent">Recently Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
                  <Image
                    src={item.product?.images[0] || '/placeholder-product.jpg'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes={viewMode === 'list' ? '192px' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'}
                  />
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-current text-red-500" />
                  </button>
                  {item.product.compareAtPrice && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {Math.round(((item.product.compareAtPrice - item.product.price) / item.product.compareAtPrice) * 100)}% OFF
                      </span>
                    </div>
                  )}
                  {item.product.stockQuantity === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>

                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">{item.product.vendor.businessName}</span>
                    <span className="text-xs text-gray-500 mx-2">•</span>
                    <span className="text-xs text-gray-500">{item.product.category.name}</span>
                  </div>

                  <Link href={`/products/${item.productId}`}>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-pink-500 transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor((item.product as ProductWithRating).averageRating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                      {(item.product as ProductWithRating).averageRating?.toFixed(1) || 0} ({(item.product as ProductWithRating).totalReviews || 0})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{item.product.price.toLocaleString()}
                    </span>
                    {item.product.compareAtPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{item.product.compareAtPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => addToCart(item.product)}
                      disabled={item.product.stockQuantity === 0}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {item.product.stockQuantity > 0 ? 'Move to Cart' : 'Out of Stock'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Added on {new Date(item.addedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Wishlist */
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Save items you love for later. Start shopping and add items to your wishlist!
            </p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                Start Shopping
              </Button>
            </Link>
          </div>
        )}

        {/* Wishlist Stats */}
        {wishlistItems.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wishlist Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-500 mb-1">{wishlistItems.length}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500 mb-1">
                  {wishlistItems.filter(item => item.product.stockQuantity > 0).length}
                </div>
                <div className="text-sm text-gray-600">In Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  ₹{wishlistItems.reduce((sum, item) => sum + item.product.price, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500 mb-1">
                  {(wishlistItems.reduce((sum, item) => sum + ((item.product as ProductWithRating).averageRating || 0), 0) / wishlistItems.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>
        )}

        {/* Related Suggestions */}
        {wishlistItems.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Suggested Product {i}</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      Suggested Item {i}
                    </h4>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg font-bold text-gray-900">₹{Math.floor(Math.random() * 5000) + 1000}</span>
                      <span className="text-sm text-green-600">20% off</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600" size="sm">
                      Add to Wishlist
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}