import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  useCartItems,
  useCartStore,
  useCartSubtotal,
  useCartTotal
} from '@/lib/stores/cart-store'

interface CartDrawerProps {
  children: React.ReactNode
}

export function CartDrawer({ children }: CartDrawerProps) {
  const items = useCartItems()
  const { updateQuantity, removeItem } = useCartStore()
  const subtotal = useCartSubtotal()
  const total = useCartTotal()

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5" />
            <span>Shopping Cart</span>
            {items.length > 0 && (
              <Badge variant="secondary">{items.length}</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some products to get started!</p>
              <Link href="/products">
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-4">
                  {items.map((item) => {
                    const price = item.variant
                      ? item.product.price + (item.variant.priceModifier || 0)
                      : item.product.price
                    const maxQuantity = item.variant
                      ? item.variant.stockQuantity
                      : item.product.stockQuantity

                    return (
                      <div key={item.id} className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <Image
                            src={item.product.images[0] || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            width={60}
                            height={60}
                            className="w-15 h-15 object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.product.id}`}>
                            <h4 className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                              {item.product.name}
                            </h4>
                          </Link>
                          {item.variant && (
                            <p className="text-xs text-gray-600">
                              {item.variant.name}: {item.variant.value}
                            </p>
                          )}
                          <p className="text-sm font-medium text-gray-900">
                            ₹{price.toLocaleString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.quantity >= maxQuantity}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Link href="/cart">
                    <Button variant="outline" className="w-full">
                      View Cart
                    </Button>
                  </Link>
                  <Link href="/checkout">
                    <Button className="w-full">
                      Checkout
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}