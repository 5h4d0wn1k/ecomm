'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/layout'
import { ProductCard } from '@/components/product/product-card'
import { ProductSkeleton } from '@/components/product/product-skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api/client'
import { Product, PaginatedResponse } from '@/lib/types'
import { Search, X, Filter, TrendingUp, Clock, ArrowRight, Grid3X3, List, SlidersHorizontal } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { useProductStore } from '@/lib/stores/product-store'
import Link from 'next/link'

type ProductWithMeta = Product & {
  averageRating: number
  totalReviews: number
  totalWishlisted: number
}

interface SearchSuggestion {
  type: 'product' | 'category' | 'brand'
  text: string
  count?: number
  url: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { viewMode, setViewMode } = useProductStore()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<ProductWithMeta[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingSearches, setTrendingSearches] = useState<string[]>([])
  const [searchStats, setSearchStats] = useState({
    totalResults: 0,
    searchTime: 0,
    filters: 0
  })

  const debouncedQuery = useDebounce(query, 300)

  // Popular search terms (could come from API)
  const popularSearches = useMemo(() => [
    'wireless earbuds', 'smart watches', 'sneakers', 'laptops', 'dresses',
    'smartphones', 'headphones', 'backpacks', 'sunglasses', 'watches'
  ], [])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }, [])

  // Perform search when query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery)
      getSearchSuggestions(debouncedQuery)
    } else {
      setResults([])
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [debouncedQuery])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      const startTime = Date.now()

      const params = new URLSearchParams()
      params.append('search', searchQuery)
      params.append('limit', '50') // Show more results on search page

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

      const endTime = Date.now()

      if (response.data.success) {
        setResults(response.data.data || [])
        setSearchStats({
          totalResults: response.data.pagination.total,
          searchTime: endTime - startTime,
          filters: 0
        })
      }
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
      setSearchStats(prev => ({ ...prev, totalResults: 0 }))
    } finally {
      setLoading(false)
    }
  }

  const getSearchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    try {
      // Get categories and brands that match the search
      const [categoriesRes, productsRes] = await Promise.all([
        apiClient.get('/categories'),
        apiClient.get(`/products?search=${encodeURIComponent(searchQuery)}&limit=5`)
      ])

      const suggestions: SearchSuggestion[] = []

      // Add category suggestions
      if (categoriesRes.data.success) {
        const matchingCategories = categoriesRes.data.data
          .filter((cat: any) => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 3)

        matchingCategories.forEach((cat: any) => {
          suggestions.push({
            type: 'category',
            text: cat.name,
            url: `/products?category=${cat.id}`,
            count: cat.productCount || 0
          })
        })
      }

      // Add product suggestions
      if (productsRes.data.success && productsRes.data.data.length > 0) {
        const productSuggestions = productsRes.data.data.slice(0, 5)
        productSuggestions.forEach((product: ProductWithMeta) => {
          suggestions.push({
            type: 'product',
            text: product.name,
            url: `/products/${product.id}`,
            count: undefined
          })
        })
      }

      setSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    } catch (error) {
      console.error('Failed to get suggestions:', error)
      setSuggestions([])
    }
  }

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const updatedRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10)
      setRecentSearches(updatedRecent)
      localStorage.setItem('recentSearches', JSON.stringify(updatedRecent))

      // Update URL
      const params = new URLSearchParams()
      params.set('q', searchQuery)
      router.push(`/search?${params.toString()}`)

      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product' || suggestion.type === 'category') {
      router.push(suggestion.url)
    } else {
      handleSearch(suggestion.text)
    }
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setShowSuggestions(false)
    router.push('/search')
  }

  const removeRecentSearch = (searchToRemove: string) => {
    const updated = recentSearches.filter(s => s !== searchToRemove)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Search Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search for products, brands, or categories..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setShowSuggestions(true)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                    className="pl-10 pr-10 py-3 text-lg border-2 focus:border-pink-500 rounded-lg"
                    autoComplete="off"
                  />
                  {query && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-96 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-3">
                          <Search className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 group-hover:text-pink-600">{suggestion.text}</span>
                          {suggestion.type === 'category' && (
                            <Badge variant="secondary" className="text-xs">Category</Badge>
                          )}
                          {suggestion.type === 'product' && (
                            <Badge variant="outline" className="text-xs">Product</Badge>
                          )}
                        </div>
                        {suggestion.count && (
                          <span className="text-sm text-gray-500">{suggestion.count} items</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <Button
                onClick={() => handleSearch(query)}
                disabled={!query.trim() || loading}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3"
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Search Stats */}
            {query && searchStats.totalResults > 0 && (
              <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>{searchStats.totalResults.toLocaleString()} results</span>
                  <span>for "{query}"</span>
                  <span>({searchStats.searchTime}ms)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>{searchStats.filters} filters applied</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* No Search Query State */}
          {!query && (
            <div className="max-w-4xl mx-auto">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Recent Searches</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600 transition-colors group"
                      >
                        <Search className="h-3 w-3 mr-2" />
                        {search}
                        <X
                          className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeRecentSearch(search)
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Popular Searches</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="p-3 bg-white border border-gray-200 rounded-lg text-center hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600 transition-colors group"
                    >
                      <Search className="h-4 w-4 mx-auto mb-2 text-gray-400 group-hover:text-pink-500" />
                      <span className="text-sm font-medium">{search}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse Categories */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Or browse by category</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Beauty'].map((category) => (
                    <Link
                      key={category}
                      href={`/products?category=${category.toLowerCase().replace(' & ', '-')}`}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600 transition-colors"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {query && (
            <div className="max-w-7xl mx-auto">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Search Results
                  </h2>
                  {searchStats.totalResults > 0 && (
                    <Badge variant="secondary" className="text-sm">
                      {searchStats.totalResults.toLocaleString()} results
                    </Badge>
                  )}
                </div>

                {/* View Toggle */}
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
              </div>

              {/* Loading State */}
              {loading && (
                <ProductSkeleton count={20} />
              )}

              {/* Results Grid */}
              {!loading && results.length > 0 && (
                <div className={`grid gap-4 ${
                  viewMode === 'grid'
                    ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                    : 'grid-cols-1'
                }`}>
                  {results.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* No Results */}
              {!loading && query && results.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any products matching "{query}"
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => setQuery('')}
                      variant="outline"
                      className="border-pink-500 text-pink-500 hover:bg-pink-50"
                    >
                      Clear search
                    </Button>
                    <Link href="/products">
                      <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                        Browse all products
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Suggestions */}
                  <div className="mt-8 text-left max-w-md mx-auto">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Try these instead:</h4>
                    <div className="space-y-2">
                      {popularSearches.slice(0, 5).map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSearch(suggestion)}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}