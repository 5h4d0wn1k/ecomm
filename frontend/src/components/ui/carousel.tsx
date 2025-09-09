import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface CarouselProps {
  children: React.ReactNode[]
  className?: string
  itemClassName?: string
  showDots?: boolean
  showArrows?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  itemsPerView?: number
  infinite?: boolean
  gap?: number
}

interface CarouselItemProps {
  children: React.ReactNode
  className?: string
}

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex-shrink-0", className)}
      {...props}
    >
      {children}
    </div>
  )
)
CarouselItem.displayName = "CarouselItem"

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({
    children,
    className,
    itemClassName,
    showDots = true,
    showArrows = true,
    autoPlay = false,
    autoPlayInterval = 5000,
    itemsPerView = 1,
    infinite = true,
    gap = 16,
    ...props
  }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [isTransitioning, setIsTransitioning] = React.useState(false)
    const carouselRef = React.useRef<HTMLDivElement>(null)
    const autoPlayRef = React.useRef<NodeJS.Timeout>()

    const totalItems = children.length
    const maxIndex = Math.max(0, totalItems - itemsPerView)

    const nextSlide = React.useCallback(() => {
      if (isTransitioning) return

      setIsTransitioning(true)
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= maxIndex) {
          return infinite ? 0 : prevIndex
        }
        return prevIndex + 1
      })

      setTimeout(() => setIsTransitioning(false), 300)
    }, [isTransitioning, maxIndex, infinite])

    const prevSlide = React.useCallback(() => {
      if (isTransitioning) return

      setIsTransitioning(true)
      setCurrentIndex((prevIndex) => {
        if (prevIndex <= 0) {
          return infinite ? maxIndex : prevIndex
        }
        return prevIndex - 1
      })

      setTimeout(() => setIsTransitioning(false), 300)
    }, [isTransitioning, maxIndex, infinite])

    const goToSlide = React.useCallback((index: number) => {
      if (isTransitioning || index === currentIndex) return

      setIsTransitioning(true)
      setCurrentIndex(index)
      setTimeout(() => setIsTransitioning(false), 300)
    }, [isTransitioning, currentIndex])

    // Auto-play functionality
    React.useEffect(() => {
      if (autoPlay && totalItems > itemsPerView) {
        autoPlayRef.current = setInterval(() => {
          nextSlide()
        }, autoPlayInterval)
      }

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current)
        }
      }
    }, [autoPlay, autoPlayInterval, nextSlide, totalItems, itemsPerView])

    // Pause auto-play on hover
    const handleMouseEnter = React.useCallback(() => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }, [])

    const handleMouseLeave = React.useCallback(() => {
      if (autoPlay && totalItems > itemsPerView) {
        autoPlayRef.current = setInterval(() => {
          nextSlide()
        }, autoPlayInterval)
      }
    }, [autoPlay, autoPlayInterval, nextSlide, totalItems, itemsPerView])

    // Keyboard navigation
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          prevSlide()
          break
        case 'ArrowRight':
          event.preventDefault()
          nextSlide()
          break
        case 'Home':
          event.preventDefault()
          goToSlide(0)
          break
        case 'End':
          event.preventDefault()
          goToSlide(maxIndex)
          break
      }
    }, [prevSlide, nextSlide, goToSlide, maxIndex])

    const canGoPrev = infinite || currentIndex > 0
    const canGoNext = infinite || currentIndex < maxIndex

    return (
      <div
        ref={ref}
        className={cn("relative w-full", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Carousel"
        {...props}
      >
        {/* Main carousel container */}
        <div className="overflow-hidden rounded-lg">
          <div
            ref={carouselRef}
            className={cn(
              "flex transition-transform duration-300 ease-in-out",
              isTransitioning && "transition-none"
            )}
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              gap: `${gap}px`
            }}
          >
            {children.map((child, index) => (
              <CarouselItem
                key={index}
                className={cn(
                  "w-full",
                  itemsPerView > 1 && `basis-1/${itemsPerView}`,
                  itemClassName
                )}
              >
                {child}
              </CarouselItem>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        {showArrows && totalItems > itemsPerView && (
          <>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md z-10",
                !canGoPrev && "opacity-50 cursor-not-allowed"
              )}
              onClick={prevSlide}
              disabled={!canGoPrev}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md z-10",
                !canGoNext && "opacity-50 cursor-not-allowed"
              )}
              onClick={nextSlide}
              disabled={!canGoNext}
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Dots indicator */}
        {showDots && totalItems > itemsPerView && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-myntra-pink focus:ring-offset-2",
                  index === currentIndex
                    ? "bg-myntra-pink scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? "true" : "false"}
              />
            ))}
          </div>
        )}

        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Slide {currentIndex + 1} of {maxIndex + 1}
        </div>
      </div>
    )
  }
)
Carousel.displayName = "Carousel"

export { Carousel, CarouselItem, type CarouselProps, type CarouselItemProps }