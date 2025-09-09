import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ProductFilters, Category, Vendor } from '@/lib/types'

interface AdvancedFiltersProps {
  categories: Category[]
  vendors: Vendor[]
  selectedCategories: number[]
  selectedBrands: number[]
  selectedSizes: string[]
  selectedColors: string[]
  showDiscountOnly: boolean
  priceRange: number[]
  filters: ProductFilters
  onCategoryToggle: (categoryId: number, checked: boolean) => void
  onBrandToggle: (brandId: number, checked: boolean) => void
  onSizeToggle: (size: string, checked: boolean) => void
  onColorToggle: (color: string, checked: boolean) => void
  onDiscountToggle: (checked: boolean) => void
  onPriceChange: (value: number[]) => void
  onRatingChange: (rating: number | undefined) => void
  onInStockChange: (inStock: boolean) => void
  onClearFilters: () => void
}

const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const availableColors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Gray', 'Brown']

export function AdvancedFilters({
  categories,
  vendors,
  selectedCategories,
  selectedBrands,
  selectedSizes,
  selectedColors,
  showDiscountOnly,
  priceRange,
  filters,
  onCategoryToggle,
  onBrandToggle,
  onSizeToggle,
  onColorToggle,
  onDiscountToggle,
  onPriceChange,
  onRatingChange,
  onInStockChange,
  onClearFilters,
}: AdvancedFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Price Range</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={onPriceChange}
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
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Categories</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {categories.slice(0, 8).map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked: boolean | "indeterminate") => {
                  onCategoryToggle(category.id, checked === true)
                }}
              />
              <label
                htmlFor={`category-${category.id}`}
                className="text-sm text-gray-700 cursor-pointer"
              >
                {category.name}
              </label>
            </div>
          ))}
          {categories.length > 8 && (
            <p className="text-xs text-gray-500">+{categories.length - 8} more categories</p>
          )}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Brands</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {vendors.slice(0, 8).map((vendor) => (
            <div key={vendor.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${vendor.id}`}
                checked={selectedBrands.includes(vendor.id)}
                onCheckedChange={(checked: boolean | "indeterminate") => {
                  onBrandToggle(vendor.id, checked === true)
                }}
              />
              <label
                htmlFor={`brand-${vendor.id}`}
                className="text-sm text-gray-700 cursor-pointer"
              >
                {vendor.businessName}
              </label>
            </div>
          ))}
          {vendors.length > 8 && (
            <p className="text-xs text-gray-500">+{vendors.length - 8} more brands</p>
          )}
        </div>
      </div>

      {/* Size & Color */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Size</h4>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => onSizeToggle(size, !selectedSizes.includes(size))}
              className={`px-3 py-1 text-xs border rounded-md transition-colors ${
                selectedSizes.includes(size)
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-pink-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <h4 className="font-medium text-gray-900 mt-4">Color</h4>
        <div className="flex flex-wrap gap-2">
          {availableColors.map((color) => (
            <button
              key={color}
              onClick={() => onColorToggle(color, !selectedColors.includes(color))}
              className={`px-3 py-1 text-xs border rounded-md transition-colors ${
                selectedColors.includes(color)
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-pink-300'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Rating & Availability */}
      <div className="space-y-3 md:col-span-2 lg:col-span-1">
        <h4 className="font-medium text-gray-900">Rating</h4>
        <Select
          value={filters.rating?.toString() || ''}
          onValueChange={(value) => onRatingChange(value ? parseFloat(value) : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any rating</SelectItem>
            <SelectItem value="4.5">4.5+ stars</SelectItem>
            <SelectItem value="4">4+ stars</SelectItem>
            <SelectItem value="3">3+ stars</SelectItem>
            <SelectItem value="2">2+ stars</SelectItem>
            <SelectItem value="1">1+ star</SelectItem>
          </SelectContent>
        </Select>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={filters.inStock || false}
              onCheckedChange={(checked: boolean | "indeterminate") => {
                onInStockChange(checked === true)
              }}
            />
            <label htmlFor="in-stock" className="text-sm text-gray-700 cursor-pointer">
              In Stock Only
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="discount-only"
              checked={showDiscountOnly}
              onCheckedChange={(checked: boolean | "indeterminate") => {
                onDiscountToggle(checked === true)
              }}
            />
            <label htmlFor="discount-only" className="text-sm text-gray-700 cursor-pointer">
              On Sale Only
            </label>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="md:col-span-2 lg:col-span-1 flex items-end">
        <Button variant="outline" onClick={onClearFilters} className="w-full">
          Clear All Filters
        </Button>
      </div>
    </div>
  )
}