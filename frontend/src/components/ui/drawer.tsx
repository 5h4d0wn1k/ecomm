import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./sheet"
import { cn } from "@/lib/utils"

interface DrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface DrawerContentProps {
  children: React.ReactNode
  className?: string
  side?: "top" | "bottom" | "left" | "right"
}

interface DrawerHeaderProps {
  children: React.ReactNode
  className?: string
}

interface DrawerTitleProps {
  children: React.ReactNode
  className?: string
}

interface DrawerDescriptionProps {
  children: React.ReactNode
  className?: string
}

const Drawer = ({ open, onOpenChange, children }: DrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children}
    </Sheet>
  )
}

const DrawerTrigger = Sheet.Trigger
const DrawerClose = Sheet.Close

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof SheetContent>,
  DrawerContentProps
>(({ children, className, side = "right", ...props }, ref) => (
  <SheetContent
    ref={ref}
    side={side}
    className={cn(
      "w-full sm:max-w-lg bg-white shadow-myntra-xl",
      "mobile-padding",
      className
    )}
    {...props}
  >
    {children}
  </SheetContent>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({ children, className }: DrawerHeaderProps) => (
  <SheetHeader className={cn("pb-4", className)}>
    {children}
  </SheetHeader>
)

const DrawerTitle = ({ children, className }: DrawerTitleProps) => (
  <SheetTitle className={cn("text-xl font-display font-semibold text-gray-900", className)}>
    {children}
  </SheetTitle>
)

const DrawerDescription = ({ children, className }: DrawerDescriptionProps) => (
  <SheetDescription className={cn("text-gray-600", className)}>
    {children}
  </SheetDescription>
)

const DrawerBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto py-4", className)}
    {...props}
  />
))
DrawerBody.displayName = "DrawerBody"

const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse gap-2 pt-4 border-t border-gray-200",
      "sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
))
DrawerFooter.displayName = "DrawerFooter"

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
}