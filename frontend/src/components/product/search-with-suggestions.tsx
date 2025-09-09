import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'

interface SearchWithSuggestionsProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchWithSuggestions({
  value,
  onChange,
  onSearch,
  placeholder = "Search products...",
  className = ""
}: SearchWithSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounced search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await apiClient.get<string[]>(`/products/search/suggestions?q=${encodeURIComponent(value)}`)
        setSuggestions(response.data.data || [])
        setShowSuggestions(true)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [value])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    onSearch(suggestion)
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const handleSearch = () => {
    if (value.trim()) {
      onSearch(value.trim())
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  const clearSearch = () => {
    onChange('')
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSearch}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <Search className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto"
        >
          {isLoading && (
            <div className="px-4 py-2 text-sm text-gray-500">
              Searching...
            </div>
          )}

          {!isLoading && suggestions.length === 0 && value.length >= 2 && (
            <div className="px-4 py-2 text-sm text-gray-500">
              No suggestions found
            </div>
          )}

          {!isLoading && suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm truncate">
                  {highlightMatch(suggestion, value)}
                </span>
              </div>
            </button>
          ))}

          {!isLoading && suggestions.length > 0 && (
            <div className="px-4 py-2 text-xs text-gray-400 border-t">
              Press Enter to search for "{value}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}