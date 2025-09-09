import { create } from 'zustand'
import { Product, ProductFilters, Category, PaginatedResponse } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

interface ProductState {
  // State
  products: Product[]
  categories: Category[]
  filters: ProductFilters
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  loading: boolean
  error: string | null
  searchSuggestions: string[]
  viewMode: 'grid' | 'list'

  // Actions
  setProducts: (products: Product[]) => void
  setCategories: (categories: Category[]) => void
  setFilters: (filters: Partial<ProductFilters>) => void
  setPagination: (pagination: ProductState['pagination']) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchSuggestions: (suggestions: string[]) => void
  setViewMode: (mode: 'grid' | 'list') => void

  // API Actions
  fetchProducts: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchSearchSuggestions: (query: string) => Promise<void>
  fetchProductById: (id: number) => Promise<Product | null>
  fetchRelatedProducts: (productId: number) => Promise<Product[]>

  // Utility Actions
  clearFilters: () => void
  resetState: () => void
}

const initialFilters: ProductFilters = {
  sort: 'created_desc',
}

const initialPagination = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 0,
  hasNext: false,
  hasPrev: false,
}

export const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
  products: [],
  categories: [],
  filters: initialFilters,
  pagination: initialPagination,
  loading: false,
  error: null,
  searchSuggestions: [],
  viewMode: 'grid',

  // Basic setters
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  setPagination: (pagination) => set({ pagination }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearchSuggestions: (searchSuggestions) => set({ searchSuggestions }),
  setViewMode: (viewMode) => set({ viewMode }),

  // API Actions
  fetchProducts: async () => {
    try {
      set({ loading: true, error: null })
      const { filters, pagination } = get()

      const params = new URLSearchParams()

      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category.toString())
      if (filters.vendor) params.append('vendor', filters.vendor.toString())
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
      if (filters.sort) params.append('sort', filters.sort)
      if (filters.inStock) params.append('inStock', filters.inStock.toString())

      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await apiClient.get<PaginatedResponse<Product>>(
        `/products?${params.toString()}`
      )

      set({
        products: response.data.data || [],
        pagination: response.data.pagination,
        loading: false
      })
    } catch (_error: unknown) {
      const errorMessage = _error instanceof Error && 'response' in _error
        ? (_error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch products'
        : 'Failed to fetch products'
      set({
        error: errorMessage,
        loading: false
      })
    }
  },

  fetchCategories: async () => {
    try {
      const response = await apiClient.get<Category[]>('/categories')
      set({ categories: response.data.data || [] })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch categories'
        : 'Failed to fetch categories'
      set({ error: errorMessage })
    }
  },

  fetchSearchSuggestions: async (query: string) => {
    if (!query || query.length < 2) {
      set({ searchSuggestions: [] })
      return
    }

    try {
      const response = await apiClient.get<string[]>(`/products/search/suggestions?q=${encodeURIComponent(query)}`)
      set({ searchSuggestions: response.data.data || [] })
    } catch {
      // Silently fail for suggestions
      set({ searchSuggestions: [] })
    }
  },

  fetchProductById: async (id: number) => {
    try {
      set({ loading: true, error: null })
      const response = await apiClient.get<Product>(`/products/${id}`)
      set({ loading: false })
      return response.data.data
    } catch (_error: unknown) {
      const errorMessage = _error instanceof Error && 'response' in _error
        ? (_error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch product'
        : 'Failed to fetch product'
      set({
        error: errorMessage,
        loading: false
      })
      return null
    }
  },

  fetchRelatedProducts: async (productId: number) => {
    try {
      const response = await apiClient.get<Product[]>(`/products/${productId}/related`)
      return response.data.data || []
    } catch {
      return []
    }
  },

  // Utility Actions
  clearFilters: () => {
    set({
      filters: initialFilters,
      pagination: { ...initialPagination, page: 1 }
    })
  },

  resetState: () => {
    set({
      products: [],
      filters: initialFilters,
      pagination: initialPagination,
      loading: false,
      error: null,
      searchSuggestions: [],
      viewMode: 'grid'
    })
  }
}))

// Helper hooks
export const useProducts = () => useProductStore((state) => state.products)
export const useProductCategories = () => useProductStore((state) => state.categories)
export const useProductFilters = () => useProductStore((state) => state.filters)
export const useProductPagination = () => useProductStore((state) => state.pagination)
export const useProductLoading = () => useProductStore((state) => state.loading)
export const useProductError = () => useProductStore((state) => state.error)
export const useSearchSuggestions = () => useProductStore((state) => state.searchSuggestions)
export const useProductViewMode = () => useProductStore((state) => state.viewMode)