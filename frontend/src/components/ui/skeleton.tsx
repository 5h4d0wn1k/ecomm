import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)}
      {...props}
    />
  )
}

function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-lg border bg-white p-4 shadow-sm", className)} {...props}>
      <div className="space-y-3">
        <Skeleton className="h-48 w-full rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      </div>
    </div>
  )
}

function SkeletonProduct({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-lg border bg-white p-4 shadow-sm", className)} {...props}>
      <div className="space-y-3">
        <Skeleton className="h-48 w-full rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonText({ lines = 3, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

function SkeletonAvatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={cn("h-10 w-10 rounded-full", className)}
      {...props}
    />
  )
}

function SkeletonButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={cn("h-10 w-24 rounded-md", className)}
      {...props}
    />
  )
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonProduct,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
}