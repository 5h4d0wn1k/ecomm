import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, ...props }, ref) => {
    const baseClasses = "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"

    const stateClasses = error
      ? "border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500"
      : success
      ? "border-green-300 focus-visible:ring-green-500 focus-visible:border-green-500"
      : "border-input focus-visible:ring-myntra-pink focus-visible:border-myntra-pink"

    return (
      <input
        type={type}
        className={cn(baseClasses, stateClasses, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }