import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FilterUpdates {
  priceRange?: number[]
  categories?: string[]
  brands?: string[]
  rating?: number | null
  availability?: string
}

interface ProductFiltersProps {
  onFiltersChange: (filters: {
    priceRange: number[]
    categories: string[]
    brands: string[]
    rating: number | null
    availability: string
  }) => void
  categories: string[]
  brands: string[]
  className?: string
}

export function ProductFilters({ onFiltersChange, categories, brands, className }: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [rating, setRating] = useState<number | null>(null)
  const [availability, setAvailability] = useState<string>('all')

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category)
    setSelectedCategories(newCategories)
    updateFilters({ categories: newCategories })
  }

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...selectedBrands, brand]
      : selectedBrands.filter(b => b !== brand)
    setSelectedBrands(newBrands)
    updateFilters({ brands: newBrands })
  }

  const updateFilters = (updates: Partial<FilterUpdates>) => {
    onFiltersChange({
      priceRange,
      categories: selectedCategories,
      brands: selectedBrands,
      rating,
      availability,
      ...updates
    })
  }

  const clearFilters = () => {
    setPriceRange([0, 50000])
    setSelectedCategories([])
    setSelectedBrands([])
    setRating(null)
    setAvailability('all')
    onFiltersChange({
      priceRange: [0, 50000],
      categories: [],
      brands: [],
      rating: null,
      availability: 'all'
    })
  }

  const activeFiltersCount =
    selectedCategories.length +
    selectedBrands.length +
    (rating ? 1 : 0) +
    (availability !== 'all' ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 50000 ? 1 : 0)

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3">Price Range</h4>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={50000}
              min={0}
              step={500}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>₹{priceRange[0].toLocaleString()}</span>
              <span>₹{priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-medium mb-3">Categories</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked: boolean | "indeterminate") => {
                    console.log('Category checked type:', typeof checked, 'value:', checked);
                    const isChecked = checked === true;
                    handleCategoryChange(category, isChecked);
                  }}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div>
          <h4 className="font-medium mb-3">Brands</h4>
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(checked: boolean | "indeterminate") => {
                    console.log('Brand checked type:', typeof checked, 'value:', checked);
                    const isChecked = checked === true;
                    handleBrandChange(brand, isChecked);
                  }}
                />
                <label
                  htmlFor={`brand-${brand}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {brand}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h4 className="font-medium mb-3">Rating</h4>
          <Select value={rating?.toString() || ''} onValueChange={(value) => setRating(value ? parseInt(value) : null)}>
            <SelectTrigger>
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any rating</SelectItem>
              <SelectItem value="4">4+ stars</SelectItem>
              <SelectItem value="3">3+ stars</SelectItem>
              <SelectItem value="2">2+ stars</SelectItem>
              <SelectItem value="1">1+ stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Availability */}
        <div>
          <h4 className="font-medium mb-3">Availability</h4>
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}