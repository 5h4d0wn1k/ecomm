'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  Check,
  X,
  GitCompare
} from 'lucide-react'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Product, Review } from '@/lib/types'
import { useCartStore } from '@/lib/stores/cart-store'
import { useWishlistStore } from '@/lib/stores/wishlist-store'

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
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  const addItem = useCartStore((state) => state.addItem)
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()

  const isWishlisted = product ? isInWishlist(product.id) : false

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get<{
          success: boolean
          data: ProductDetail
        }>(`/products/${productId}`)

        if (response.data.success) {
          setProduct(response.data.data)
          if (response.data.data.images.length > 0) {
            setSelectedImage(0)
          }
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchReviews = async () => {
      try {
        const response = await apiClient.get<{
          success: boolean
          data: Review[]
        }>(`/reviews?productId=${productId}`)
        if (response.data.success) {
          setReviews(response.data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
        setReviews([])
      }
    }

    const fetchRelatedProducts = async () => {
      try {
        const response = await apiClient.get<{
          success: boolean
          data: Product[]
        }>(`/products/${productId}/related`)
        if (response.data.success) {
          setRelatedProducts(response.data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch related products:', error)
        setRelatedProducts([])
      }
    }

    if (productId) {
      fetchProduct()
      fetchReviews()
      fetchRelatedProducts()
    }
  }, [productId])

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
            <p className="text-gray-600 mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-pink-500">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-pink-500">Products</Link>
          <span className="mx-2">/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-pink-500">
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImage] || '/placeholder-product.jpg'}
                alt={product.name}
                fill
                className="object-cover cursor-zoom-in"
                onClick={() => {}}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <button
                onClick={async () => {
                  if (product) {
                    if (isWishlisted) {
                      await removeFromWishlist(product.id)
                    } else {
                      await addToWishlist(product)
                    }
                  }
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
              </button>
              <button className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <Link href={`/compare?products=${productId}`}>
                <button className="absolute bottom-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors">
                  <GitCompare className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-pink-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Sold by: <span className="font-medium text-gray-900">{product.vendor.businessName}</span></span>
                {product.vendor.isVerified && (
                  <span className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-1" />
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600 font-medium">
                  {product.averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{product.totalReviews} reviews</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{product.totalSold} sold</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.compareAtPrice.toLocaleString()}
                    </span>
                    <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                      {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">Inclusive of all taxes</p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {['Black', 'White', 'Red', 'Blue', 'Green'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                      selectedColor === color
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-900">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3"
                  disabled={product.stockQuantity === 0}
                >
                  {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button variant="outline" className="px-6 border-pink-500 text-pink-500 hover:bg-pink-50">
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Free Delivery</p>
                  <p className="text-sm text-gray-600">Get free delivery on orders above ₹499</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-600">30 days easy return policy</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-600">100% secure payment methods</p>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.stockQuantity > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">In Stock</span>
                  <span className="text-gray-600">({product.stockQuantity} available)</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-600" />
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button className="border-b-2 border-pink-500 py-4 px-1 text-sm font-medium text-pink-600">
                Description
              </button>
              <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Specifications
              </button>
              <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Reviews ({product.totalReviews})
              </button>
            </nav>
          </div>

          <div className="py-8">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {product.description || product.shortDescription}
              </p>

              {/* Key Features */}
              <h4 className="text-md font-semibold text-gray-900 mb-3">Key Features:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                <li>Premium quality materials</li>
                <li>Comfortable and stylish design</li>
                <li>Durable construction</li>
                <li>Easy care instructions</li>
                <li>Available in multiple sizes</li>
              </ul>

              {/* Specifications */}
              <h4 className="text-md font-semibold text-gray-900 mb-3">Specifications:</h4>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                  {product.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{product.weight} kg</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{product.category.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand:</span>
                    <span className="font-medium">{product.vendor.businessName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50">
              Write a Review
            </Button>
          </div>

          {/* Rating Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {product.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">{product.totalReviews} reviews</p>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${Math.random() * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{Math.floor(Math.random() * 50)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Individual Reviews */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-medium">
                        {review.user.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.user.firstName} {review.user.lastName}
                        </p>
                        {review.isVerified && (
                          <span className="text-green-600 text-sm flex items-center">
                            <Check className="w-4 h-4 mr-1" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                  )}

                  {review.comment && (
                    <p className="text-gray-700 mb-4">{review.comment}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date().toLocaleDateString()}</span>
                    <div className="flex space-x-4">
                      <button className="hover:text-pink-500">Helpful</button>
                      <button className="hover:text-pink-500">Report</button>
                    </div>
                  </div>
                </div>
              ))}

              {reviews.length > 5 && (
                <div className="text-center">
                  <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50">
                    View All {product.totalReviews} Reviews
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600 mb-4">Be the first to review this product</p>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                Write a Review
              </Button>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">You Might Also Like</h2>
              <Link href="/products">
                <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50">
                  View All Products
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <div key={relatedProduct.id} className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <Link href={`/products/${relatedProduct.id}`}>
                    <div className="relative">
                      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                        <Image
                          src={relatedProduct.images[0] || '/placeholder-product.jpg'}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </div>
                      <div className="absolute top-3 right-3">
                        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <Heart className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      {relatedProduct.compareAtPrice && (
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {Math.round(((relatedProduct.compareAtPrice - relatedProduct.price) / relatedProduct.compareAtPrice) * 100)}% off
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/products/${relatedProduct.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-500 transition-colors">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{relatedProduct.price.toLocaleString()}
                      </span>
                      {relatedProduct.compareAtPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{relatedProduct.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor((relatedProduct as Product & { averageRating?: number }).averageRating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        ({(relatedProduct as Product & { totalReviews?: number }).totalReviews || 0})
                      </span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Quick Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Recently Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">Recent {i}</span>
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    Recent Product {i}
                  </h4>
                  <p className="text-sm font-bold text-gray-900">
                    ₹{Math.floor(Math.random() * 2000) + 500}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}