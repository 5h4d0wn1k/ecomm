'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; retry?: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.handleRetry} />
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error?: Error
  retry?: () => void
}

function DefaultErrorFallback({ error, retry }: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left bg-gray-100 p-4 rounded-lg">
            <summary className="cursor-pointer font-medium text-gray-900 mb-2">
              Error Details (Development)
            </summary>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {retry && (
            <Button onClick={retry} className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

// Hook for handling async errors in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    console.error('Async error:', error, errorInfo)

    // Could dispatch to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo)
    }
  }
}