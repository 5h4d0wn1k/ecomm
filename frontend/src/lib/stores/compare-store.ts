import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/lib/types'

interface CompareState {
  items: Product[]
  addToCompare: (product: Product) => void
  removeFromCompare: (productId: number) => void
  isInCompare: (productId: number) => boolean
  clearCompare: () => void
  getCompareCount: () => number
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCompare: (product: Product) => {
        const { items } = get()
        if (items.length >= 4) {
          alert('You can only compare up to 4 products at a time.')
          return
        }

        if (get().isInCompare(product.id)) {
          return
        }
        
        set({ items: [...items, product] })
      },

      removeFromCompare: (productId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }))
      },

      isInCompare: (productId: number) => {
        return get().items.some((item) => item.id === productId)
      },

      clearCompare: () => {
        set({ items: [] })
      },
      
      getCompareCount: () => {
        return get().items.length
      },
    }),
    {
      name: 'compare-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
)

// Helper hooks
export const useCompareItems = () => useCompareStore((state) => state.items)
export const useCompareCount = () => useCompareStore((state) => state.getCompareCount())
export const useIsInCompare = (productId: number) => useCompareStore((state) => state.isInCompare(productId))
