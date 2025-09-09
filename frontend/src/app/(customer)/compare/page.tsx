'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X, Star, ShoppingCart, Heart, Share2, Plus } from 'lucide-react'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { useCompareStore } from '@/lib/stores/compare-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { useWishlistStore } from '@/lib/stores/wishlist-store'

export default function ComparePage() {
  const { items: comparedProducts, removeFromCompare } = useCompareStore()
  const { addItem: addToCart } = useCartStore()
  const { addToWishlist } = useWishlistStore()

  const shareComparison = () => {
    const productIds = comparedProducts.map(p => p.id).join(',')
    const shareUrl = `${window.location.origin}/compare?products=${productIds}`

    if (navigator.share) {
      navigator.share({
        title: 'Product Comparison',
        text: 'Check out this product comparison',
        url: shareUrl
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert('Comparison link copied to clipboard!')
    }
  }

  if (comparedProducts.length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Products to Compare</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Add products to compare their features, specifications, and prices side by side.
            </p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  // Get all unique specification keys
  const allSpecs = Array.from(
    new Set(comparedProducts.flatMap(product => product.specifications ? Object.keys(product.specifications) : []))
  )

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Products</h1>
            <p className="text-gray-600">Compare {comparedProducts.length} products side by side</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={shareComparison}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Comparison
            </Button>
            <Link href="/products">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add More Products
              </Button>
            </Link>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Product Headers */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="hidden md:block"></div>
              {comparedProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="text-center">
                    <Image
                      src={product.image || product.images[0] || '/placeholder-image.jpg'}
                      alt={product.name}
                      width={120}
                      height={120}
                      className="object-cover rounded-lg mx-auto mb-4"
                    />
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-pink-500 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-2">{product.brand || product.vendor.businessName}</p>

                    <div className="flex items-center justify-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        {product.rating || 0} ({product.reviewCount || 0})
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </div>
                      {(product.originalPrice || product.compareAtPrice) && (
                        <div className="text-sm text-gray-500 line-through">
                          ₹{(product.originalPrice || product.compareAtPrice)?.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => addToCart(product)}
                        disabled={!(product.inStock ?? (product.stockQuantity > 0))}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {(product.inStock ?? (product.stockQuantity > 0)) ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => addToWishlist(product)}
                        size="sm"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Specifications Comparison */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Specifications</h3>
              </div>

              {allSpecs.map((specKey) => (
                <div key={specKey} className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-100 last:border-b-0">
                  <div className="px-6 py-4 bg-gray-50 font-medium text-gray-900">
                    {specKey}
                  </div>
                  {comparedProducts.map((product) => (
                    <div key={product.id} className="px-6 py-4 text-gray-700">
                      {product.specifications?.[specKey] || 'Not Available'}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Features Comparison */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="font-medium text-gray-900">Features</div>
                  {comparedProducts.map((product) => (
                    <div key={product.id} className="space-y-2">
                      {(product.features || []).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Ready to Make a Decision?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
              Add All to Cart
            </Button>
            <Button variant="outline">
              Add All to Wishlist
            </Button>
            <Link href="/products">
              <Button variant="outline">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">You Might Also Like</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Related Product {i}</span>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    Related Item {i}
                  </h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg font-bold text-gray-900">₹{Math.floor(Math.random() * 5000) + 1000}</span>
                    <span className="text-sm text-green-600">15% off</span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600" size="sm">
                    Compare
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}