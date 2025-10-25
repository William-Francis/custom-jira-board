/**
 * Core ticket status types
 */
export type TicketStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

/**
 * Ticket priority levels
 */
export type TicketPriority = 'LOWEST' | 'LOW' | 'MEDIUM' | 'HIGH' | 'HIGHEST';

/**
 * Ticket resolution types
 */
export type TicketResolution = 'DONE' | 'WONTFIX' | 'DUPLICATE' | 'INVALID';

/**
 * User information interface
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  displayName: string;
}

/**
 * Core ticket interface representing a Jira ticket
 */
export interface Ticket {
  id: string;
  key: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee?: User;
  reporter: User;
  created: Date;
  updated: Date;
  resolution?: TicketResolution;
  labels?: string[];
  storyPoints?: number;
  epic?: string;
  sprint?: Sprint;
}

/**
 * Sprint information
 */
export interface Sprint {
  id: string;
  name: string;
  state: 'FUTURE' | 'ACTIVE' | 'CLOSED';
  startDate?: Date;
  endDate?: Date;
  goal?: string;
}

/**
 * Board column configuration
 */
export interface ColumnConfig {
  id: string;
  name: string;
  status: TicketStatus;
  order: number;
  color?: string;
  wipLimit?: number;
}

/**
 * Board configuration interface
 */
export interface BoardConfig {
  id: string;
  name: string;
  columns: ColumnConfig[];
  workflow: WorkflowRule[];
  description?: string;
}

/**
 * Workflow rule for status transitions
 */
export interface WorkflowRule {
  from: TicketStatus;
  to: TicketStatus;
  autoResolve?: boolean;
  requiredFields?: string[];
}

/**
 * Board filters interface
 */
export interface BoardFilters {
  assignee?: string;
  priority?: TicketPriority[];
  labels?: string[];
  epic?: string;
  sprint?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Error types for API responses
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Drag and drop context types
 */
export interface DragContext {
  draggedTicket: Ticket | null;
  dragOverColumn: string | null;
  isDragging: boolean;
}

/**
 * Component prop types
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

/**
 * Loading state interface
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Form validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}
