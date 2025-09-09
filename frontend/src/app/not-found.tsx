import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
          <div className="w-32 h-32 mx-auto mb-6">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-full h-full text-gray-400"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-sm mx-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search for products..."
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Popular Categories */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/categories/electronics">
              <div className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <span className="text-sm font-medium text-gray-700">Electronics</span>
              </div>
            </Link>
            <Link href="/categories/clothing">
              <div className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <span className="text-sm font-medium text-gray-700">Clothing</span>
              </div>
            </Link>
            <Link href="/categories/home">
              <div className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <span className="text-sm font-medium text-gray-700">Home & Garden</span>
              </div>
            </Link>
            <Link href="/categories/sports">
              <div className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <span className="text-sm font-medium text-gray-700">Sports</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Help Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            Need help? Contact our support team
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/contact" className="text-sm text-blue-600 hover:text-blue-800">
              Contact Support
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/help" className="text-sm text-blue-600 hover:text-blue-800">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}