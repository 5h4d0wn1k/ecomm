'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star, Heart, Truck, Shield, Award, ShoppingBag, TrendingUp, ArrowRight, Search, Mail, Play, Mic, MicOff, X, Camera, Zap, Clock, ShoppingCart, User, MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SocialShare } from '@/components/ui/social-share'
import { Testimonials } from '@/components/home/testimonials'
import { Recommendations } from '@/components/home/recommendations'
import { SEOHead } from '@/components/seo/SEOHead'
import { Footer } from '@/components/layout/footer'

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroSearchQuery, setHeroSearchQuery] = useState('')
  const [email, setEmail] = useState('')
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Enhanced search features
  const [isListening, setIsListening] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    priceRange: '',
    brand: '',
    rating: ''
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingSearches] = useState([
    'wireless earbuds', 'smart watches', 'sneakers', 'laptops', 'dresses'
  ])

  // Live chat features
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hi! How can I help you today?", sender: 'bot', timestamp: new Date() }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Countdown timer for deals
  const [dealTimeLeft, setDealTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  })

  // Touch/swipe support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const recognitionRef = useRef<any>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const heroSlides = useMemo(() => [
    {
      id: 1,
      title: "FLAT 70% OFF",
      subtitle: "On Your First Purchase",
      description: "Shop now and save big on fashion, electronics & more",
      gradient: "from-pink-500 via-rose-500 to-red-500",
      cta: "Shop Now",
      link: "/products",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
      stats: "10,000+ Happy Customers",
      badge: "🔥 Limited Time"
    },
    {
      id: 2,
      title: "NEW ARRIVALS",
      subtitle: "Latest Fashion Trends",
      description: "Discover the latest collection from top brands",
      gradient: "from-purple-500 via-pink-500 to-rose-500",
      cta: "Explore",
      link: "/new-arrivals",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=600&fit=crop",
      stats: "500+ New Products",
      badge: "✨ Fresh Collection"
    },
    {
      id: 3,
      title: "FLASH SALE",
      subtitle: "Up to 80% Off",
      description: "Limited time offer on selected items",
      gradient: "from-orange-500 via-red-500 to-pink-500",
      cta: "Grab Deal",
      link: "/deals",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=600&fit=crop",
      stats: "24 Hours Left",
      badge: "⚡ Flash Sale"
    }
  ], [])



  const nextSlide = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [heroSlides.length, isTransitioning])

  const prevSlide = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [heroSlides.length, isTransitioning])

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return
    setIsTransitioning(true)
    setCurrentSlide(index)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [currentSlide, isTransitioning])

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide, isAutoPlaying])

  const handleMouseEnter = useCallback(() => {
    setIsAutoPlaying(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsAutoPlaying(true)
  }, [])

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (heroSearchQuery.trim()) {
      // Add to recent searches
      const updatedRecent = [heroSearchQuery, ...recentSearches.filter(s => s !== heroSearchQuery)].slice(0, 5)
      setRecentSearches(updatedRecent)
      localStorage.setItem('heroRecentSearches', JSON.stringify(updatedRecent))

      // Build search URL with filters
      const params = new URLSearchParams()
      params.set('q', heroSearchQuery)
      if (searchFilters.category) params.set('category', searchFilters.category)
      if (searchFilters.priceRange) params.set('priceRange', searchFilters.priceRange)
      if (searchFilters.brand) params.set('brand', searchFilters.brand)
      if (searchFilters.rating) params.set('rating', searchFilters.rating)

      window.location.href = `/search?${params.toString()}`
    }
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    alert('Thank you for subscribing!')
    setEmail('')
  }

  // Voice search functionality
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()

    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onstart = () => {
      setIsListening(true)
    }

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setHeroSearchQuery(transcript)
      setIsListening(false)
    }

    recognitionRef.current.onerror = () => {
      setIsListening(false)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current.start()
  }

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  // Load recent searches on mount and handle click outside
  useEffect(() => {
    const saved = localStorage.getItem('heroRecentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }

    // Handle click outside to close filters
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowAdvancedFilters(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setDealTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          // Reset to 24 hours when countdown reaches zero
          return { hours: 23, minutes: 59, seconds: 59 }
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  // Handle recent search click
  const handleRecentSearchClick = (search: string) => {
    setHeroSearchQuery(search)
    setShowAdvancedFilters(false)
  }

  // Handle trending search click
  const handleTrendingSearchClick = (search: string) => {
    setHeroSearchQuery(search)
    setShowAdvancedFilters(false)
  }

  // Chat functionality
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: chatMessages.length + 1,
        text: newMessage,
        sender: 'user',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, userMessage])
      setNewMessage('')
      setIsTyping(true)

      // Simulate bot response
      setTimeout(() => {
        const botResponses = [
          "I'd be happy to help you find the perfect product!",
          "Let me check our latest deals for you.",
          "Our customer service team is here to assist you 24/7.",
          "I can help you with product recommendations, order tracking, or any questions you have.",
          "Thanks for reaching out! How can I assist you today?"
        ]
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]
        const botMessage = {
          id: chatMessages.length + 2,
          text: randomResponse,
          sender: 'bot',
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, botMessage])
        setIsTyping(false)
      }, 1000 + Math.random() * 2000)
    }
  }

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen)
  }

  // Touch event handlers for swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  // Minimum swipe distance
  const minSwipeDistance = 50

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevSlide()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nextSlide()
      }
    }

    // Add keyboard event listener when component mounts
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  return (
    <>
      <SEOHead
        title="DAV Creations - Premium Multi-Vendor E-Commerce Platform"
        description="Shop from thousands of verified vendors across India. Find amazing products at great prices with fast delivery and secure payments."
        keywords={["ecommerce", "multi-vendor", "online shopping", "India", "verified vendors", "fashion", "electronics", "home decor"]}
        type="website"
      />
      <main className="min-h-screen bg-white" role="main">
      {/* Enhanced Hero Section */}
      <section
        className="relative bg-gray-50 overflow-hidden"
        aria-labelledby="hero-heading"
        role="banner"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-describedby="hero-description"
      >
        <div className="w-full">
          {/* Screen reader description */}
          <div id="hero-description" className="sr-only">
            Discover amazing products with our enhanced search featuring voice search, advanced filters, and personalized recommendations
          </div>

          {/* Search help for screen readers */}
          <div id="search-help" className="sr-only">
            Use voice search by clicking the microphone button, or type to search with advanced filters for category, price range, brand, and rating
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Sidebar Categories */}
            <div className="lg:col-span-2 bg-white border-r border-gray-200 hidden lg:block shadow-lg" role="complementary" aria-label="Product categories">
              <div className="p-6 sticky top-0">
                <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wide">Shop by Category</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Men', icon: '👔' },
                    { name: 'Women', icon: '👗' },
                    { name: 'Kids', icon: '🧸' },
                    { name: 'Home & Living', icon: '🏠' },
                    { name: 'Beauty & Health', icon: '💄' },
                    { name: 'Electronics', icon: '📱' },
                    { name: 'Sports & Fitness', icon: '⚽' },
                    { name: 'Books & More', icon: '📚' }
                  ].map((category) => (
                    <Link
                      key={category.name}
                      href={`/products?category=${category.name.toLowerCase().replace(' & ', '-').replace(' ', '-')}`}
                      className="group flex items-center text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 px-3 py-2 rounded-lg transition-all duration-200 hover:translate-x-1"
                    >
                      <span className="mr-3 text-lg">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Hero Banner */}
            <div className="lg:col-span-8 relative overflow-hidden">
              <div className="relative h-96 lg:h-[600px] group">
                {/* Background Slides with Parallax */}
                <div className="absolute inset-0">
                  {heroSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-all duration-700 ease-out ${
                        index === currentSlide
                          ? 'opacity-100 scale-100'
                          : index === (currentSlide - 1 + heroSlides.length) % heroSlides.length
                          ? 'opacity-0 scale-95 -translate-x-full'
                          : index === (currentSlide + 1) % heroSlides.length
                          ? 'opacity-0 scale-95 translate-x-full'
                          : 'opacity-0 scale-90'
                      }`}
                      style={{
                        backgroundImage: `url(${slide.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: `translateX(${(index - currentSlide) * 100}%) scale(${index === currentSlide ? 1 : 0.95})`,
                        transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-90`}></div>
                      <div className="absolute inset-0 bg-black/30"></div>
                    </div>
                  ))}
                </div>

                {/* Content Overlay */}
                <div className="relative h-full flex items-center z-10">
                  <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                      {/* Badge */}
                      <div className="inline-flex items-center bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/30 animate-pulse">
                        <span className="mr-2">{heroSlides[currentSlide].badge}</span>
                        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                      </div>

                      {/* Main Heading */}
                      <h1
                        id="hero-heading"
                        className="text-5xl lg:text-7xl font-black text-white mb-4 leading-tight animate-fade-in-up"
                        style={{
                          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                          animation: 'fadeInUp 0.8s ease-out'
                        }}
                      >
                        {heroSlides[currentSlide].subtitle}
                      </h1>

                      {/* Description */}
                      <p className="text-xl lg:text-2xl text-white/95 mb-8 font-light leading-relaxed animate-fade-in-up animation-delay-200">
                        {heroSlides[currentSlide].description}
                      </p>

                      {/* Trust Indicators with Social Proof */}
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 animate-fade-in-up animation-delay-400">
                        <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
                          <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                          <span className="font-semibold text-sm">4.8/5 Rating</span>
                        </div>
                        <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
                          <Truck className="w-5 h-5 mr-2" />
                          <span className="font-semibold text-sm">Free Shipping</span>
                        </div>
                        <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
                          <Shield className="w-5 h-5 mr-2" />
                          <span className="font-semibold text-sm">100% Secure</span>
                        </div>
                        <div className="text-white/90 font-semibold bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full text-sm">
                          {heroSlides[currentSlide].stats}
                        </div>
                        <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
                          <Award className="w-5 h-5 mr-2" />
                          <span className="font-semibold text-sm">50K+ Customers</span>
                        </div>
                      </div>

                      {/* Social Proof Badges */}
                      <div className="flex items-center space-x-4 mb-6 animate-fade-in-up animation-delay-500">
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                            >
                              {String.fromCharCode(65 + i)}
                            </div>
                          ))}
                        </div>
                        <div className="text-white/90 text-sm">
                          <span className="font-semibold">2,340</span> people bought this in last 24 hours
                        </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-600">
                        <Link href={heroSlides[currentSlide].link}>
                          <Button className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-4 text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-full">
                            {heroSlides[currentSlide].cta}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold px-8 py-4 text-lg rounded-full transition-all duration-300"
                        >
                          <Play className="mr-2 h-5 w-5" />
                          Watch Demo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Search Bar with Voice Search and Filters */}
                <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-sm sm:max-w-4xl px-4 z-20">
                  <div className="space-y-3">
                    {/* Main Search Form */}
                    <form onSubmit={handleHeroSearch} className="relative group">
                      <div className="relative transform transition-all duration-300 group-hover:scale-105">
                        <Input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search products, brands, or upload image..."
                          value={heroSearchQuery}
                          onChange={(e) => setHeroSearchQuery(e.target.value)}
                          onFocus={() => setShowAdvancedFilters(true)}
                          aria-label="Search for products"
                          aria-describedby="search-help"
                          aria-expanded={showAdvancedFilters}
                          aria-haspopup="listbox"
                          role="combobox"
                          autoComplete="off"
                          className="w-full pl-4 sm:pl-6 pr-20 sm:pr-24 py-3 sm:py-5 text-base sm:text-lg bg-white/95 backdrop-blur-lg border-0 rounded-full shadow-2xl focus:ring-4 focus:ring-pink-300/50 text-gray-900 placeholder-gray-600 transition-all duration-300 hover:shadow-3xl focus-ring"
                        />

                        {/* Voice Search Button */}
                        <button
                          type="button"
                          onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                          className={`absolute right-12 sm:right-16 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 ${
                            isListening
                              ? 'bg-red-500 text-white animate-pulse'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                          aria-label={isListening ? "Stop voice search" : "Start voice search"}
                        >
                          {isListening ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
                        </button>

                        {/* Search Button */}
                        <button
                          type="submit"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 sm:p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
                          aria-label="Search"
                        >
                          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </form>

                    {/* Advanced Filters and Suggestions */}
                    {showAdvancedFilters && (
                      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 p-4 max-h-96 overflow-y-auto">
                        {/* Quick Filters */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                          <select
                            value={searchFilters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                          >
                            <option value="">All Categories</option>
                            <option value="electronics">Electronics</option>
                            <option value="fashion">Fashion</option>
                            <option value="home">Home & Living</option>
                            <option value="beauty">Beauty</option>
                          </select>

                          <select
                            value={searchFilters.priceRange}
                            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                          >
                            <option value="">Any Price</option>
                            <option value="0-500">Under ₹500</option>
                            <option value="500-2000">₹500 - ₹2000</option>
                            <option value="2000-5000">₹2000 - ₹5000</option>
                            <option value="5000+">Above ₹5000</option>
                          </select>

                          <select
                            value={searchFilters.brand}
                            onChange={(e) => handleFilterChange('brand', e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                          >
                            <option value="">All Brands</option>
                            <option value="nike">Nike</option>
                            <option value="adidas">Adidas</option>
                            <option value="samsung">Samsung</option>
                            <option value="apple">Apple</option>
                          </select>

                          <select
                            value={searchFilters.rating}
                            onChange={(e) => handleFilterChange('rating', e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                          >
                            <option value="">Any Rating</option>
                            <option value="4">4+ Stars</option>
                            <option value="3">3+ Stars</option>
                            <option value="2">2+ Stars</option>
                          </select>
                        </div>

                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              Recent Searches
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {recentSearches.map((search, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleRecentSearchClick(search)}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-pink-100 hover:text-pink-700 transition-colors"
                                >
                                  {search}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Trending Searches */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Trending Now
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {trendingSearches.map((search, index) => (
                              <button
                                key={index}
                                onClick={() => handleTrendingSearchClick(search)}
                                className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-sm hover:bg-pink-100 transition-colors border border-pink-200"
                              >
                                {search}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Visual Search */}
                        <div className="border-t border-gray-200 pt-4">
                          <button
                            type="button"
                            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            <Camera className="h-5 w-5 mr-2" />
                            <span className="font-medium">Search by Image</span>
                            <Zap className="h-4 w-4 ml-2" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  disabled={isTransitioning}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-lg text-white p-4 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-30"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={isTransitioning}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-lg text-white p-4 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-30"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Enhanced Slide Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
                  {heroSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      disabled={isTransitioning}
                      className={`relative transition-all duration-300 rounded-full ${
                        index === currentSlide
                          ? 'w-8 h-3 bg-white shadow-lg'
                          : 'w-3 h-3 bg-white/60 hover:bg-white/80'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-label={`Go to slide ${index + 1}`}
                    >
                      {index === currentSlide && (
                        <div className="absolute inset-0 bg-white rounded-full animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Auto-play Indicator */}
                <div className="absolute top-6 right-6 z-30">
                  <div className="flex items-center bg-black/20 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm">
                    <div className={`w-2 h-2 rounded-full mr-2 ${isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="font-medium">{isAutoPlaying ? 'Auto-play ON' : 'Auto-play PAUSED'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-2 bg-white border-l border-gray-200 hidden lg:block">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">QUICK LINKS</h3>
                <div className="space-y-3">
                  <Link href="/deals" className="block text-sm text-gray-700 hover:text-pink-600 transition-colors">
                    Today&apos;s Deals
                  </Link>
                  <Link href="/new-arrivals" className="block text-sm text-gray-700 hover:text-pink-600 transition-colors">
                    New Arrivals
                  </Link>
                  <Link href="/best-sellers" className="block text-sm text-gray-700 hover:text-pink-600 transition-colors">
                    Best Sellers
                  </Link>
                  <Link href="/gift-cards" className="block text-sm text-gray-700 hover:text-pink-600 transition-colors">
                    Gift Cards
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Section - Myntra Style */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* 100% Original Guarantee */}
              <div className="flex items-center justify-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-sm font-bold text-green-800 mb-1">100% ORIGINAL</h3>
                  <p className="text-xs text-green-600">guarantee for all products</p>
                </div>
              </div>

              {/* Return Policy */}
              <div className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-bold text-blue-800 mb-1">RETURN WITHIN</h3>
                  <p className="text-xs text-blue-600">14 days of receiving order</p>
                </div>
              </div>

              {/* Secure Payments */}
              <div className="flex items-center justify-center p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-bold text-purple-800 mb-1">SECURE</h3>
                  <p className="text-xs text-purple-600">payments & transactions</p>
                </div>
              </div>

              {/* Quality Assured */}
              <div className="flex items-center justify-center p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="h-6 w-6 text-orange-600 fill-current" />
                  </div>
                  <h3 className="text-sm font-bold text-orange-800 mb-1">QUALITY</h3>
                  <p className="text-xs text-orange-600">assured & verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category - Myntra Style */}
      <section className="py-12 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">SHOP BY CATEGORY</h2>
            <p className="text-gray-600">Find what you&apos;re looking for</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {[
              { name: 'Men', icon: '👔', color: 'from-blue-500 to-blue-600' },
              { name: 'Women', icon: '👗', color: 'from-pink-500 to-rose-500' },
              { name: 'Kids', icon: '🧸', color: 'from-green-500 to-emerald-500' },
              { name: 'Home', icon: '🏠', color: 'from-purple-500 to-indigo-500' },
              { name: 'Beauty', icon: '💄', color: 'from-red-500 to-pink-500' },
              { name: 'Electronics', icon: '📱', color: 'from-gray-500 to-gray-600' },
              { name: 'Sports', icon: '⚽', color: 'from-orange-500 to-red-500' },
              { name: 'Books', icon: '📚', color: 'from-teal-500 to-cyan-500' }
            ].map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${category.name.toLowerCase()}`}
                className="group"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-pink-200">
                  <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-full mx-auto mb-3 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-200`}>
                    {category.icon}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 text-center group-hover:text-pink-600 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Deal of the Day - Myntra Style */}
      <section className="py-12 bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-pink-500 mr-2" />
                <span className="text-sm font-medium text-pink-500 uppercase tracking-wide">Ending Soon</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">DEAL OF THE DAY</h2>
              <p className="text-gray-600 text-sm mt-1">Limited time offers - Don't miss out!</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Countdown Timer */}
              <div className="bg-white rounded-lg p-4 shadow-md border border-pink-200">
                <div className="text-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Ends in</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600 bg-pink-50 rounded px-2 py-1">
                      {dealTimeLeft.hours.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Hours</div>
                  </div>
                  <div className="text-pink-500 font-bold">:</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600 bg-pink-50 rounded px-2 py-1">
                      {dealTimeLeft.minutes.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Minutes</div>
                  </div>
                  <div className="text-pink-500 font-bold">:</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600 bg-pink-50 rounded px-2 py-1">
                      {dealTimeLeft.seconds.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Seconds</div>
                  </div>
                </div>
              </div>
              <Link href="/deals">
                <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50">
                  View All Deals
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-rose-100/20"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-2xl">👕</span>
                      </div>
                      <span className="text-gray-600 text-xs font-medium">Deal Product {i}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      70% OFF
                    </span>
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      VERIFIED
                    </span>
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></span>
                      25 sold today
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                      <Shield className="w-3 h-3 text-green-500 mr-1" />
                      <span className="text-gray-700 font-medium">Secure</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                    Premium Deal Product {i}
                  </h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ₹1,299
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ₹2,999
                    </span>
                    <span className="text-sm text-green-600 font-semibold">
                      70% off
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">(42 reviews)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <Award className="w-3 h-3 mr-1" />
                        <span>Top Rated</span>
                      </div>
                      <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        <span className="font-semibold">98%</span>
                        <span className="ml-1">liked</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner - Myntra Style */}
      <section className="py-8 bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-pink-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm font-medium text-pink-500 uppercase tracking-wide">Limited Time Offer</span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    Summer Collection 2024
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    Discover the latest trends in fashion with up to 50% off on selected items. Perfect for the season ahead!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/summer-collection">
                      <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        Shop Collection
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50 px-8 py-3 font-semibold">
                      Learn More
                    </Button>
                  </div>
                </div>
                <div className="relative bg-gradient-to-br from-pink-100 to-rose-100 p-8 lg:p-12 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                      <span className="text-4xl">🌞</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Seasonal Sale</h4>
                    <p className="text-gray-600">Up to 50% OFF</p>
                  </div>
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                    HOT
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals - Myntra Style */}
      <section className="py-12 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-pink-500 uppercase tracking-wide">Just In</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">NEW ARRIVALS</h2>
              <p className="text-gray-600 text-sm mt-1">Fresh styles just landed</p>
            </div>
            <Link href="/new-arrivals">
              <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-2xl">👗</span>
                      </div>
                      <span className="text-gray-600 text-xs font-medium">New Item {i}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      NEW
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all duration-200">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                    </button>
                    <div className="scale-75">
                      <SocialShare
                        url={`/products/deal-${i}`}
                        title={`Amazing Deal: Premium Deal Product ${i}`}
                        description={`Get this amazing product at 70% off! Limited time offer.`}
                      />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                    Fresh New Fashion Item {i}
                  </h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ₹1,499
                    </span>
                    <span className="text-sm text-green-600 font-semibold">
                      20% off
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">(15)</span>
                  </div>
                  <Button size="sm" className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers - Myntra Style */}
      <section className="py-12 bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center mb-2">
                <Award className="w-5 h-5 text-pink-500 mr-2" />
                <span className="text-sm font-medium text-pink-500 uppercase tracking-wide">Top Rated</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">BEST SELLERS</h2>
              <p className="text-gray-600 text-sm mt-1">Most loved by our customers</p>
            </div>
            <Link href="/best-sellers">
              <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 to-blue-100/20"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-200 to-blue-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-2xl">👟</span>
                      </div>
                      <span className="text-gray-600 text-xs font-medium">Best Seller {i}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      BEST SELLER
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                    Top Rated Best Seller {i}
                  </h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ₹2,999
                    </span>
                    <span className="text-sm text-green-600 font-semibold">
                      40% off
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">(245)</span>
                  </div>
                  <Button size="sm" className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner 2 - Brand Collaboration */}
      <section className="py-8 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative bg-gradient-to-br from-purple-100 to-blue-100 p-8 lg:p-12 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                      <span className="text-4xl">👥</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Brand Collaboration</h4>
                    <p className="text-gray-600">Exclusive partnership deals</p>
                  </div>
                  <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    NEW
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-500 uppercase tracking-wide">Exclusive Partnership</span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    Premium Brand Collection
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    Discover exclusive collections from top fashion brands. Limited edition pieces available only here!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/brand-collaboration">
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        Explore Brands
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50 px-8 py-3 font-semibold">
                      View Collection
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now - Myntra Style */}
      <section className="py-12 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 text-pink-500 mr-2" />
                <span className="text-sm font-medium text-pink-500 uppercase tracking-wide">Trending Now</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">POPULAR THIS WEEK</h2>
            </div>
            <Link href="/trending">
              <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-red-100/20"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-red-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-2xl">🔥</span>
                      </div>
                      <span className="text-gray-600 text-xs font-medium">Trending {i}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      #{i} Trending
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                    Hot Trending Fashion {i}
                  </h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ₹2,499
                    </span>
                    <span className="text-sm text-green-600 font-semibold">
                      25% off
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">(85)</span>
                  </div>
                  <Button size="sm" className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner 3 - Seasonal Campaign */}
      <section className="py-8 bg-gradient-to-r from-orange-50 via-red-50 to-pink-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm font-medium text-orange-500 uppercase tracking-wide">Seasonal Campaign</span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    Festival Collection 2024
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    Celebrate the festive season with our exclusive collection. Traditional wear meets modern fashion!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/festival-collection">
                      <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        Shop Festival Wear
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-3 font-semibold">
                      View Collection
                    </Button>
                  </div>
                </div>
                <div className="relative bg-gradient-to-br from-orange-100 to-red-100 p-8 lg:p-12 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                      <span className="text-4xl">🎉</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Festive Season</h4>
                    <p className="text-gray-600">Up to 60% OFF</p>
                  </div>
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                    FESTIVE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced with Trust Indicators */}
      <section className="py-16 bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">WHY CHOOSE DAV CREATIONS?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience premier e-commerce with verified vendors, secure transactions, and exceptional customer service
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
              <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">10,000+ Products</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Curated collection from 500+ verified vendors across India
              </p>
              <div className="mt-4 flex items-center justify-center">
                <div className="flex items-center text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">4.8/5 (2,340 reviews)</span>
              </div>
            </div>

            <div className="text-center bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Free Delivery</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Fast & free shipping on orders above ₹499 with real-time tracking
              </p>
              <div className="mt-4 text-sm text-green-600 font-semibold">
                ✓ Express delivery available
              </div>
            </div>

            <div className="text-center bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">100% Secure</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                SSL encrypted payments with buyer protection guarantee
              </p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">SSL Secured</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Verified</span>
              </div>
            </div>

            <div className="text-center bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Quality Assured</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every product verified and quality checked before shipping
              </p>
              <div className="mt-4 text-sm text-purple-600 font-semibold">
                ✓ 30-day return policy
              </div>
            </div>
          </div>

          {/* Additional Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6">
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-sm font-medium text-gray-700">ISO 9001 Certified</span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-sm font-medium text-gray-700">100% Genuine Products</span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-sm font-medium text-gray-700">24/7 Customer Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600">
              Find what you&apos;re looking for in our curated categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Electronics', icon: '📱', slug: 'electronics', color: 'from-blue-500 to-cyan-500' },
              { name: 'Fashion', icon: '👕', slug: 'fashion', color: 'from-pink-500 to-rose-500' },
              { name: 'Home & Garden', icon: '🏠', slug: 'home-garden', color: 'from-green-500 to-emerald-500' },
              { name: 'Sports', icon: '⚽', slug: 'sports', color: 'from-orange-500 to-red-500' },
              { name: 'Books', icon: '📚', slug: 'books', color: 'from-purple-500 to-indigo-500' },
              { name: 'Beauty', icon: '💄', slug: 'beauty', color: 'from-pink-400 to-pink-600' },
              { name: 'Automotive', icon: '🚗', slug: 'automotive', color: 'from-gray-500 to-gray-700' },
              { name: 'Toys', icon: '🧸', slug: 'toys', color: 'from-yellow-400 to-orange-500' },
              { name: 'Health', icon: '💊', slug: 'health', color: 'from-teal-500 to-cyan-500' },
              { name: 'Jewelry', icon: '💍', slug: 'jewelry', color: 'from-yellow-500 to-amber-500' },
              { name: 'Groceries', icon: '🛒', slug: 'groceries', color: 'from-lime-500 to-green-500' },
              { name: 'Pet Supplies', icon: '🐕', slug: 'pet-supplies', color: 'from-brown-500 to-orange-600' },
            ].map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="group"
              >
                <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-full mx-auto mb-4 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-pink-500 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Explore now</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Now Section */}
      <section className="py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center mb-2">
                <TrendingUp className="w-6 h-6 text-pink-500 mr-2" />
                <span className="text-sm font-medium text-pink-500 uppercase tracking-wide">Trending Now</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Popular This Week
              </h2>
            </div>
            <Link href="/trending">
              <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 to-orange-100/20"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-3xl">⚡</span>
                      </div>
                      <span className="text-gray-600 text-sm font-medium">Trending Product {i}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      #{i} Trending
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                    Trending Fashion Item {i}
                  </h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ₹1,999
                    </span>
                    <span className="text-sm text-green-600 font-semibold">
                      30% off
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">(85)</span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="flex items-center mb-2">
                <Award className="w-6 h-6 text-pink-500 mr-2" />
                <span className="text-sm font-medium text-pink-500 uppercase tracking-wide">Editor&apos;s Choice</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600 mt-2">
                Handpicked products from our top vendors
              </p>
            </div>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-pink-100/20"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-3xl">💎</span>
                      </div>
                      <span className="text-gray-600 text-sm font-medium">Featured Product {i}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Featured
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                    Premium Quality Product {i}
                  </h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ₹4,999
                    </span>
                    <span className="text-sm text-green-600 font-semibold">
                      35% off
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">(245)</span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Showcase - Myntra Style */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">FEATURED BRANDS</h2>
            <p className="text-gray-600">Shop from top brands</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center">
            {[
              'Nike', 'Adidas', 'Puma', 'Levi\'s', 'H&M', 'Zara',
              'Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP'
            ].map((brand) => (
              <div key={brand} className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="text-center">
                  <div className="w-12 h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded flex items-center justify-center mb-2">
                    <span className="text-xs font-bold text-gray-600">{brand.charAt(0)}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700">{brand}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Brand - Myntra Style */}
      <section className="py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Brand
            </h2>
            <p className="text-lg text-gray-600">
              Discover your favorite brands and explore their latest collections
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Nike', logo: 'N', color: 'from-orange-500 to-red-500' },
              { name: 'Adidas', logo: 'A', color: 'from-black to-gray-800' },
              { name: 'Puma', logo: 'P', color: 'from-black to-gray-700' },
              { name: 'Levi\'s', logo: 'L', color: 'from-blue-600 to-blue-800' },
              { name: 'H&M', logo: 'H', color: 'from-red-500 to-pink-500' },
              { name: 'Zara', logo: 'Z', color: 'from-black to-gray-600' },
              { name: 'Samsung', logo: 'S', color: 'from-blue-500 to-blue-600' },
              { name: 'Apple', logo: 'A', color: 'from-gray-800 to-black' },
              { name: 'Sony', logo: 'S', color: 'from-blue-600 to-blue-700' },
              { name: 'LG', logo: 'L', color: 'from-red-500 to-red-600' },
              { name: 'Dell', logo: 'D', color: 'from-blue-500 to-blue-700' },
              { name: 'HP', logo: 'H', color: 'from-blue-600 to-indigo-600' },
            ].map((brand) => (
              <Link
                key={brand.name}
                href={`/products?brand=${brand.name.toLowerCase()}`}
                className="group"
              >
                <div className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group-hover:border-pink-200">
                  <div className={`w-16 h-16 bg-gradient-to-r ${brand.color} rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {brand.logo}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors text-sm">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Explore now</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/brands">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                View All Brands
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Innovative Features Showcase */}
      <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Experience the Future of Shopping</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover cutting-edge features that make shopping more immersive, personalized, and enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AR Try-On */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-2">🥽</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AR Try-On</h3>
              <p className="text-gray-600 mb-4">
                Experience products virtually with augmented reality. See how clothes, accessories, and more look on you before buying.
              </p>
              <div className="flex items-center text-sm text-purple-600 font-medium">
                <span>WebXR Compatible</span>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></div>
              </div>
            </div>

            {/* Virtual Styling Room */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
              <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg p-4 mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-2">👗</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Virtual Styling Room</h3>
              <p className="text-gray-600 mb-4">
                Mix and match products from your wishlist. Create perfect outfits virtually and share with friends.
              </p>
              <div className="flex items-center text-sm text-pink-600 font-medium">
                <span>Interactive Design</span>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></div>
              </div>
            </div>

            {/* Voice Shopping */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-4 mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-2">🎤</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Voice Shopping</h3>
              <p className="text-gray-600 mb-4">
                Shop hands-free with advanced voice commands. Search, add to cart, and complete purchases using natural language.
              </p>
              <div className="flex items-center text-sm text-blue-600 font-medium">
                <span>Speech Recognition</span>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></div>
              </div>
            </div>

            {/* Gamification */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-2">🏆</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rewards & Achievements</h3>
              <p className="text-gray-600 mb-4">
                Earn points, unlock badges, and complete challenges. Turn shopping into an exciting game with exclusive rewards.
              </p>
              <div className="flex items-center text-sm text-yellow-600 font-medium">
                <span>Gamified Experience</span>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></div>
              </div>
            </div>

            {/* Social Shopping */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-2">👥</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Social Shopping</h3>
              <p className="text-gray-600 mb-4">
                Share wishlists, collaborate on style choices, and discover products through your social network.
              </p>
              <div className="flex items-center text-sm text-green-600 font-medium">
                <span>Community Driven</span>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></div>
              </div>
            </div>

            {/* Smart Notifications */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4 mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-2">🧠</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Notifications</h3>
              <p className="text-gray-600 mb-4">
                AI-powered alerts for price drops, restocks, and personalized offers based on your shopping behavior.
              </p>
              <div className="flex items-center text-sm text-indigo-600 font-medium">
                <span>AI-Powered</span>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Experience the Future?</h3>
              <p className="text-gray-600 mb-6">
                Join thousands of users already enjoying these innovative shopping features
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 font-semibold">
                  Try AR Try-On
                </Button>
                <Button variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-50 px-8 py-3 font-semibold">
                  Explore All Features
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Recommendations */}
      <Recommendations
        title="Recommended for You"
        type="personalized"
        limit={6}
      />

      {/* Enhanced Social Commerce - Community & Reviews */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Thriving Community</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover what our community loves and share your shopping experiences
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Live Social Feed */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Live Community Feed</h3>
                  <div className="flex items-center text-green-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm font-medium">Live</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Social Post 1 */}
                  <div className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        A
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Anjali K.</div>
                        <div className="text-xs text-gray-500">Just bought • 5 min ago</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">👗</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">Loving this dress! Perfect fit 😍</p>
                        <div className="flex items-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>❤️ 24 likes</span>
                      <span>💬 3 comments</span>
                    </div>
                  </div>

                  {/* Social Post 2 */}
                  <div className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        R
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Rahul S.</div>
                        <div className="text-xs text-gray-500">Reviewed • 12 min ago</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">"Fast delivery and excellent packaging! Will definitely shop again."</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>👍 18 likes</span>
                      <span>📸 2 photos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community Stats */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Community Stats</h3>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-500 mb-2">50,247</div>
                    <div className="text-sm text-gray-600 mb-1">Happy Customers</div>
                    <div className="flex items-center justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Average 4.8/5 rating</div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-500 mb-1">2.3K</div>
                        <div className="text-xs text-gray-600">Reviews This Week</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-500 mb-1">98%</div>
                        <div className="text-xs text-gray-600">Satisfaction Rate</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Top Categories Reviewed</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Fashion</span>
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                            <div className="w-12 h-2 bg-pink-500 rounded-full"></div>
                          </div>
                          <span className="text-gray-700 font-medium">75%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Electronics</span>
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                            <div className="w-10 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                          <span className="text-gray-700 font-medium">62%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Home & Living</span>
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                            <div className="w-8 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-gray-700 font-medium">45%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User-Generated Content Showcase */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Featured Stories</h3>
                  <span className="text-sm text-pink-500 font-medium">View All</span>
                </div>

                <div className="space-y-4">
                  {/* UGC Story 1 */}
                  <div className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        M
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Meera P.</div>
                        <div className="text-xs text-gray-500">Style Inspiration</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">👗</span>
                      </div>
                      <div className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">💄</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">&ldquo;My perfect weekend look! Loving the quality and fit ✨&rdquo;</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>❤️ 156 likes</span>
                      <span>🔗 Shop the look</span>
                    </div>
                  </div>

                  {/* UGC Story 2 */}
                  <div className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        V
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Vikram R.</div>
                        <div className="text-xs text-gray-500">Tech Review</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">&ldquo;This laptop exceeded my expectations! Perfect for work and gaming 🎮&rdquo;</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>👍 89 likes</span>
                      <span>📱 5 photos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your Shopping Story</h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of customers sharing their experiences and inspiring others
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3">
                    <Camera className="h-5 w-5 mr-2" />
                    Share Your Look
                  </Button>
                  <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50 px-6 py-3">
                    <Star className="h-5 w-5 mr-2" />
                    Write a Review
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Newsletter & CTA Section with Interactive Elements */}
      <section className="py-12 bg-gradient-to-r from-pink-500 to-rose-500 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-ping"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold mb-4">
                Get Exclusive Deals & Updates
              </h2>
              <p className="text-pink-100 mb-6">
                Subscribe to our newsletter and be the first to know about new arrivals, exclusive deals, and special offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-6 py-4 text-lg bg-white/95 backdrop-blur-sm border-0 rounded-full text-gray-900 placeholder-gray-600 focus:ring-4 focus:ring-white/30 transition-all duration-300 hover:scale-105"
                />
                <Button
                  onClick={handleNewsletterSubmit}
                  className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-4 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Subscribe
                </Button>
              </div>
            </div>
            <div className="text-center lg:text-right animate-fade-in-up animation-delay-200">
              <h3 className="text-2xl font-bold mb-4">Join Our Community</h3>
              <p className="text-pink-100 mb-6">
                Become a vendor and start selling your products to millions of customers
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
                    Become a Vendor
                  </Button>
                </Link>
                <Link href="/products">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button for Quick Actions */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <button
            className="w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-bounce"
            aria-label="Quick actions"
          >
            <Zap className="h-6 w-6 mx-auto" />
          </button>

          {/* Quick Action Menu */}
          <div className="absolute bottom-full right-0 mb-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-2 space-y-2">
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors">
                <Heart className="h-4 w-4 mr-3" />
                Wishlist
              </button>
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors">
                <ShoppingCart className="h-4 w-4 mr-3" />
                Cart
              </button>
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors">
                <Search className="h-4 w-4 mr-3" />
                Search
              </button>
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors">
                <User className="h-4 w-4 mr-3" />
                Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat Widget */}
      <div className="fixed bottom-6 left-6 z-50">
        {/* Chat Toggle Button */}
        <button
          onClick={handleChatToggle}
          className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
            isChatOpen
              ? 'bg-red-500 text-white'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse-glow'
          }`}
          aria-label={isChatOpen ? "Close chat" : "Open live chat"}
        >
          {isChatOpen ? <X className="h-6 w-6 mx-auto" /> : <MessageCircle className="h-6 w-6 mx-auto" />}
        </button>

        {/* Chat Window */}
        {isChatOpen && (
          <div className="absolute bottom-16 left-0 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col animate-reveal">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Live Support</h3>
                    <p className="text-xs text-pink-100">Online now</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">Online</span>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </main>
    </>
  )
}