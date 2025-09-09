'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Palette, RotateCcw, Save, Share2, X, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

interface VirtualStylingRoomProps {
  onClose?: () => void
}

interface StyledItem {
  id: string
  productId: number
  name: string
  image: string
  category: string
  position: { x: number; y: number }
  scale: number
  rotation: number
  zIndex: number
}

export function VirtualStylingRoom({ onClose }: VirtualStylingRoomProps) {
  const [styledItems, setStyledItems] = useState<StyledItem[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('tops')

  const canvasRef = useRef<HTMLDivElement>(null)
  const mannequinRef = useRef<HTMLDivElement>(null)

  // Sample products for styling
  const sampleProducts = {
    tops: [
      { id: 1, name: 'Classic White T-Shirt', image: '/api/placeholder/200/200', category: 'tops' },
      { id: 2, name: 'Denim Jacket', image: '/api/placeholder/200/200', category: 'tops' },
      { id: 3, name: 'Sweater', image: '/api/placeholder/200/200', category: 'tops' },
    ],
    bottoms: [
      { id: 4, name: 'Blue Jeans', image: '/api/placeholder/200/200', category: 'bottoms' },
      { id: 5, name: 'Black Pants', image: '/api/placeholder/200/200', category: 'bottoms' },
      { id: 6, name: 'Skirt', image: '/api/placeholder/200/200', category: 'bottoms' },
    ],
    accessories: [
      { id: 7, name: 'Gold Necklace', image: '/api/placeholder/200/200', category: 'accessories' },
      { id: 8, name: 'Watch', image: '/api/placeholder/200/200', category: 'accessories' },
      { id: 9, name: 'Sunglasses', image: '/api/placeholder/200/200', category: 'accessories' },
    ],
    shoes: [
      { id: 10, name: 'Sneakers', image: '/api/placeholder/200/200', category: 'shoes' },
      { id: 11, name: 'Boots', image: '/api/placeholder/200/200', category: 'shoes' },
      { id: 12, name: 'Sandals', image: '/api/placeholder/200/200', category: 'shoes' },
    ]
  }

  // Add item to styling room
  const addItem = (product: { id: number; name: string; image: string; category: string }) => {
    const newItem: StyledItem = {
      id: `item-${Date.now()}`,
      productId: product.id,
      name: product.name,
      image: product.image,
      category: product.category,
      position: getDefaultPosition(product.category),
      scale: 1,
      rotation: 0,
      zIndex: styledItems.length + 1
    }

    setStyledItems(prev => [...prev, newItem])
    setShowProductSelector(false)
  }

  // Get default position based on category
  const getDefaultPosition = (category: string) => {
    switch (category) {
      case 'tops':
        return { x: 150, y: 120 }
      case 'bottoms':
        return { x: 150, y: 250 }
      case 'accessories':
        return { x: 180, y: 100 }
      case 'shoes':
        return { x: 150, y: 350 }
      default:
        return { x: 150, y: 200 }
    }
  }

  // Handle mouse/touch events for dragging
  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault()
    setSelectedItem(itemId)
    setIsDragging(true)

    const item = styledItems.find(item => item.id === itemId)
    if (item && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left - item.position.x,
        y: e.clientY - rect.top - item.position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedItem || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y

    setStyledItems(prev =>
      prev.map(item =>
        item.id === selectedItem
          ? { ...item, position: { x: newX, y: newY } }
          : item
      )
    )
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setSelectedItem(null)
  }

  // Scale item
  const scaleItem = (itemId: string, delta: number) => {
    setStyledItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, scale: Math.max(0.5, Math.min(2, item.scale + delta)) }
          : item
      )
    )
  }

  // Rotate item
  const rotateItem = (itemId: string, delta: number) => {
    setStyledItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, rotation: item.rotation + delta }
          : item
      )
    )
  }

  // Remove item
  const removeItem = (itemId: string) => {
    setStyledItems(prev => prev.filter(item => item.id !== itemId))
    if (selectedItem === itemId) {
      setSelectedItem(null)
    }
  }

  // Save outfit
  const saveOutfit = () => {
    const outfit = {
      id: `outfit-${Date.now()}`,
      name: `My Outfit ${new Date().toLocaleDateString()}`,
      items: styledItems,
      createdAt: new Date().toISOString()
    }

    // Save to localStorage (in a real app, this would be saved to backend)
    const savedOutfits = JSON.parse(localStorage.getItem('savedOutfits') || '[]')
    savedOutfits.push(outfit)
    localStorage.setItem('savedOutfits', JSON.stringify(savedOutfits))

    alert('Outfit saved successfully!')
  }

  // Share outfit
  const shareOutfit = () => {
    // In a real app, this would generate a shareable link or image
    const shareText = `Check out my virtual outfit: ${styledItems.map(item => item.name).join(', ')}`
    navigator.share?.({
      title: 'My Virtual Outfit',
      text: shareText,
      url: window.location.href
    }).catch(() => {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText)
      alert('Outfit details copied to clipboard!')
    })
  }

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-7xl">
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Virtual Styling Room</h2>
              <p className="text-pink-100 text-sm">Mix and match products to create your perfect look</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={saveOutfit}
                disabled={styledItems.length === 0}
                className="text-white hover:bg-white/20"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={shareOutfit}
                disabled={styledItems.length === 0}
                className="text-white hover:bg-white/20"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Main Canvas */}
          <div className="flex-1 relative bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
            {/* Mannequin/Base Figure */}
            <div
              ref={mannequinRef}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Simple mannequin representation */}
                <div className="w-32 h-64 bg-gray-200 rounded-full relative">
                  {/* Head */}
                  <div className="w-12 h-12 bg-gray-300 rounded-full absolute top-2 left-1/2 transform -translate-x-1/2"></div>
                  {/* Body */}
                  <div className="w-20 h-32 bg-gray-300 rounded-lg absolute top-16 left-1/2 transform -translate-x-1/2"></div>
                  {/* Arms */}
                  <div className="w-6 h-20 bg-gray-300 rounded-full absolute top-20 left-2"></div>
                  <div className="w-6 h-20 bg-gray-300 rounded-full absolute top-20 right-2"></div>
                  {/* Legs */}
                  <div className="w-8 h-24 bg-gray-300 rounded-full absolute bottom-0 left-6"></div>
                  <div className="w-8 h-24 bg-gray-300 rounded-full absolute bottom-0 right-6"></div>
                </div>
              </div>
            </div>

            {/* Styled Items */}
            <div
              ref={canvasRef}
              className="absolute inset-0 cursor-move"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {styledItems.map((item) => (
                <div
                  key={item.id}
                  className={`absolute cursor-move select-none ${
                    selectedItem === item.id ? 'ring-2 ring-pink-500 ring-offset-2' : ''
                  }`}
                  style={{
                    left: item.position.x,
                    top: item.position.y,
                    transform: `scale(${item.scale}) rotate(${item.rotation}deg)`,
                    zIndex: item.zIndex,
                    transformOrigin: 'center'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, item.id)}
                >
                  <div className="relative group">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg shadow-md"
                      draggable={false}
                    />

                    {/* Item Controls */}
                    {selectedItem === item.id && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-1 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            scaleItem(item.id, 0.1)
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            scaleItem(item.id, -0.1)
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            rotateItem(item.id, 15)
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeItem(item.id)
                          }}
                          className="p-1 hover:bg-red-100 text-red-600 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            {styledItems.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Creating Your Look</h3>
                  <p className="text-gray-600 mb-4">Add products from the panel to begin styling</p>
                  <Button onClick={() => setShowProductSelector(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Products
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Product Selector Panel */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            {/* Category Tabs */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-2 mb-4">
                {Object.keys(sampleProducts).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-pink-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              <Button
                onClick={() => setShowProductSelector(!showProductSelector)}
                className="w-full"
                variant={showProductSelector ? "outline" : "default"}
              >
                {showProductSelector ? 'Hide Products' : 'Browse Products'}
              </Button>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {showProductSelector && (
                <div className="grid grid-cols-2 gap-3">
                  {sampleProducts[selectedCategory as keyof typeof sampleProducts]?.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => addItem(product)}
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-2">
                        {product.name}
                      </h4>
                    </div>
                  ))}
                </div>
              )}

              {/* Current Outfit Summary */}
              {styledItems.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Current Outfit</h4>
                  <div className="space-y-2">
                    {styledItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded-lg">
                        <span className="text-sm text-gray-700">{item.name}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}