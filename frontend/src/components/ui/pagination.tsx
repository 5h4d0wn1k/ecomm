import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) => {
  const getPageNumbers = () => {
    const pages = []
    const delta = 2

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      pages.push(i)
    }

    if (currentPage - delta > 2) {
      pages.unshift("...")
    }
    if (currentPage + delta < totalPages - 1) {
      pages.push("...")
    }

    if (totalPages > 1) pages.unshift(1)
    if (totalPages > 1) pages.push(totalPages)

    return pages
  }

  return (
    <nav
      className={cn(
        "flex items-center space-x-1",
        className
      )}
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="flex h-8 w-8 items-center justify-center">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}

export { Pagination }