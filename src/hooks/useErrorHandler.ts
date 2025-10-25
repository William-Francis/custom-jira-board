/**
 * Custom hook for centralized error handling
 * Provides consistent error handling across the application
 */

import { useState, useCallback } from 'react';
import { createUserErrorMessage, getErrorRecoveryStrategy, logError } from '../utils';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error context information
 */
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: Date;
  additionalData?: Record<string, unknown>;
}

/**
 * Error information
 */
export interface ErrorInfo {
  id: string;
  message: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  recoveryStrategy: string;
  timestamp: Date;
  resolved: boolean;
}

/**
 * Hook return type
 */
export interface UseErrorHandlerReturn {
  errors: ErrorInfo[];
  addError: (error: Error, context?: ErrorContext, severity?: ErrorSeverity) => string;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  resolveError: (errorId: string) => void;
  getErrorById: (errorId: string) => ErrorInfo | undefined;
  hasErrors: boolean;
  hasCriticalErrors: boolean;
}

/**
 * Hook configuration
 */
export interface UseErrorHandlerConfig {
  maxErrors?: number;
  autoResolveAfter?: number; // milliseconds
  onError?: (error: ErrorInfo) => void;
  onCriticalError?: (error: ErrorInfo) => void;
}

/**
 * Custom hook for error handling
 */
export const useErrorHandler = (config: UseErrorHandlerConfig = {}): UseErrorHandlerReturn => {
  const { 
    maxErrors = 10, 
    autoResolveAfter = 30000, // 30 seconds
    onError, 
    onCriticalError 
  } = config;
  
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  /**
   * Generate unique error ID
   */
  const generateErrorId = useCallback((): string => {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Determine error severity based on error type
   */
  const determineSeverity = useCallback((error: Error): ErrorSeverity => {
    if (error.name === 'NetworkError') {
      return 'medium';
    }
    
    if (error.name === 'ValidationError') {
      return 'low';
    }
    
    if (error.name === 'ApiError') {
      const apiError = error as any;
      if (apiError.status >= 500) {
        return 'high';
      }
      if (apiError.status >= 400) {
        return 'medium';
      }
    }
    
    return 'medium';
  }, []);

  /**
   * Add a new error
   */
  const addError = useCallback((
    error: Error, 
    context: ErrorContext = {}, 
    severity?: ErrorSeverity
  ): string => {
    const errorId = generateErrorId();
    const errorSeverity = severity || determineSeverity(error);
    const userMessage = createUserErrorMessage(error);
    const recoveryStrategy = getErrorRecoveryStrategy(error);
    
    const errorInfo: ErrorInfo = {
      id: errorId,
      message: userMessage,
      severity: errorSeverity,
      context: {
        ...context,
        timestamp: new Date(),
      },
      recoveryStrategy,
      timestamp: new Date(),
      resolved: false,
    };

    setErrors(prevErrors => {
      const newErrors = [errorInfo, ...prevErrors];
      
      // Limit the number of errors
      if (newErrors.length > maxErrors) {
        return newErrors.slice(0, maxErrors);
      }
      
      return newErrors;
    });

    // Log error for debugging
    logError(error, { componentStack: context.component || 'Unknown' });

    // Call appropriate callback
    if (errorSeverity === 'critical') {
      onCriticalError?.(errorInfo);
    } else {
      onError?.(errorInfo);
    }

    // Auto-resolve non-critical errors after timeout
    if (errorSeverity !== 'critical' && autoResolveAfter > 0) {
      setTimeout(() => {
        resolveError(errorId);
      }, autoResolveAfter);
    }

    return errorId;
  }, [generateErrorId, determineSeverity, maxErrors, autoResolveAfter, onError, onCriticalError]);

  /**
   * Remove an error
   */
  const removeError = useCallback((errorId: string) => {
    setErrors(prevErrors => prevErrors.filter(error => error.id !== errorId));
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  /**
   * Resolve an error (mark as resolved but keep in list)
   */
  const resolveError = useCallback((errorId: string) => {
    setErrors(prevErrors => 
      prevErrors.map(error => 
        error.id === errorId ? { ...error, resolved: true } : error
      )
    );
  }, []);

  /**
   * Get error by ID
   */
  const getErrorById = useCallback((errorId: string): ErrorInfo | undefined => {
    return errors.find(error => error.id === errorId);
  }, [errors]);

  /**
   * Check if there are any errors
   */
  const hasErrors = errors.length > 0;

  /**
   * Check if there are any critical errors
   */
  const hasCriticalErrors = errors.some(error => error.severity === 'critical' && !error.resolved);

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    resolveError,
    getErrorById,
    hasErrors,
    hasCriticalErrors,
  };
};
