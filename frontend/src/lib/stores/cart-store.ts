import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, ProductVariant } from '@/lib/types'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getTaxAmount: () => number
  getTotalPrice: () => number
  getSubtotal: () => number
  isInCart: (productId: number, variantId?: number) => boolean
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity = 1, variant?: ProductVariant) => {
        const { items } = get()
        const itemId = variant ? `${product.id}-${variant.id}` : `${product.id}`

        const existingItem = items.find(item => item.id === itemId)

        if (existingItem) {
          // Update quantity if item already exists
          const newQuantity = existingItem.quantity + quantity
          const maxQuantity = variant ? variant.stockQuantity : product.stockQuantity

          if (newQuantity > maxQuantity) {
            // Don't add more than available stock
            return
          }

          set({
            items: items.map(item =>
              item.id === itemId
                ? { ...item, quantity: newQuantity }
                : item
            ),
          })
        } else {
          // Add new item
          const newItem: CartItem = {
            id: itemId,
            productId: product.id,
            variantId: variant?.id,
            quantity,
            product,
            variant,
          }

          set({ items: [...items, newItem] })
        }
      },

      removeItem: (itemId: string) => {
        const { items } = get()
        set({ items: items.filter(item => item.id !== itemId) })
      },

      updateQuantity: (itemId: string, quantity: number) => {
        const { items } = get()

        if (quantity <= 0) {
          set({ items: items.filter(item => item.id !== itemId) })
          return
        }

        set({
          items: items.map(item => {
            if (item.id === itemId) {
              const maxQuantity = item.variant
                ? item.variant.stockQuantity
                : item.product.stockQuantity

              return {
                ...item,
                quantity: Math.min(quantity, maxQuantity),
              }
            }
            return item
          }),
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          const price = item.variant
            ? item.product.price + (item.variant.priceModifier || 0)
            : item.product.price
          return total + (price * item.quantity)
        }, 0)
      },

      getTaxAmount: () => {
        const subtotal = get().getSubtotal()
        // Assuming 18% GST for India
        return subtotal * 0.18
      },

      getTotalPrice: () => {
        const subtotal = get().getSubtotal()
        const taxAmount = get().getTaxAmount()
        return subtotal + taxAmount
      },

      isInCart: (productId: number, variantId?: number) => {
        const { items } = get()
        const itemId = variantId ? `${productId}-${variantId}` : `${productId}`
        return items.some(item => item.id === itemId)
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
)

// Helper hooks
export const useCartItems = () => useCartStore((state) => state.items)
export const useCartItemCount = () => useCartStore((state) => state.getItemCount())
export const useCartTotal = () => useCartStore((state) => state.getTotalPrice())
export const useCartSubtotal = () => useCartStore((state) => state.getSubtotal())
export const useCartTax = () => useCartStore((state) => state.getTaxAmount())