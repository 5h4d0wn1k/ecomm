import { Skeleton } from '@/components/ui/skeleton'

interface ProductSkeletonProps {
  count?: number
  className?: string
}

export function ProductSkeleton({ count = 8, className = '' }: ProductSkeletonProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Image skeleton */}
          <div className="relative aspect-square bg-gray-200">
            <Skeleton className="w-full h-full" />
          </div>

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Brand skeleton */}
            <Skeleton className="h-3 w-16" />

            {/* Title skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Rating skeleton */}
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-8" />
            </div>

            {/* Price skeleton */}
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Variants skeleton */}
            <div className="flex space-x-1">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-6 w-8" />
            </div>

            {/* Vendor skeleton */}
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}