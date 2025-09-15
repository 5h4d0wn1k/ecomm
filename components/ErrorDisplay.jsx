'use client'

import React from 'react';

/**
 * Component for displaying errors with retry functionality
 * Used for inline error handling within components
 */
export default function ErrorDisplay({
  error,
  onRetry,
  isRetrying = false,
  title = 'Something went wrong',
  message = 'An error occurred while loading this content.',
  showDetails = false,
  className = '',
}) {
  if (!error) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-1 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="bg-red-100 hover:bg-red-200 disabled:bg-red-50 disabled:cursor-not-allowed text-red-800 px-3 py-1.5 rounded-md text-sm font-medium transition duration-200 flex items-center gap-2"
              >
                {isRetrying ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </button>
            </div>
          )}
          {showDetails && process.env.NODE_ENV === 'development' && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-red-600 hover:text-red-800">
                Error Details
              </summary>
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-24">
                {error.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}