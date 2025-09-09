'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  location: string
  rating: number
  comment: string
  avatar: string
  product: string
}

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Priya Sharma",
      location: "Mumbai, Maharashtra",
      rating: 5,
      comment: "Amazing quality products and super fast delivery! I've been shopping here for over a year and never been disappointed. The customer service is excellent too.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      product: "Fashion Collection"
    },
    {
      id: 2,
      name: "Rahul Kumar",
      location: "Delhi, NCR",
      rating: 5,
      comment: "Found exactly what I was looking for at great prices. The multi-vendor platform gives so many options to choose from. Highly recommended!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      product: "Electronics"
    },
    {
      id: 3,
      name: "Anjali Patel",
      location: "Ahmedabad, Gujarat",
      rating: 5,
      comment: "Love the variety and the ease of shopping. The website is so user-friendly and the return policy is hassle-free. Will definitely shop again!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      product: "Home & Living"
    },
    {
      id: 4,
      name: "Vikram Singh",
      location: "Bangalore, Karnataka",
      rating: 5,
      comment: "Great platform for both buyers and sellers. Quality products, fair prices, and excellent service. The vendor verification gives me confidence.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      product: "Sports Equipment"
    },
    {
      id: 5,
      name: "Sneha Gupta",
      location: "Pune, Maharashtra",
      rating: 5,
      comment: "The best online shopping experience I've had! Beautiful products, amazing customer support, and lightning-fast delivery. Five stars!",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      product: "Beauty Products"
    },
    {
      id: 6,
      name: "Arjun Reddy",
      location: "Hyderabad, Telangana",
      rating: 5,
      comment: "Impressed by the quality and authenticity of products. The platform's commitment to verified vendors is commendable. Keep up the great work!",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      product: "Books & Stationery"
    }
  ]

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const prevTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [testimonials.length])

  const goToTestimonial = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(nextTestimonial, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlaying, nextTestimonial])

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Quote className="w-8 h-8 text-pink-500 mr-2" />
            <span className="text-sm font-medium text-pink-500 uppercase tracking-wide">Customer Reviews</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what thousands of satisfied customers have to say about their shopping experience.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>

            <div className="relative z-10">
              {/* Rating Stars */}
              <div className="flex items-center justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < currentTestimonial.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {currentTestimonial.rating}.0
                </span>
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-center mb-8">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 italic">
                  "{currentTestimonial.comment}"
                </p>
              </blockquote>

              {/* Customer Info */}
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="flex items-center space-x-4">
                  <Image
                    src={currentTestimonial.avatar}
                    alt={`${currentTestimonial.name} avatar`}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border-4 border-pink-100"
                  />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {currentTestimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {currentTestimonial.location}
                    </p>
                    <p className="text-xs text-pink-600 font-medium">
                      Purchased: {currentTestimonial.product}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-200 hover:scale-110"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={nextTestimonial}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-200 hover:scale-110"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Testimonial Indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-pink-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-pink-500 mb-2">50K+</div>
            <div className="text-sm text-gray-600">Happy Customers</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-500 mb-2">10K+</div>
            <div className="text-sm text-gray-600">Products Sold</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-green-500 mb-2">500+</div>
            <div className="text-sm text-gray-600">Verified Vendors</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-purple-500 mb-2">4.8★</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  )
}