/**
 * Centralized error logging and reporting utility
 */

class ErrorLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Limit stored errors
  }

  /**
   * Log an error with context
   * @param {Error} error - The error object
   * @param {Object} context - Additional context information
   */
  logError(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Server',
    };

    // Store in memory (in production, send to logging service)
    this.errors.push(errorEntry);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Console logging for development
    console.error('Error logged:', errorEntry);

    // In production, you would send to a logging service like Sentry, LogRocket, etc.
    // Example: Sentry.captureException(error, { extra: context });
  }

  /**
   * Get all logged errors
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Clear all logged errors
   */
  clearErrors() {
    this.errors = [];
  }

  /**
   * Report error to external service (placeholder)
   */
  reportError(error, context) {
    // Placeholder for external error reporting
    // In production, integrate with services like Sentry, Bugsnag, etc.
    console.warn('Error reporting not implemented. Error:', error, 'Context:', context);
  }
}

// Singleton instance
const errorLogger = new ErrorLogger();

export default errorLogger;