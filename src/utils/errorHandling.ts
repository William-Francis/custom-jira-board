/**
 * Error handling utilities
 */

import { ApiErrorResponse } from '../types';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public code: string;
  public status?: number;
  public details?: Record<string, unknown>;

  constructor(message: string, code: string = 'API_ERROR', status?: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  public field: string;
  public code: string;

  constructor(field: string, message: string, code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

/**
 * Custom error class for network errors
 */
export class NetworkError extends Error {
  public code: string;

  constructor(message: string, code: string = 'NETWORK_ERROR') {
    super(message);
    this.name = 'NetworkError';
    this.code = code;
  }
}

/**
 * Handle API error responses
 */
export const handleApiError = (error: ApiErrorResponse): ApiError => {
  return new ApiError(
    error.message,
    error.code,
    undefined,
    error.details
  );
};

/**
 * Handle fetch errors
 */
export const handleFetchError = (error: Error): NetworkError => {
  if (error.name === 'AbortError') {
    return new NetworkError('Request was cancelled', 'REQUEST_CANCELLED');
  }
  
  if (error.message.includes('Failed to fetch')) {
    return new NetworkError('Network connection failed', 'NETWORK_CONNECTION_FAILED');
  }
  
  return new NetworkError(error.message, 'FETCH_ERROR');
};

/**
 * Handle HTTP status errors
 */
export const handleHttpError = (status: number, statusText: string): ApiError => {
  const errorMessages: Record<number, string> = {
    400: 'Bad Request - Invalid data provided',
    401: 'Unauthorized - Authentication required',
    403: 'Forbidden - Access denied',
    404: 'Not Found - Resource not found',
    409: 'Conflict - Resource already exists',
    422: 'Unprocessable Entity - Validation failed',
    500: 'Internal Server Error - Server error occurred',
    503: 'Service Unavailable - Service temporarily unavailable',
  };

  const message = errorMessages[status] || `HTTP ${status}: ${statusText}`;
  return new ApiError(message, `HTTP_${status}`, status);
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Don't retry on certain error types
      if (error instanceof ValidationError) {
        throw error; // Don't retry validation errors
      }
      
      if (error instanceof ApiError) {
        if (error.status && error.status >= 400 && error.status < 500) {
          throw error; // Don't retry client errors
        }
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

/**
 * Error boundary error handler
 */
export const logError = (error: Error, errorInfo?: { componentStack: string }): void => {
  console.error('Error caught by error boundary:', error);
  
  if (errorInfo) {
    console.error('Component stack:', errorInfo.componentStack);
  }

  // In production, you might want to send this to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: send to error reporting service
    // errorReportingService.captureException(error, { extra: errorInfo });
  }
};

/**
 * Create error message for user display
 */
export const createUserErrorMessage = (error: Error): string => {
  if (error instanceof ValidationError) {
    return `Validation error: ${error.message}`;
  }
  
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Please log in to continue';
    }
    if (error.status === 403) {
      return 'You do not have permission to perform this action';
    }
    if (error.status === 404) {
      return 'The requested resource was not found';
    }
    if (error.status === 500) {
      return 'A server error occurred. Please try again later';
    }
    return error.message;
  }
  
  if (error instanceof NetworkError) {
    if (error.code === 'NETWORK_CONNECTION_FAILED') {
      return 'Unable to connect to the server. Please check your internet connection';
    }
    if (error.code === 'REQUEST_CANCELLED') {
      return 'Request was cancelled';
    }
    return 'Network error occurred. Please try again';
  }
  
  return 'An unexpected error occurred. Please try again';
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: Error): boolean => {
  if (error instanceof ValidationError) {
    return false;
  }
  
  if (error instanceof ApiError) {
    // Don't retry client errors (4xx)
    if (error.status && error.status >= 400 && error.status < 500) {
      return false;
    }
    // Retry server errors (5xx)
    return error.status ? error.status >= 500 : true;
  }
  
  if (error instanceof NetworkError) {
    return error.code !== 'REQUEST_CANCELLED';
  }
  
  return true;
};

/**
 * Error recovery strategies
 */
export const getErrorRecoveryStrategy = (error: Error): string => {
  if (error instanceof ValidationError) {
    return 'Please check your input and try again';
  }
  
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Please refresh the page and log in again';
    }
    if (error.status === 403) {
      return 'Please contact your administrator for access';
    }
    if (error.status === 404) {
      return 'The resource may have been moved or deleted';
    }
    if (error.status === 500) {
      return 'Please try again in a few minutes';
    }
    return 'Please try again';
  }
  
  if (error instanceof NetworkError) {
    if (error.code === 'NETWORK_CONNECTION_FAILED') {
      return 'Please check your internet connection and try again';
    }
    return 'Please try again';
  }
  
  return 'Please refresh the page and try again';
};
