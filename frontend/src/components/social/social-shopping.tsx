'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, Share2, Users, MessageCircle, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'

interface SocialShoppingProps {
  isOpen: boolean
  onClose: () => void
}

interface Wishlist {
  id: string
  name: string
  description: string
  isPublic: boolean
  collaborators: Collaborator[]
  items: WishlistItem[]
  createdBy: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  shareUrl: string
}

interface Collaborator {
  id: string
  name: string
  avatar?: string
  role: 'owner' | 'editor' | 'viewer'
}

interface WishlistItem {
  id: string
  productId: number
  product: {
    name: string
    price: number
    images: string[]
    brand: string
  }
  addedBy: {
    id: string
    name: string
  }
  addedAt: string
  notes?: string
  votes: number
}

interface StyleShare {
  id: string
  title: string
  description: string
  outfit: WishlistItem[]
  author: {
    id: string
    name: string
    avatar?: string
  }
  likes: number
  comments: Comment[]
  createdAt: string
  tags: string[]
}

interface Comment {
  id: string
  author: {
    id: string
    name: string
  }
  content: string
  createdAt: string
}

export function SocialShopping({ isOpen, onClose }: SocialShoppingProps) {
  const [activeTab, setActiveTab] = useState<'wishlists' | 'style-share' | 'collaborate'>('wishlists')
  const [wishlists, setWishlists] = useState<Wishlist[]>([
    {
      id: '1',
      name: 'Summer Fashion Finds',
      description: 'My wishlist for summer outfits',
      isPublic: true,
      collaborators: [
        { id: '1', name: 'You', role: 'owner' },
        { id: '2', name: 'Sarah', role: 'editor' }
      ],
      items: [
        {
          id: '1',
          productId: 1,
          product: {
            name: 'Floral Summer Dress',
            price: 2999,
            images: ['/api/placeholder/200/200'],
            brand: 'Zara'
          },
          addedBy: { id: '1', name: 'You' },
          addedAt: '2024-01-15',
          notes: 'Perfect for beach parties!',
          votes: 3
        }
      ],
      createdBy: { id: '1', name: 'You' },
      createdAt: '2024-01-10',
      shareUrl: 'https://example.com/wishlist/1'
    }
  ])

  const [styleShares] = useState<StyleShare[]>([
    {
      id: '1',
      title: 'Casual Friday Look',
      description: 'My go-to outfit for office casual Fridays',
      outfit: [],
      author: { id: '1', name: 'Emma', avatar: '/api/placeholder/40/40' },
      likes: 24,
      comments: [
        {
          id: '1',
          author: { id: '2', name: 'John' },
          content: 'Love this combination!',
          createdAt: '2024-01-16'
        }
      ],
      createdAt: '2024-01-15',
      tags: ['casual', 'office', 'summer']
    }
  ])

  const [showCreateWishlist, setShowCreateWishlist] = useState(false)
  const [newWishlist, setNewWishlist] = useState({
    name: '',
    description: '',
    isPublic: true
  })
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  // Copy share URL to clipboard
  const copyShareUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  // Create new wishlist
  const createWishlist = () => {
    if (!newWishlist.name.trim()) return

    const wishlist: Wishlist = {
      id: Date.now().toString(),
      name: newWishlist.name,
      description: newWishlist.description,
      isPublic: newWishlist.isPublic,
      collaborators: [{ id: '1', name: 'You', role: 'owner' }],
      items: [],
      createdBy: { id: '1', name: 'You' },
      createdAt: new Date().toISOString(),
      shareUrl: `https://example.com/wishlist/${Date.now()}`
    }

    setWishlists(prev => [...prev, wishlist])
    setNewWishlist({ name: '', description: '', isPublic: true })
    setShowCreateWishlist(false)
  }


  // Vote on wishlist item
  const voteOnItem = (wishlistId: string, itemId: string) => {
    setWishlists(prev => prev.map(wishlist => {
      if (wishlist.id === wishlistId) {
        return {
          ...wishlist,
          items: wishlist.items.map(item =>
            item.id === itemId
              ? { ...item, votes: item.votes + 1 }
              : item
          )
        }
      }
      return wishlist
    }))
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-6xl">
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Social Shopping</h2>
                <p className="text-pink-100">Share, collaborate, and discover together</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ×
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'wishlists', label: 'Collaborative Wishlists', icon: Heart },
              { id: 'style-share', label: 'Style Sharing', icon: Share2 },
              { id: 'collaborate', label: 'Find Collaborators', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'wishlists' | 'style-share' | 'collaborate')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-500 border-b-2 border-purple-500 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-500 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[600px] overflow-y-auto">
          {activeTab === 'wishlists' && (
            <div className="space-y-6">
              {/* Create Wishlist Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Your Wishlists</h3>
                <Button
                  onClick={() => setShowCreateWishlist(true)}
                  className="bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Wishlist
                </Button>
              </div>

              {/* Create Wishlist Modal */}
              {showCreateWishlist && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Create New Wishlist</h4>
                  <div className="space-y-4">
                    <Input
                      placeholder="Wishlist name"
                      value={newWishlist.name}
                      onChange={(e) => setNewWishlist(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newWishlist.description}
                      onChange={(e) => setNewWishlist(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="public"
                        checked={newWishlist.isPublic}
                        onChange={(e) => setNewWishlist(prev => ({ ...prev, isPublic: e.target.checked }))}
                      />
                      <label htmlFor="public" className="text-sm text-gray-700">
                        Make this wishlist public
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={createWishlist} disabled={!newWishlist.name.trim()}>
                        Create
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateWishlist(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Wishlists Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wishlists.map((wishlist) => (
                  <div key={wishlist.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{wishlist.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{wishlist.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyShareUrl(wishlist.shareUrl)}
                          className="text-gray-500 hover:text-purple-500"
                        >
                          {copiedUrl === wishlist.shareUrl ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Share2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Collaborators */}
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div className="flex -space-x-2">
                        {wishlist.collaborators.slice(0, 3).map((collaborator) => (
                          <div
                            key={collaborator.id}
                            className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white"
                            title={collaborator.name}
                          >
                            {collaborator.name.charAt(0)}
                          </div>
                        ))}
                        {wishlist.collaborators.length > 3 && (
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 border-2 border-white">
                            +{wishlist.collaborators.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {wishlist.collaborators.length} collaborator{wishlist.collaborators.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-3 mb-4">
                      {wishlist.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900">{item.product.name}</h5>
                            <p className="text-sm text-gray-600">₹{item.product.price}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => voteOnItem(wishlist.id, item.id)}
                              className="text-gray-500 hover:text-pink-500"
                            >
                              <Heart className="h-3 w-3" />
                            </Button>
                            <span className="text-xs text-gray-600">{item.votes}</span>
                          </div>
                        </div>
                      ))}
                      {wishlist.items.length > 2 && (
                        <p className="text-sm text-gray-600 text-center">
                          +{wishlist.items.length - 2} more items
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Add Item
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'style-share' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Style Shares</h3>
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Your Style
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {styleShares.map((style) => (
                  <div key={style.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Outfit Preview */}
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Outfit Preview</p>
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{style.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{style.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {style.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Author */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {style.author.name.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700">{style.author.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(style.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Engagement */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-gray-600 hover:text-pink-500">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm">{style.likes}</span>
                          </button>
                          <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">{style.comments.length}</span>
                          </button>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'collaborate' && (
            <div className="space-y-6">
              <div className="text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Shopping Buddies</h3>
                <p className="text-gray-600 mb-6">
                  Connect with other shoppers who share your style and interests
                </p>
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                  <Users className="h-4 w-4 mr-2" />
                  Discover People
                </Button>
              </div>

              {/* Suggested Collaborators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Fashionista123', interests: ['Fashion', 'Streetwear'], mutualFriends: 5 },
                  { name: 'StyleHunter', interests: ['Designer', 'Vintage'], mutualFriends: 3 },
                  { name: 'Shopaholic', interests: ['Deals', 'Accessories'], mutualFriends: 8 }
                ].map((person, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-lg font-bold text-white mx-auto mb-3">
                      {person.name.charAt(0)}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{person.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {person.interests.join(', ')}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      {person.mutualFriends} mutual friends
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}