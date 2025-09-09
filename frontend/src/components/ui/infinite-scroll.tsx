import { useEffect, useRef, useCallback } from 'react'
import { Spinner } from './spinner'

interface InfiniteScrollProps {
  hasNextPage: boolean
  isLoading: boolean
  onLoadMore: () => void
  children: React.ReactNode
  className?: string
  threshold?: number
}

export function InfiniteScroll({
  hasNextPage,
  isLoading,
  onLoadMore,
  children,
  className = '',
  threshold = 100
}: InfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null)

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries
    if (entry.isIntersecting && hasNextPage && !isLoading) {
      onLoadMore()
    }
  }, [hasNextPage, isLoading, onLoadMore])

  useEffect(() => {
    const element = observerRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: `${threshold}px`
    })

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [handleIntersection, threshold])

  return (
    <div className={className}>
      {children}

      {/* Loading indicator and intersection observer */}
      <div ref={observerRef} className="flex justify-center items-center py-8">
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-600">
            <Spinner size="sm" />
            <span className="text-sm">Loading more products...</span>
          </div>
        )}

        {!hasNextPage && !isLoading && (
          <div className="text-sm text-gray-500">
            You've reached the end of the list
          </div>
        )}
      </div>
    </div>
  )
}