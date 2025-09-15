'use client'

import ErrorBoundary from './ErrorBoundary';

/**
 * Client-side wrapper component that includes the global ErrorBoundary
 * This allows us to use ErrorBoundary in the server-side root layout
 */
export default function AppWrapper({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}