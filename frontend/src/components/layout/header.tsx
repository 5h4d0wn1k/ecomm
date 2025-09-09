import * as React from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Menu, Heart, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-white shadow-sm",
      className
    )}>
      {/* Top bar for offers */}
      <div className="bg-myntra-pink text-white text-center py-1 text-sm">
        <p>Free shipping on orders above ₹499 | Extra 10% off on prepaid orders</p>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-display font-bold text-myntra-pink">
              MYNTRA
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/men"
              className="text-gray-700 hover:text-myntra-pink transition-colors font-medium"
            >
              MEN
            </Link>
            <Link
              href="/women"
              className="text-gray-700 hover:text-myntra-pink transition-colors font-medium"
            >
              WOMEN
            </Link>
            <Link
              href="/kids"
              className="text-gray-700 hover:text-myntra-pink transition-colors font-medium"
            >
              KIDS
            </Link>
            <Link
              href="/home-living"
              className="text-gray-700 hover:text-myntra-pink transition-colors font-medium"
            >
              HOME & LIVING
            </Link>
            <Link
              href="/beauty"
              className="text-gray-700 hover:text-myntra-pink transition-colors font-medium"
            >
              BEAUTY
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search for products, brands and more..."
                className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-myntra-pink"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile search toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden min-h-[44px] min-w-[44px]"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Toggle search"
              >
                <Search className="h-6 w-6" />
              </Button>

            {/* Profile */}
            <Button variant="ghost" size="icon" className="relative min-h-[44px] min-w-[44px]" aria-label="Profile">
              <User className="h-6 w-6" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative min-h-[44px] min-w-[44px]" aria-label="Wishlist">
              <Heart className="h-6 w-6" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-myntra-pink">
                3
              </Badge>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative min-h-[44px] min-w-[44px]" aria-label="Notifications">
              <Bell className="h-6 w-6" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                2
              </Badge>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative min-h-[44px] min-w-[44px]" aria-label="Shopping cart">
              <ShoppingBag className="h-6 w-6" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-myntra-pink">
                5
              </Badge>
            </Button>

            {/* Mobile menu */}
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
          </div>
        </div>

        {/* Mobile search bar */}
         {isSearchOpen && (
           <div className="lg:hidden pb-4 px-4">
             <div className="relative">
               <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
               <Input
                 type="search"
                 placeholder="Search for products, brands and more..."
                 className="pl-12 pr-4 py-3 w-full border-gray-300 focus:border-myntra-pink text-base rounded-lg"
               />
             </div>
           </div>
         )}
      </div>
    </header>
  )
}