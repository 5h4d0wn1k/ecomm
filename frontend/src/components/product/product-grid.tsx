import * as React from "react"
import { cn } from "@/lib/utils"
import { SkeletonProduct } from "@/components/ui/skeleton"

interface Product {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  rating?: number
  reviewCount?: number
  isNew?: boolean
  isWishlisted?: boolean
}

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  columns?: 2 | 3 | 4 | 5
  className?: string
  onProductClick?: (product: Product) => void
  onWishlistToggle?: (productId: string) => void
}

interface ProductCardProps {
  product: Product
  onClick?: () => void
  onWishlistToggle?: () => void
}

function ProductCard({ product, onClick, onWishlistToggle }: ProductCardProps) {
  const discountPercentage = product.discount || (
    product.originalPrice ?
    Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) :
    0
  )

  return (
    <div
      className="product-card myntra-card-interactive bg-white rounded-lg overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="product-image w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
              NEW
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onWishlistToggle?.()
          }}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
        >
          <svg
            className={cn(
              "w-4 h-4 transition-colors",
              product.isWishlisted ? "text-red-500 fill-current" : "text-gray-400"
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">
            {product.brand}
          </p>
          <h3 className="text-sm text-gray-900 line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < Math.floor(product.rating!) ? "text-yellow-400 fill-current" : "text-gray-300"
                  )}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-600">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function ProductGrid({
  products,
  loading = false,
  columns = 4,
  className,
  onProductClick,
  onWishlistToggle
}: ProductGridProps) {
  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
  }

  if (loading) {
    return (
      <div className={cn("myntra-grid", gridClasses[columns], className)}>
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonProduct key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("myntra-grid", gridClasses[columns], className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick?.(product)}
          onWishlistToggle={() => onWishlistToggle?.(product.id)}
        />
      ))}
    </div>
  )
}

// Specialized grid for different use cases
export function ProductGridSmall({ products, loading, onProductClick, onWishlistToggle }: Omit<ProductGridProps, 'columns'>) {
  return (
    <ProductGrid
      products={products}
      loading={loading}
      columns={2}
      onProductClick={onProductClick}
      onWishlistToggle={onWishlistToggle}
    />
  )
}

export function ProductGridMedium({ products, loading, onProductClick, onWishlistToggle }: Omit<ProductGridProps, 'columns'>) {
  return (
    <ProductGrid
      products={products}
      loading={loading}
      columns={3}
      onProductClick={onProductClick}
      onWishlistToggle={onWishlistToggle}
    />
  )
}

export function ProductGridLarge({ products, loading, onProductClick, onWishlistToggle }: Omit<ProductGridProps, 'columns'>) {
  return (
    <ProductGrid
      products={products}
      loading={loading}
      columns={5}
      onProductClick={onProductClick}
      onWishlistToggle={onWishlistToggle}
    />
  )
}