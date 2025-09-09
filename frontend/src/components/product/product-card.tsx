import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { GitCompare, Heart, ShoppingCart, Star, Eye, ZoomIn } from 'lucide-react'
import { Product } from '@/lib/types'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { useCompareStore } from '@/lib/stores/compare-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { LazyProductImage } from '@/components/ui/lazy-image'

interface ProductCardProps {
  product: Product & {
    averageRating: number
    totalReviews: number
    totalWishlisted: number
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const mainImage = product.images[0] || '/placeholder-product.jpg'
  const secondaryImage = product.images[1] || mainImage
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const isWishlisted = isInWishlist(product.id)
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore()
  const isCompared = isInCompare(product.id)
  const { addItem, isInCart } = useCartStore()
  const inCart = isInCart(product.id)

  const brandName = product.brand || product.vendor.businessName
  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isWishlisted) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist(product)
    }
  }

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isCompared) {
      removeFromCompare(product.id)
    } else {
      addToCompare(product)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsQuickViewOpen(true)
  }

  const handleImageZoom = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsImageZoomed(!isImageZoomed)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <LazyProductImage
            src={mainImage}
            alt={product.name}
            className={`transition-transform duration-300 group-hover:scale-105 ${
              isImageZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={handleImageZoom}
          />
          {/* Secondary image on hover */}
          <LazyProductImage
            src={secondaryImage}
            alt={product.name}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0"
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

          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleWishlistToggle}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px]"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={handleQuickView}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Quick view"
            >
              <Eye className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleCompareToggle}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px] ${
                isCompared ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
              }`}
              aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
            >
              <GitCompare className="w-5 h-5" />
            </button>
          </div>

          {/* Quick add to cart button */}
           <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <Button
               onClick={handleAddToCart}
               className="w-full bg-black hover:bg-gray-800 text-white text-sm py-3 min-h-[44px]"
               disabled={product.stockQuantity <= 0}
             >
               <ShoppingCart className="w-5 h-5 mr-2" />
               {inCart ? 'Add More' : 'Add to Cart'}
             </Button>
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

      <div className="p-4">
        {/* Brand name */}
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {brandName}
        </div>

        {/* Product title */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors text-sm leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({product.totalReviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-gray-900">
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
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-gray-500">Size:</span>
            <div className="flex gap-1">
              {product.variants.slice(0, 3).map((variant) => (
                <span
                  key={variant.id}
                  className="text-xs bg-gray-100 px-2 py-1 rounded border"
                >
                  {variant.value}
                </span>
              ))}
              {product.variants.length > 3 && (
                <span className="text-xs text-gray-500">+{product.variants.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Vendor info */}
        <div className="text-xs text-gray-500">
          Sold by {product.vendor.businessName}
          {product.vendor.isVerified && (
            <span className="ml-1 text-blue-500">✓</span>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <Modal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        title={product.name}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded border-2 border-gray-200">
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
              <div className="flex items-center mb-4">
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
                <span className="text-sm text-gray-500 ml-2">
                  ({product.totalReviews} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">
                ₹{product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{product.compareAtPrice.toLocaleString()}
                  </span>
                  <span className="text-lg text-green-600 font-medium">
                    ({discountPercentage}% off)
                  </span>
                </>
              )}
            </div>

            <div className="text-sm text-gray-600">
              {product.shortDescription || product.description}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Size/Color Options:</h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.slice(0, 6).map((variant) => (
                    <span
                      key={variant.id}
                      className="px-3 py-1 bg-gray-100 rounded text-sm"
                    >
                      {variant.value}
                    </span>
                  ))}
                  {product.variants.length > 6 && (
                    <span className="text-sm text-gray-500">+{product.variants.length - 6} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${
                product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span className="text-sm">
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  addItem(product)
                  setIsQuickViewOpen(false)
                }}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                disabled={product.stockQuantity <= 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={handleWishlistToggle}
                className="px-4"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'text-red-500 fill-current' : ''}`} />
              </Button>
            </div>

            <div className="text-xs text-gray-500 pt-2">
              Sold by {product.vendor.businessName}
              {product.vendor.isVerified && (
                <span className="ml-1 text-blue-500">✓ Verified</span>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}