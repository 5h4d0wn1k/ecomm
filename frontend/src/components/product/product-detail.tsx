import Image from 'next/image'
import { useState } from 'react'
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw } from 'lucide-react'
import { Product, Review } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ProductDetailProps {
  product: Product & {
    averageRating: number
    totalReviews: number
    reviews: Review[]
  }
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(0)

  const images = product.images.length > 0 ? product.images : ['/placeholder-product.jpg']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-20 relative rounded-md overflow-hidden border-2 ${
                  selectedImage === index ? 'border-primary' : 'border-gray-200'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
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
                <span className="ml-2 text-sm text-gray-600">
                  {product.averageRating} ({product.totalReviews} reviews)
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-gray-900">
                ₹{product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ₹{product.compareAtPrice.toLocaleString()}
                </span>
              )}
              {product.compareAtPrice && (
                <Badge variant="secondary">
                  {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% off
                </Badge>
              )}
            </div>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, index) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(index)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      selectedVariant === index
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4">
            <Button className="flex-1" size="lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="w-5 h-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Free Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">1 Year Warranty</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">Easy Returns</span>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sold by</span>
              <span className="font-medium">{product.vendor.businessName}</span>
              {product.vendor.isVerified && (
                <Badge variant="secondary">Verified</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.totalReviews})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <p>{product.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <div className="space-y-4">
              {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-900">{key}</span>
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {product.reviews?.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">by {review.user.firstName}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}