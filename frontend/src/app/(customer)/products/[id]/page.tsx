'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api/client'
import { Product, Review } from '@/lib/types'
import { useCartStore } from '@/lib/stores/cart-store'

type ProductDetail = Product & {
  averageRating: number
  totalReviews: number
  totalSold: number
  totalWishlisted: number
  relatedProducts: Product[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchReviews()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<ProductDetail>(`/products/${productId}`)
      setProduct(response.data.data)
      if (response.data.data.images.length > 0) {
        setSelectedImage(0)
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await apiClient.get<Review[]>(`/reviews?productId=${productId}`)
      setReviews(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    }
  }

  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity)
      alert('Product added to cart!')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
            <Link href="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square relative mb-4">
              <Image
                src={product.images[selectedImage] || '/placeholder-product.jpg'}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square relative rounded border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover rounded"
                      sizes="(max-width: 1024px) 25vw, 12.5vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
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
                <span className="ml-2 text-gray-600">
                  {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
                </span>
              </div>
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-4">
              ₹{product.price.toLocaleString()}
              {product.compareAtPrice && (
                <span className="text-lg text-gray-500 line-through ml-2">
                  ₹{product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="text-gray-600 mb-6">
              {product.shortDescription || product.description}
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Sold by: {product.vendor.businessName}
                {product.vendor.isVerified && (
                  <span className="ml-1 text-blue-500">✓ Verified</span>
                )}
              </p>
              <p className="text-sm text-gray-600">
                Category: {product.category.name}
              </p>
              {product.stockQuantity > 0 ? (
                <p className="text-sm text-green-600">
                  In Stock ({product.stockQuantity} available)
                </p>
              ) : (
                <p className="text-sm text-red-600">Out of Stock</p>
              )}
            </div>

            {/* Add to Cart */}
            {product.stockQuantity > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  <label className="mr-2 text-sm font-medium">Quantity:</label>
                  <Input
                    type="number"
                    min="1"
                    max={product.stockQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                </div>
                <Button onClick={handleAddToCart} className="flex-1">
                  Add to Cart
                </Button>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Specifications */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Specifications</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>SKU:</strong> {product.sku}
              </div>
              {product.weight && (
                <div>
                  <strong>Weight:</strong> {product.weight} kg
                </div>
              )}
              {product.dimensions && (
                <div>
                  <strong>Dimensions:</strong> {JSON.stringify(product.dimensions)}
                </div>
              )}
              <div>
                <strong>Requires Shipping:</strong> {product.requiresShipping ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Status:</strong> {product.status}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 font-medium">
                      {review.user.firstName} {review.user.lastName}
                    </span>
                    {review.isVerified && (
                      <span className="ml-2 text-green-600 text-sm">Verified Purchase</span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-medium mb-1">{review.title}</h4>
                  )}
                  {review.comment && (
                    <p className="text-gray-600">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No reviews yet.</p>
          )}
        </div>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="border border-gray-200 rounded-lg p-4">
                  <Link href={`/products/${relatedProduct.id}`}>
                    <div className="aspect-square relative mb-4">
                      <Image
                        src={relatedProduct.images[0] || '/placeholder-product.jpg'}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover rounded"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{relatedProduct.price.toLocaleString()}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}