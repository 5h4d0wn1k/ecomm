import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, ApiResponse } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

interface WishlistItem {
  id: string
  productId: number
  product: Product
  addedAt: string
}

interface WishlistState {
  items: WishlistItem[]
  loading: boolean
  error: string | null

  // Actions
  addToWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (productId: number) => Promise<void>
  isInWishlist: (productId: number) => boolean
  clearWishlist: () => Promise<void>
  fetchWishlist: () => Promise<void>
  getWishlistCount: () => number
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      addToWishlist: async (product: Product) => {
        try {
          set({ loading: true, error: null })

          // Check if already in wishlist
          if (get().isInWishlist(product.id)) {
            return
          }

          // Add to backend
          await apiClient.post('/wishlist', { productId: product.id })

          // Add to local state
          const newItem: WishlistItem = {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            product,
            addedAt: new Date().toISOString(),
          }

          set((state) => ({
            items: [...state.items, newItem],
            loading: false
          }))
        } catch (error: unknown) {
          const errorMessage = error instanceof Error && 'response' in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to add to wishlist'
            : 'Failed to add to wishlist'
          set({
            error: errorMessage,
            loading: false
          })
        }
      },

      removeFromWishlist: async (productId: number) => {
        try {
          set({ loading: true, error: null })

          // Remove from backend
          await apiClient.delete(`/wishlist/${productId}`)

          // Remove from local state
          set((state) => ({
            items: state.items.filter(item => item.productId !== productId),
            loading: false
          }))
        } catch (error: unknown) {
          const errorMessage = error instanceof Error && 'response' in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to remove from wishlist'
            : 'Failed to remove from wishlist'
          set({
            error: errorMessage,
            loading: false
          })
        }
      },

      isInWishlist: (productId: number) => {
        return get().items.some(item => item.productId === productId)
      },

      clearWishlist: async () => {
        try {
          set({ loading: true, error: null })

          // Clear from backend
          await apiClient.delete('/wishlist')

          // Clear local state
          set({ items: [], loading: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error && 'response' in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to clear wishlist'
            : 'Failed to clear wishlist'
          set({
            error: errorMessage,
            loading: false
          })
        }
      },

      fetchWishlist: async () => {
        try {
          set({ loading: true, error: null })

          const response = await apiClient.get<ApiResponse<WishlistItem[]>>('/wishlist')
          if (!response.data?.data) {
            throw new Error('Invalid response format')
          }
          const wishlistItems = response.data.data

          set({
            items: wishlistItems.map((item: { id: string; productId: number; product: Product; createdAt: string }) => ({
              id: item.id,
              productId: item.productId,
              product: item.product,
              addedAt: item.createdAt,
            })),
            loading: false
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error && 'response' in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch wishlist'
            : 'Failed to fetch wishlist'
          set({
            error: errorMessage,
            loading: false
          })
        }
      },

      getWishlistCount: () => {
        return get().items.length
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
)

// Helper hooks
export const useWishlistItems = () => useWishlistStore((state) => state.items)
export const useWishlistCount = () => useWishlistStore((state) => state.getWishlistCount())
export const useIsInWishlist = (productId: number) => useWishlistStore((state) => state.isInWishlist(productId))