import Image from 'next/image'
import Link from 'next/link'
import { GitCompare, Heart, ShoppingCart, Star } from 'lucide-react'
import { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { useCompareStore } from '@/lib/stores/compare-store'
import { useCartStore } from '@/lib/stores/cart-store'

interface ProductListProps {
  products: (Product & {
    averageRating: number
    totalReviews: number
    totalWishlisted: number
  })[]
  className?: string
}

export function ProductList({ products, className }: ProductListProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore()
  const { addItem, isInCart } = useCartStore()

  const handleWishlistToggle = async (productId: number, isWishlisted: boolean) => {
    if (isWishlisted) {
      await removeFromWishlist(productId)
    } else {
      const product = products.find(p => p.id === productId)
      if (product) await addToWishlist(product)
    }
  }

  const handleCompareToggle = (productId: number, isCompared: boolean) => {
    if (isCompared) {
      removeFromCompare(productId)
    } else {
      const product = products.find(p => p.id === productId)
      if (product) addToCompare(product)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem(product)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {products.map((product) => {
        const mainImage = product.images[0] || '/placeholder-product.jpg'
        const secondaryImage = product.images[1] || mainImage
        const isWishlisted = isInWishlist(product.id)
        const isCompared = isInCompare(product.id)
        const inCart = isInCart(product.id)
        const brandName = product.brand || product.vendor.businessName
        const discountPercentage = product.compareAtPrice
          ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
          : 0

        return (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="flex">
              <Link href={`/products/${product.id}`} className="flex-shrink-0 relative">
                <div className="relative w-48 h-48 overflow-hidden">
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="192px"
                  />
                  <Image
                    src={secondaryImage}
                    alt={product.name}
                    fill
                    className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0"
                    sizes="192px"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isFeatured && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                        FEATURED
                      </span>
                    )}
                    {discountPercentage > 0 && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
                        {discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  {/* Out of stock overlay */}
                  {product.stockQuantity <= 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium text-sm bg-red-500 px-3 py-1 rounded">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex-1 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Brand name */}
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      {brandName}
                    </div>

                    {/* Product title */}
                    <Link href={`/products/${product.id}`}>
                      <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.averageRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        ({product.totalReviews} reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <>
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.compareAtPrice.toLocaleString()}
                          </span>
                          <span className="text-sm text-green-600 font-medium">
                            ({discountPercentage}% off)
                          </span>
                        </>
                      )}
                    </div>

                    {/* Variants indicator */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-600">Available sizes:</span>
                        <div className="flex gap-1 flex-wrap">
                          {product.variants.slice(0, 5).map((variant) => (
                            <span
                              key={variant.id}
                              className="text-xs bg-gray-100 px-2 py-1 rounded border"
                            >
                              {variant.value}
                            </span>
                          ))}
                          {product.variants.length > 5 && (
                            <span className="text-xs text-gray-500">+{product.variants.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Vendor info */}
                    <div className="text-sm text-gray-600">
                      Sold by {product.vendor.businessName}
                      {product.vendor.isVerified && (
                        <span className="ml-1 text-blue-500">✓</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWishlistToggle(product.id, isWishlisted)}
                      className={isWishlisted ? 'border-red-500 text-red-500' : ''}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                      {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompareToggle(product.id, isCompared)}
                      className={isCompared ? 'border-blue-500 text-blue-500' : ''}
                    >
                      <GitCompare className="w-4 h-4 mr-2" />
                      {isCompared ? 'Comparing' : 'Compare'}
                    </Button>

                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stockQuantity <= 0}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {inCart ? 'Add More' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}