import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
  fullScreen?: boolean
}

export function Loading({
  size = 'md',
  text,
  className,
  fullScreen = false
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const content = (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <Loader2 className={cn('animate-spin text-pink-500', sizeClasses[size])} />
      {text && (
        <p className="text-sm text-gray-600 text-center">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
  )
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <LoadingSkeleton className="aspect-square" />
          <div className="p-4 space-y-3">
            <LoadingSkeleton className="h-4 w-3/4" />
            <LoadingSkeleton className="h-4 w-1/2" />
            <LoadingSkeleton className="h-6 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          {[...Array(columns)].map((_, j) => (
            <LoadingSkeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}