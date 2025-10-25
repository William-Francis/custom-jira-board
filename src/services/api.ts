/**
 * API service layer for handling HTTP requests
 * Provides a consistent interface for all API interactions
 */

import { ApiRequestConfig, ApiResponse, ApiErrorResponse } from '../types';
import { envConfig } from '../config';

/**
 * API configuration
 */
interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers: Record<string, string>;
}

/**
 * Default API configuration
 */
const defaultConfig: ApiConfig = {
  baseUrl: envConfig.apiBaseUrl,
  timeout: envConfig.apiTimeout,
  retryAttempts: envConfig.apiRetryAttempts,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * API service class for handling HTTP requests
 */
class ApiService {
  private config: ApiConfig;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Make an HTTP request
   */
  private async makeRequest<T>(
    endpoint: string,
    config: Partial<ApiRequestConfig> = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      data,
      params,
      headers = {},
      timeout = this.config.timeout,
    } = config;

    const url = new URL(endpoint, this.config.baseUrl);
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const requestConfig: RequestInit = {
      method,
      headers: {
        ...this.config.headers,
        ...headers,
      },
      signal: AbortSignal.timeout(timeout),
    };

    // Add body for non-GET requests
    if (data && method !== 'GET') {
      requestConfig.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url.toString(), requestConfig);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      return {
        data: responseData,
        success: true,
        message: 'Request completed successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        data: null as T,
        success: false,
        message: errorMessage,
        errors: [errorMessage],
      };
    }
  }

  /**
   * Retry mechanism for failed requests
   */
  private async retryRequest<T>(
    endpoint: string,
    config: Partial<ApiRequestConfig>,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    const result = await this.makeRequest<T>(endpoint, config);
    
    if (result.success || attempt >= this.config.retryAttempts) {
      return result;
    }

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
    
    return this.retryRequest<T>(endpoint, config, attempt + 1);
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(endpoint, { ...config, method: 'POST', data });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(endpoint, { ...config, method: 'PUT', data });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(endpoint, { ...config, method: 'PATCH', data });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiConfig {
    return { ...this.config };
  }
}

/**
 * Create API service instance
 */
export const apiService = new ApiService();

/**
 * Export the ApiService class for custom instances
 */
export { ApiService };

/**
 * Utility function to handle API responses
 */
export const handleApiResponse = <T>(response: ApiResponse<T>): T => {
  if (!response.success) {
    throw new Error(response.message || 'API request failed');
  }
  return response.data;
};

/**
 * Utility function to create error responses
 */
export const createErrorResponse = (message: string, code: string = 'API_ERROR'): ApiErrorResponse => {
  return {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
    errors: [message],
  };
};
