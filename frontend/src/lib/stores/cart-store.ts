import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, ProductVariant } from '@/lib/types'

interface Coupon {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minimumOrderAmount: number
  isValid: boolean
  discountAmount: number
}

interface VendorCart {
  vendorId: number
  vendorName: string
  items: CartItem[]
  subtotal: number
  shippingAmount: number
  total: number
}

interface CartState {
  items: CartItem[]
  coupon: Coupon | null
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  applyCoupon: (coupon: Coupon | null) => void
  getItemCount: () => number
  getTaxAmount: () => number
  getTotalPrice: () => number
  getSubtotal: () => number
  getVendorCarts: () => VendorCart[]
  getShippingTotal: () => number
  getDiscountAmount: () => number
  isInCart: (productId: number, variantId?: number) => boolean
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

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
        set({ items: [], coupon: null })
      },

      applyCoupon: (coupon: Coupon | null) => {
        set({ coupon })
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

      getShippingTotal: () => {
        const vendorCarts = get().getVendorCarts()
        return vendorCarts.reduce((total, vendorCart) => total + vendorCart.shippingAmount, 0)
      },

      getDiscountAmount: () => {
        const { coupon } = get()
        if (!coupon || !coupon.isValid) return 0

        const subtotal = get().getSubtotal()
        if (subtotal < coupon.minimumOrderAmount) return 0

        return coupon.discountType === 'percentage'
          ? (subtotal * coupon.discountValue) / 100
          : Math.min(coupon.discountValue, subtotal)
      },

      getTotalPrice: () => {
        const subtotal = get().getSubtotal()
        const taxAmount = get().getTaxAmount()
        const shippingAmount = get().getShippingTotal()
        const discountAmount = get().getDiscountAmount()
        return subtotal + taxAmount + shippingAmount - discountAmount
      },

      getVendorCarts: () => {
        const { items } = get()
        const vendorGroups = items.reduce((groups, item) => {
          const vendorId = item.product.vendor.id
          if (!groups[vendorId]) {
            groups[vendorId] = {
              vendorId,
              vendorName: item.product.vendor.businessName,
              items: [],
              subtotal: 0,
              shippingAmount: 0,
              total: 0
            }
          }
          groups[vendorId].items.push(item)
          return groups
        }, {} as Record<number, VendorCart>)

        // Calculate subtotals and shipping for each vendor
        Object.values(vendorGroups).forEach(vendorCart => {
          vendorCart.subtotal = vendorCart.items.reduce((total, item) => {
            const price = item.variant
              ? item.product.price + (item.variant.priceModifier || 0)
              : item.product.price
            return total + (price * item.quantity)
          }, 0)

          // Simple shipping calculation: free shipping over ₹500, otherwise ₹50
          vendorCart.shippingAmount = vendorCart.subtotal >= 500 ? 0 : 50
          vendorCart.total = vendorCart.subtotal + vendorCart.shippingAmount
        })

        return Object.values(vendorGroups)
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
        coupon: state.coupon,
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
export const useCartShipping = () => useCartStore((state) => state.getShippingTotal())
export const useCartDiscount = () => useCartStore((state) => state.getDiscountAmount())
export const useCartCoupon = () => useCartStore((state) => state.coupon)
export const useVendorCarts = () => useCartStore((state) => state.getVendorCarts())
export const useApplyCoupon = () => useCartStore((state) => state.applyCoupon)