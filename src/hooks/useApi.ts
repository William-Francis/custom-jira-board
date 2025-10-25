/**
 * Custom hook for API interactions with error handling and retry logic
 * Provides a consistent interface for API calls with built-in error handling
 */

import { useState, useCallback } from 'react';
import { ApiRequestConfig } from '../types';
import { apiService, handleApiResponse } from '../services';
import { createUserErrorMessage, retryWithBackoff } from '../utils';

/**
 * Hook return type
 */
export interface UseApiReturn {
  loading: boolean;
  error: string | null;
  execute: <T>(config: ApiRequestConfig) => Promise<T>;
  get: <T>(endpoint: string, config?: Partial<ApiRequestConfig>) => Promise<T>;
  post: <T>(endpoint: string, data?: unknown, config?: Partial<ApiRequestConfig>) => Promise<T>;
  put: <T>(endpoint: string, data?: unknown, config?: Partial<ApiRequestConfig>) => Promise<T>;
  patch: <T>(endpoint: string, data?: unknown, config?: Partial<ApiRequestConfig>) => Promise<T>;
  delete: <T>(endpoint: string, config?: Partial<ApiRequestConfig>) => Promise<T>;
  clearError: () => void;
}

/**
 * Hook configuration
 */
export interface UseApiConfig {
  retryAttempts?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onSuccess?: (message: string) => void;
}

/**
 * Custom hook for API interactions
 */
export const useApi = (config: UseApiConfig = {}): UseApiReturn => {
  const { retryAttempts = 3, retryDelay = 1000, onError, onSuccess } = config;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Execute API request with retry logic
   */
  const execute = useCallback(async <T>(requestConfig: ApiRequestConfig): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const result = await retryWithBackoff(
        async () => {
          const response = await apiService.get<T>(requestConfig.endpoint, requestConfig);
          return handleApiResponse(response);
        },
        retryAttempts,
        retryDelay
      );

      setLoading(false);
      onSuccess?.('Request completed successfully');
      return result;
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setError(errorMessage);
      setLoading(false);
      onError?.(error as Error);
      throw error;
    }
  }, [retryAttempts, retryDelay, onError, onSuccess]);

  /**
   * GET request
   */
  const get = useCallback(async <T>(endpoint: string, requestConfig?: Partial<ApiRequestConfig>): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.get<T>(endpoint, requestConfig);
      const result = handleApiResponse(response);
      setLoading(false);
      onSuccess?.('GET request completed successfully');
      return result;
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setError(errorMessage);
      setLoading(false);
      onError?.(error as Error);
      throw error;
    }
  }, [onError, onSuccess]);

  /**
   * POST request
   */
  const post = useCallback(async <T>(endpoint: string, data?: unknown, requestConfig?: Partial<ApiRequestConfig>): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.post<T>(endpoint, data, requestConfig);
      const result = handleApiResponse(response);
      setLoading(false);
      onSuccess?.('POST request completed successfully');
      return result;
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setError(errorMessage);
      setLoading(false);
      onError?.(error as Error);
      throw error;
    }
  }, [onError, onSuccess]);

  /**
   * PUT request
   */
  const put = useCallback(async <T>(endpoint: string, data?: unknown, requestConfig?: Partial<ApiRequestConfig>): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.put<T>(endpoint, data, requestConfig);
      const result = handleApiResponse(response);
      setLoading(false);
      onSuccess?.('PUT request completed successfully');
      return result;
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setError(errorMessage);
      setLoading(false);
      onError?.(error as Error);
      throw error;
    }
  }, [onError, onSuccess]);

  /**
   * PATCH request
   */
  const patch = useCallback(async <T>(endpoint: string, data?: unknown, requestConfig?: Partial<ApiRequestConfig>): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.patch<T>(endpoint, data, requestConfig);
      const result = handleApiResponse(response);
      setLoading(false);
      onSuccess?.('PATCH request completed successfully');
      return result;
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setError(errorMessage);
      setLoading(false);
      onError?.(error as Error);
      throw error;
    }
  }, [onError, onSuccess]);

  /**
   * DELETE request
   */
  const deleteRequest = useCallback(async <T>(endpoint: string, requestConfig?: Partial<ApiRequestConfig>): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.delete<T>(endpoint, requestConfig);
      const result = handleApiResponse(response);
      setLoading(false);
      onSuccess?.('DELETE request completed successfully');
      return result;
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setError(errorMessage);
      setLoading(false);
      onError?.(error as Error);
      throw error;
    }
  }, [onError, onSuccess]);

  return {
    loading,
    error,
    execute,
    get,
    post,
    put,
    patch,
    delete: deleteRequest,
    clearError,
  };
};
