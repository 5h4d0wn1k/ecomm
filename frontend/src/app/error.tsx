'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Something went wrong
            </CardTitle>
            <CardDescription className="text-gray-600">
              We're sorry, but something unexpected happened. Our team has been notified and is working to fix the issue.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">Error Details:</p>
                <p className="text-xs text-gray-700 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-gray-600 mt-2">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={reset}
                className="w-full"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </Link>
            </div>

            {/* Help Section */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                If this problem persists, please contact our support team
              </p>
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>

            {/* What you can try */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                What you can try:
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Refresh the page</li>
                <li>• Clear your browser cache</li>
                <li>• Try again in a few minutes</li>
                <li>• Contact support if the issue continues</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Error ID: {error.digest || 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  )
}