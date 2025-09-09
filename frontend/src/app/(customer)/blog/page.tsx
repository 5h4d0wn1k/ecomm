'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { apiClient } from '@/lib/api/client'
import Link from 'next/link'
import { Search, Calendar, User, ArrowRight, Clock, TrendingUp, BookOpen, Heart, Share2, MessageCircle, Eye } from 'lucide-react'
// Using native JavaScript date formatting

interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    avatar: string
  }
  publishedAt: string
  readTime: number
  category: string
  tags: string[]
  featuredImage: string
  views: number
  likes: number
  comments: number
  isFeatured: boolean
}

interface BlogCategory {
  name: string
  count: number
  color: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Mock data for demonstration
  useEffect(() => {
    const mockPosts: BlogPost[] = [
      {
        id: 1,
        title: "The Ultimate Guide to Summer Fashion Trends 2024",
        excerpt: "Discover the hottest summer fashion trends that will keep you stylish and comfortable all season long. From breezy dresses to statement accessories, we've got you covered.",
        content: "Full article content here...",
        author: {
          name: "Priya Sharma",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        },
        publishedAt: "2024-05-15T10:00:00Z",
        readTime: 8,
        category: "Fashion",
        tags: ["summer", "trends", "fashion", "style"],
        featuredImage: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=400&fit=crop",
        views: 12500,
        likes: 245,
        comments: 32,
        isFeatured: true
      },
      {
        id: 2,
        title: "Top 10 Must-Have Electronics for Your Home Office",
        excerpt: "Transform your home office into a productivity powerhouse with these essential electronic gadgets and accessories.",
        content: "Full article content here...",
        author: {
          name: "Rahul Kumar",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        },
        publishedAt: "2024-05-12T14:30:00Z",
        readTime: 6,
        category: "Electronics",
        tags: ["electronics", "home office", "productivity", "gadgets"],
        featuredImage: "https://images.unsplash.com/photo-1486312338219-ce68e2c6f44d?w=800&h=400&fit=crop",
        views: 8900,
        likes: 189,
        comments: 24,
        isFeatured: true
      },
      {
        id: 3,
        title: "Sustainable Living: Eco-Friendly Products You Need",
        excerpt: "Make a positive impact on the environment with these amazing eco-friendly products that don't compromise on quality or style.",
        content: "Full article content here...",
        author: {
          name: "Anjali Patel",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
        },
        publishedAt: "2024-05-10T09:15:00Z",
        readTime: 7,
        category: "Lifestyle",
        tags: ["sustainable", "eco-friendly", "environment", "lifestyle"],
        featuredImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop",
        views: 15600,
        likes: 312,
        comments: 45,
        isFeatured: false
      },
      {
        id: 4,
        title: "Beauty Secrets: Professional Makeup Tips for Beginners",
        excerpt: "Learn professional makeup techniques that will enhance your natural beauty and boost your confidence.",
        content: "Full article content here...",
        author: {
          name: "Sneha Reddy",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
        },
        publishedAt: "2024-05-08T11:45:00Z",
        readTime: 5,
        category: "Beauty",
        tags: ["beauty", "makeup", "tips", "beginners"],
        featuredImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=400&fit=crop",
        views: 11200,
        likes: 198,
        comments: 28,
        isFeatured: false
      },
      {
        id: 5,
        title: "Smart Home Technology: The Future is Here",
        excerpt: "Explore the latest smart home technologies that are revolutionizing the way we live, work, and play.",
        content: "Full article content here...",
        author: {
          name: "Vikram Singh",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        },
        publishedAt: "2024-05-05T16:20:00Z",
        readTime: 9,
        category: "Technology",
        tags: ["smart home", "technology", "IoT", "automation"],
        featuredImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
        views: 13400,
        likes: 267,
        comments: 38,
        isFeatured: false
      },
      {
        id: 6,
        title: "Healthy Eating: Quick and Delicious Meal Prep Ideas",
        excerpt: "Discover easy meal prep recipes that are both nutritious and delicious, perfect for busy lifestyles.",
        content: "Full article content here...",
        author: {
          name: "Kavita Joshi",
          avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"
        },
        publishedAt: "2024-05-03T08:30:00Z",
        readTime: 6,
        category: "Health",
        tags: ["health", "meal prep", "nutrition", "recipes"],
        featuredImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop",
        views: 9800,
        likes: 156,
        comments: 22,
        isFeatured: false
      }
    ]

    const mockCategories: BlogCategory[] = [
      { name: "Fashion", count: 25, color: "from-pink-500 to-rose-500" },
      { name: "Electronics", count: 18, color: "from-blue-500 to-cyan-500" },
      { name: "Beauty", count: 15, color: "from-purple-500 to-indigo-500" },
      { name: "Lifestyle", count: 22, color: "from-green-500 to-emerald-500" },
      { name: "Technology", count: 12, color: "from-orange-500 to-red-500" },
      { name: "Health", count: 10, color: "from-teal-500 to-cyan-500" }
    ]

    setTimeout(() => {
      setPosts(mockPosts)
      setFeaturedPosts(mockPosts.filter(post => post.isFeatured))
      setCategories(mockCategories)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy')
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">DAV Creations Blog</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover the latest trends, tips, and insights from the world of fashion, technology, and lifestyle
              </p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 py-3 text-lg"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('all')}
                    className="px-4 py-2"
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.name}
                      variant={selectedCategory === category.name ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(category.name)}
                      className="px-4 py-2"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <TrendingUp className="h-6 w-6 text-pink-500 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Featured Articles</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className="relative">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-pink-500 hover:bg-pink-600">Featured</Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-white/90 text-gray-900">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {post.author.name}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(post.publishedAt)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {post.readTime} min read
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.views.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes}
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.comments}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="group-hover:bg-pink-500 group-hover:text-white group-hover:border-pink-500">
                          Read More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* All Posts */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
              <div className="text-sm text-gray-600">
                {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-gray-900">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {post.author.name}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(post.publishedAt)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {post.readTime}m
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {post.views.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {post.likes}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-pink-500 hover:text-pink-600 p-0 h-auto">
                        Read More
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {filteredPosts.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline" className="px-8 py-3">
                  Load More Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* No Results */}
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or browse all categories
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </section>
        </div>

        {/* Newsletter Section */}
        <section className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-12 mt-12">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated with Latest Trends</h3>
            <p className="text-pink-100 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter and get the latest fashion tips, product reviews, and exclusive offers delivered to your inbox.
            </p>
            <div className="max-w-md mx-auto flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/95 backdrop-blur-sm border-0 text-gray-900 placeholder-gray-600"
              />
              <Button className="bg-white text-pink-600 hover:bg-gray-100 px-6">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}