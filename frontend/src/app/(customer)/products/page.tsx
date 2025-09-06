'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout/layout'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api/client'
import { Product, PaginatedResponse, ProductFilters, Category } from '@/lib/types'

type ProductWithMeta = Product & {
  averageRating: number
  totalReviews: number
  totalWishlisted: number
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<ProductWithMeta[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  })

  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined,
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    sort: (searchParams.get('sort') as ProductFilters['sort']) || 'created_desc',
    inStock: searchParams.get('inStock') === 'true' ? true : undefined,
  })

  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice?.toString() || '',
    max: filters.maxPrice?.toString() || '',
  })

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [filters])

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get<Category[]>('/categories')
      setCategories(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category.toString())
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
      if (filters.inStock) params.append('inStock', filters.inStock.toString())
      if (filters.sort) params.append('sort', filters.sort)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await apiClient.get<PaginatedResponse<ProductWithMeta>>(
        `/products?${params.toString()}`
      )

      setProducts(response.data.data)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSortChange = (sort: ProductFilters['sort']) => {
    setFilters(prev => ({ ...prev, sort }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleCategoryChange = (categoryId: string) => {
    const category = categoryId ? parseInt(categoryId) : undefined
    setFilters(prev => ({ ...prev, category }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePriceFilter = () => {
    const minPrice = priceRange.min ? parseFloat(priceRange.min) : undefined
    const maxPrice = priceRange.max ? parseFloat(priceRange.max) : undefined
    setFilters(prev => ({ ...prev, minPrice, maxPrice }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleInStockChange = (inStock: boolean) => {
    setFilters(prev => ({ ...prev, inStock: inStock || undefined }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      sort: 'created_desc',
    })
    setSearchInput('')
    setPriceRange({ min: '', max: '' })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>

          {/* Search and Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div>
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Category */}
              <div>
                <select
                  value={filters.category?.toString() || ''}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handlePriceFilter()}
                />
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handlePriceFilter()}
                />
              </div>

              {/* Sort */}
              <div>
                <select
                  value={filters.sort || 'created_desc'}
                  onChange={(e) => handleSortChange(e.target.value as ProductFilters['sort'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_desc">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                  <option value="rating_desc">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.inStock || false}
                  onChange={(e) => handleInStockChange(e.target.checked)}
                  className="mr-2"
                />
                In Stock Only
              </label>

              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
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
          </>
        )}

        {/* No Products */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}