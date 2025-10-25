/**
 * API-related type definitions
 */

import { Ticket, BoardConfig, UserProfile, Sprint } from './index';

/**
 * API endpoint configuration
 */
export interface ApiEndpoint {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  timestamp: string;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: string[];
  code: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

/**
 * HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * API service interface
 */
export interface ApiService {
  get<T>(endpoint: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
  post<T>(endpoint: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
  put<T>(endpoint: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
  patch<T>(endpoint: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
  delete<T>(endpoint: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
}

/**
 * Ticket API endpoints
 */
export interface TicketApiEndpoints {
  getTickets: (boardId: string, params?: Record<string, unknown>) => Promise<ApiResponse<Ticket[]>>;
  getTicket: (ticketId: string) => Promise<ApiResponse<Ticket>>;
  createTicket: (ticket: Partial<Ticket>) => Promise<ApiResponse<Ticket>>;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => Promise<ApiResponse<Ticket>>;
  deleteTicket: (ticketId: string) => Promise<ApiResponse<void>>;
  moveTicket: (ticketId: string, newStatus: string) => Promise<ApiResponse<Ticket>>;
}

/**
 * Board API endpoints
 */
export interface BoardApiEndpoints {
  getBoards: () => Promise<ApiResponse<BoardConfig[]>>;
  getBoard: (boardId: string) => Promise<ApiResponse<BoardConfig>>;
  createBoard: (board: Partial<BoardConfig>) => Promise<ApiResponse<BoardConfig>>;
  updateBoard: (boardId: string, updates: Partial<BoardConfig>) => Promise<ApiResponse<BoardConfig>>;
  deleteBoard: (boardId: string) => Promise<ApiResponse<void>>;
}

/**
 * User API endpoints
 */
export interface UserApiEndpoints {
  getUsers: () => Promise<ApiResponse<UserProfile[]>>;
  getUser: (userId: string) => Promise<ApiResponse<UserProfile>>;
  getCurrentUser: () => Promise<ApiResponse<UserProfile>>;
  updateUser: (userId: string, updates: Partial<UserProfile>) => Promise<ApiResponse<UserProfile>>;
}

/**
 * Sprint API endpoints
 */
export interface SprintApiEndpoints {
  getSprints: (boardId: string) => Promise<ApiResponse<Sprint[]>>;
  getSprint: (sprintId: string) => Promise<ApiResponse<Sprint>>;
  getActiveSprint: (boardId: string) => Promise<ApiResponse<Sprint>>;
  createSprint: (sprint: Partial<Sprint>) => Promise<ApiResponse<Sprint>>;
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => Promise<ApiResponse<Sprint>>;
}

/**
 * API configuration
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers: Record<string, string>;
}

/**
 * Request interceptor
 */
export type RequestInterceptor = (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;

/**
 * Response interceptor
 */
export type ResponseInterceptor = (response: ApiResponse) => ApiResponse | Promise<ApiResponse>;

/**
 * Error interceptor
 */
export type ErrorInterceptor = (error: ApiErrorResponse) => ApiErrorResponse | Promise<ApiErrorResponse>;
