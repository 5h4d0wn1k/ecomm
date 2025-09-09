'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout/layout'
import { ProductCard } from '@/components/product/product-card'
import { ProductList } from '@/components/product/product-list'
import { AdvancedFilters } from '@/components/product/advanced-filters'
import { SearchWithSuggestions } from '@/components/product/search-with-suggestions'
import { ProductSkeleton } from '@/components/product/product-skeleton'
import { InfiniteScroll } from '@/components/ui/infinite-scroll'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api/client'
import { Product, PaginatedResponse, ProductFilters, Category, Vendor } from '@/lib/types'
import { useProductStore } from '@/lib/stores/product-store'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { Grid3X3, List, Filter, X, MoreVertical } from 'lucide-react'

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

  // Use product store for view mode
  const { viewMode, setViewMode } = useProductStore()

  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined,
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    sort: (searchParams.get('sort') as ProductFilters['sort']) || 'created_desc',
    inStock: searchParams.get('inStock') === 'true' ? true : undefined,
  })

  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedBrands, setSelectedBrands] = useState<number[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category.toString())
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
      if (filters.inStock) params.append('inStock', filters.inStock.toString())
      if (filters.rating) params.append('minRating', filters.rating.toString())
      if (filters.sort) params.append('sort', filters.sort)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await apiClient.get<{
        success: boolean
        data: ProductWithMeta[]
        pagination: {
          page: number
          limit: number
          total: number
          pages: number
        }
      }>(`/products?${params.toString()}`)

      if (response.data.success) {
        setProducts(response.data.data || [])
        setPagination({
          ...response.data.pagination,
          hasNext: response.data.pagination.page < response.data.pagination.pages,
          hasPrev: response.data.pagination.page > 1,
        })
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      // Set empty array on error
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  useEffect(() => {
    fetchCategories()
    fetchVendors()
    fetchProducts()
  }, [filters, pagination.page, pagination.limit, fetchProducts])

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: Category[]
      }>('/categories')
      if (response.data.success) {
        setCategories(response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setCategories([])
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: Vendor[]
      }>('/vendors')
      if (response.data.success) {
        setVendors(response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error)
      setVendors([])
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

  const handlePriceFilter = (value: number[]) => {
    setPriceRange(value)
    setFilters(prev => ({
      ...prev,
      minPrice: value[0] > 0 ? value[0] : undefined,
      maxPrice: value[1] < 50000 ? value[1] : undefined
    }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleInStockChange = (inStock: boolean) => {
    setFilters(prev => ({ ...prev, inStock: inStock || undefined }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleVendorChange = (vendorId: string) => {
    const vendor = vendorId ? parseInt(vendorId) : undefined
    setFilters(prev => ({ ...prev, vendor }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleCategoryToggle = (categoryId: number, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter(id => id !== categoryId)
    setSelectedCategories(newCategories)
    // Note: This would need backend support for multiple categories
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleBrandToggle = (brandId: number, checked: boolean) => {
    const newBrands = checked
      ? [...selectedBrands, brandId]
      : selectedBrands.filter(id => id !== brandId)
    setSelectedBrands(newBrands)
    // Note: This would need backend support for multiple brands
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSizeToggle = (size: string, checked: boolean) => {
    const newSizes = checked
      ? [...selectedSizes, size]
      : selectedSizes.filter(s => s !== size)
    setSelectedSizes(newSizes)
    // Note: This would need backend support for size filtering
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleColorToggle = (color: string, checked: boolean) => {
    const newColors = checked
      ? [...selectedColors, color]
      : selectedColors.filter(c => c !== color)
    setSelectedColors(newColors)
    // Note: This would need backend support for color filtering
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleDiscountToggle = (checked: boolean) => {
    setShowDiscountOnly(checked)
    // Note: This would need backend support for discount filtering
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      sort: 'created_desc',
    })
    setSearchInput('')
    setPriceRange([0, 50000])
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedSizes([])
    setSelectedColors([])
    setShowDiscountOnly(false)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleLoadMore = async () => {
    if (!pagination.hasNext || loading) return

    try {
      setLoading(true)
      const nextPage = pagination.page + 1
      const params = new URLSearchParams()

      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category.toString())
      if (filters.vendor) params.append('vendor', filters.vendor.toString())
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
      if (filters.sort) params.append('sort', filters.sort)
      if (filters.inStock) params.append('inStock', filters.inStock.toString())
      if (filters.rating) params.append('minRating', filters.rating.toString())
      params.append('page', nextPage.toString())
      params.append('limit', pagination.limit.toString())

      const response = await apiClient.get<{
        success: boolean
        data: ProductWithMeta[]
        pagination: {
          page: number
          limit: number
          total: number
          pages: number
        }
      }>(`/products?${params.toString()}`)

      if (response.data.success) {
        setProducts(prev => [...prev, ...response.data.data])
        setPagination({
          ...response.data.pagination,
          hasNext: response.data.pagination.page < response.data.pagination.pages,
          hasPrev: response.data.pagination.page > 1,
        })
      }
    } catch (error) {
      console.error('Failed to load more products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>

            {/* View Toggle & Options */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">View:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3 py-1"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3 py-1"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Load:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={!useInfiniteScroll ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setUseInfiniteScroll(false)}
                    className="px-3 py-1 text-xs"
                  >
                    Pages
                  </Button>
                  <Button
                    variant={useInfiniteScroll ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setUseInfiniteScroll(true)}
                    className="px-3 py-1 text-xs"
                  >
                    Infinite
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="flex-1">
                <SearchWithSuggestions
                  value={searchInput}
                  onChange={setSearchInput}
                  onSearch={(query) => {
                    setFilters(prev => ({ ...prev, search: query }))
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  placeholder="Search products..."
                  className="w-full"
                />
              </div>

              {/* Sort */}
              <div className="w-full lg:w-48">
                <Select value={filters.sort || 'created_desc'} onValueChange={(value) => handleSortChange(value as ProductFilters['sort'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_desc">Newest First</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="name_asc">Name: A to Z</SelectItem>
                    <SelectItem value="name_desc">Name: Z to A</SelectItem>
                    <SelectItem value="rating_desc">Highest Rated</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="discount_desc">Biggest Discount</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Filter Button */}
              <div className="lg:hidden">
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                      {(selectedCategories.length + selectedBrands.length + selectedSizes.length + selectedColors.length + (showDiscountOnly ? 1 : 0)) > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {selectedCategories.length + selectedBrands.length + selectedSizes.length + selectedColors.length + (showDiscountOnly ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <AdvancedFilters
                        categories={categories}
                        vendors={vendors}
                        selectedCategories={selectedCategories}
                        selectedBrands={selectedBrands}
                        selectedSizes={selectedSizes}
                        selectedColors={selectedColors}
                        showDiscountOnly={showDiscountOnly}
                        priceRange={priceRange}
                        filters={filters}
                        onCategoryToggle={handleCategoryToggle}
                        onBrandToggle={handleBrandToggle}
                        onSizeToggle={handleSizeToggle}
                        onColorToggle={handleColorToggle}
                        onDiscountToggle={handleDiscountToggle}
                        onPriceChange={handlePriceFilter}
                        onRatingChange={(rating) => {
                          setFilters(prev => ({ ...prev, rating }))
                          setPagination(prev => ({ ...prev, page: 1 }))
                        }}
                        onInStockChange={handleInStockChange}
                        onClearFilters={clearFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:block">
              <AdvancedFilters
                categories={categories}
                vendors={vendors}
                selectedCategories={selectedCategories}
                selectedBrands={selectedBrands}
                selectedSizes={selectedSizes}
                selectedColors={selectedColors}
                showDiscountOnly={showDiscountOnly}
                priceRange={priceRange}
                filters={filters}
                onCategoryToggle={handleCategoryToggle}
                onBrandToggle={handleBrandToggle}
                onSizeToggle={handleSizeToggle}
                onColorToggle={handleColorToggle}
                onDiscountToggle={handleDiscountToggle}
                onPriceChange={handlePriceFilter}
                onRatingChange={(rating) => {
                  setFilters(prev => ({ ...prev, rating }))
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                onInStockChange={handleInStockChange}
                onClearFilters={clearFilters}
              />
            </div>

            {/* Active Filters Display */}
            {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || showDiscountOnly) && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">Active filters:</span>
                {selectedCategories.map(catId => {
                  const category = categories.find(c => c.id === catId)
                  return category ? (
                    <Badge key={catId} variant="secondary" className="flex items-center gap-1">
                      {category.name}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleCategoryToggle(catId, false)}
                      />
                    </Badge>
                  ) : null
                })}
                {selectedBrands.map(brandId => {
                  const brand = vendors.find(v => v.id === brandId)
                  return brand ? (
                    <Badge key={brandId} variant="secondary" className="flex items-center gap-1">
                      {brand.businessName}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleBrandToggle(brandId, false)}
                      />
                    </Badge>
                  ) : null
                })}
                {selectedSizes.map(size => (
                  <Badge key={size} variant="secondary" className="flex items-center gap-1">
                    Size: {size}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => handleSizeToggle(size, false)}
                    />
                  </Badge>
                ))}
                {selectedColors.map(color => (
                  <Badge key={color} variant="secondary" className="flex items-center gap-1">
                    Color: {color}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => handleColorToggle(color, false)}
                    />
                  </Badge>
                ))}
                {showDiscountOnly && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    On Sale
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => handleDiscountToggle(false)}
                    />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && products.length === 0 && (
          <ProductSkeleton count={20} />
        )}

        {/* Products Display */}
        {!loading && products.length > 0 && (
          <>
            {useInfiniteScroll ? (
              <InfiniteScroll
                hasNextPage={pagination.hasNext}
                isLoading={loading}
                onLoadMore={handleLoadMore}
                className="mb-8"
              >
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <ProductList products={products} />
                )}
              </InfiniteScroll>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="mb-8">
                    <ProductList products={products} />
                  </div>
                )}

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