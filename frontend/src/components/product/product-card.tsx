import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product & {
    averageRating: number
    totalReviews: number
    totalWishlisted: number
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0] || '/placeholder-product.jpg'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.isFeatured && (
            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.averageRating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-gray-600 ml-1">
              ({product.totalReviews})
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="mt-2 text-sm text-gray-600">
          by {product.vendor.businessName}
          {product.vendor.isVerified && (
            <span className="ml-1 text-blue-500">✓</span>
          )}
        </div>

        {product.stockQuantity <= 0 && (
          <div className="mt-2 text-sm text-red-600 font-medium">
            Out of Stock
          </div>
        )}
      </div>
    </div>
  )
}