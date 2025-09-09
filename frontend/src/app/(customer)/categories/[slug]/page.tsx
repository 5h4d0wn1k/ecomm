'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Layout } from '@/components/layout/layout'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { Product, PaginatedResponse, Category, ApiResponse } from '@/lib/types'
import { ChevronRight, Home } from 'lucide-react'

type ProductWithMeta = Product & {
  averageRating: number
  totalReviews: number
  totalWishlisted: number
}

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params.slug as string

  const [category, setCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [products, setProducts] = useState<ProductWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  })

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true)

        // Fetch category details
        const categoryResponse = await apiClient.get<ApiResponse<Category>>(`/categories/slug/${categorySlug}`)
        const categoryData = categoryResponse.data.data ?? null
        setCategory(categoryData)

        if (!categoryData) return

        // Fetch subcategories
        const subcategoriesResponse = await apiClient.get<ApiResponse<Category[]>>(`/categories?parentId=${categoryData.id}`)
        setSubcategories(subcategoriesResponse.data.data || [])

        // Fetch products in this category
        const productsResponse = await apiClient.get<PaginatedResponse<ProductWithMeta>>(
          `/products?category=${categoryData.id}&page=1&limit=20`
        )
        setProducts(productsResponse.data.data || [])
        setPagination(productsResponse.data.pagination)
      } catch (error) {
        console.error('Failed to fetch category data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (categorySlug) {
      fetchCategoryData()
    }
  }, [categorySlug])

  const handlePageChange = (page: number) => {
    // Implement pagination
    console.log('Page change:', page)
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-4">The category you&apos;re looking for doesn&apos;t exist.</p>
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
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="flex items-center hover:text-pink-500">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-pink-500">
            Products
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
        </div>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Subcategories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/categories/${subcategory.slug}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium text-gray-900 mb-1">{subcategory.name}</h3>
                  {subcategory.description && (
                    <p className="text-sm text-gray-600">{subcategory.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Products in {category.name}
            </h2>
            <Link href={`/products?category=${category.id}`}>
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Previous
                  </Button>

                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </span>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">There are no products in this category yet.</p>
              <Link href="/products">
                <Button>Browse All Products</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}