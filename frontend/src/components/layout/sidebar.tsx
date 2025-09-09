import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  ShoppingBag,
  Heart,
  User,
  Settings,
  CreditCard,
  Package,
  BarChart3,
  Users,
  Store,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

interface SidebarProps {
  className?: string
  collapsed?: boolean
  onToggle?: () => void
}

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

const vendorItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/vendor-dashboard",
    icon: Home,
  },
  {
    title: "Products",
    href: "/vendor-products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/vendor-orders",
    icon: ShoppingBag,
  },
  {
    title: "Analytics",
    href: "/vendor-analytics",
    icon: BarChart3,
  },
  {
    title: "Customers",
    href: "/vendor-customers",
    icon: Users,
  },
  {
    title: "Store Settings",
    href: "/vendor-settings",
    icon: Settings,
  },
]

const customerItems: SidebarItem[] = [
  {
    title: "My Account",
    href: "/profile",
    icon: User,
  },
  {
    title: "My Orders",
    href: "/orders",
    icon: Package,
  },
  {
    title: "Wishlist",
    href: "/wishlist",
    icon: Heart,
    badge: 3,
  },
  {
    title: "My Cart",
    href: "/cart",
    icon: ShoppingBag,
    badge: 2,
  },
  {
    title: "Payment Methods",
    href: "/payment-methods",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

const adminItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/admin-dashboard",
    icon: Home,
  },
  {
    title: "Users",
    href: "/admin-users",
    icon: Users,
  },
  {
    title: "Vendors",
    href: "/admin-vendors",
    icon: Store,
  },
  {
    title: "Products",
    href: "/admin-products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/admin-orders",
    icon: ShoppingBag,
  },
  {
    title: "Analytics",
    href: "/admin-analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin-settings",
    icon: Settings,
  },
]

interface SidebarContentProps {
  items: SidebarItem[]
  collapsed: boolean
}

function SidebarContent({ items, collapsed }: SidebarContentProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className={cn(
          "font-semibold text-gray-900 transition-opacity",
          collapsed && "opacity-0"
        )}>
          {collapsed ? "" : "Menu"}
        </h2>
      </div>

      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-1 py-4">
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 px-3 transition-all duration-200",
                    collapsed && "px-3",
                    isActive && "bg-myntra-pink/10 text-myntra-pink hover:bg-myntra-pink/20"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    !collapsed && "mr-3"
                  )} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <span className="bg-myntra-pink text-white text-xs px-2 py-1 rounded-full ml-2">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}

export function Sidebar({ className, collapsed = false, onToggle }: SidebarProps) {
  // Determine user type based on pathname or context
  const pathname = usePathname()
  let items: SidebarItem[] = []

  if (pathname?.startsWith('/vendor')) {
    items = vendorItems
  } else if (pathname?.startsWith('/admin')) {
    items = adminItems
  } else {
    items = customerItems
  }

  return (
    <div className={cn(
      "relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      <SidebarContent items={items} collapsed={collapsed} />

      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 h-8 w-8 rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200"
        onClick={onToggle}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}