import { ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProductSortingProps {
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  className?: string
}

export function ProductSorting({ sortBy, sortOrder, onSortChange, className }: ProductSortingProps) {
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'newest', label: 'Newest' },
    { value: 'popularity', label: 'Popularity' },
  ]

  const handleSortChange = (value: string) => {
    onSortChange(value, sortOrder)
  }

  const toggleSortOrder = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <span className="text-sm text-gray-600">Sort by:</span>

      <Select value={sortBy} onValueChange={handleSortChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={toggleSortOrder}
        className="flex items-center space-x-1"
      >
        {sortOrder === 'asc' ? (
          <ArrowUp className="w-4 h-4" />
        ) : (
          <ArrowDown className="w-4 h-4" />
        )}
        <span>{sortOrder === 'asc' ? 'Low to High' : 'High to Low'}</span>
      </Button>
    </div>
  )
}