import { useState, useCallback } from 'react';
import errorLogger from '../errorLogger';

/**
 * Custom hook for consistent error handling across components
 * @param {Object} options - Configuration options
 * @param {Function} options.onRetry - Function to call when retrying
 * @param {string} options.context - Context for error logging
 * @returns {Object} Error handling state and functions
 */
export function useErrorHandler(options = {}) {
  const { onRetry, context = 'Component' } = options;

  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((err, additionalContext = {}) => {
    const errorObj = err instanceof Error ? err : new Error(String(err));

    // Log the error
    errorLogger.logError(errorObj, {
      ...additionalContext,
      context,
      hook: 'useErrorHandler',
    });

    setError(errorObj);
  }, [context]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    clearError();

    try {
      await onRetry();
    } catch (err) {
      handleError(err, { action: 'retry' });
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, clearError, handleError]);

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retry,
    hasError: !!error,
  };
}

/**
 * Hook for handling async operations with error management
 * @param {Function} asyncFn - The async function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} Loading state, error state, and execute function
 */
export function useAsyncErrorHandler(asyncFn, options = {}) {
  const { context = 'AsyncOperation' } = options;
  const [isLoading, setIsLoading] = useState(false);
  const errorHandler = useErrorHandler({ context });

  const execute = useCallback(async (...args) => {
    setIsLoading(true);
    errorHandler.clearError();

    try {
      const result = await asyncFn(...args);
      return result;
    } catch (error) {
      errorHandler.handleError(error, { args });
      throw error; // Re-throw so caller can handle if needed
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn, errorHandler]);

  return {
    execute,
    isLoading,
    ...errorHandler,
  };
}