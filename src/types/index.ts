/**
 * Main type exports
 * This file serves as the central export point for all type definitions
 */

// Core ticket types
export type {
  TicketStatus,
  TicketPriority,
  TicketResolution,
  Ticket,
  Sprint,
  ColumnConfig,
  BoardConfig,
  WorkflowRule,
  BoardFilters,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  ApiError,
  DragContext,
  BaseComponentProps,
  LoadingState,
  ValidationError,
} from './ticket';

// Board-related types
export type {
  BoardState,
  BoardAction,
  BoardContextType,
  BoardProps,
  ColumnProps,
  TicketProps,
  BoardHeaderProps,
  BoardLayoutProps,
} from './board';

// User-related types
export type {
  UserProfile,
  UserRole,
  Permission,
  UserPreferences,
  BoardViewSettings,
  UserSession,
  AuthContextType,
  LoginFormData,
  RegisterFormData,
  UserUpdateData,
} from './user';

// API-related types
export type {
  ApiEndpoint,
  ApiRequestConfig,
  PaginatedApiResponse,
  ApiErrorResponse,
  ApiService,
  TicketApiEndpoints,
  BoardApiEndpoints,
  UserApiEndpoints,
  SprintApiEndpoints,
  ApiConfig,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from './api';

// Re-export User interface from ticket.ts for convenience
export type { User } from './ticket';

// Export HttpStatus enum
export { HttpStatus } from './api';

// Filter-related types
export type {
  TicketFilters,
  TicketSortOptions,
  FilterPreset,
  SearchConfig,
  FilterState,
  FilterAction,
  QuickFilter,
  FilterGroup,
} from './filters';

// Bulk operations types
export type {
  BulkOperationType,
  BulkOperation,
  BulkOperationResult,
  BulkOperationContext,
  BulkSelectionState,
  BulkOperationHandler,
  BulkOperationsConfig,
  BulkMoveParams,
  BulkAssignParams,
  BulkPriorityParams,
  BulkLabelsParams,
  BulkExportParams,
  SelectionMode,
  SelectionStrategy,
} from './bulkOperations';

// Keyboard shortcuts types
export type {
  ShortcutType,
  ShortcutCategory,
  KeyboardShortcut,
  ShortcutContext,
  ShortcutManagerConfig,
  ShortcutEvent,
  ShortcutHelp,
  ShortcutRegistration,
  ShortcutConflict,
} from './keyboardShortcuts';

// Real-time updates and notifications types
export type {
  WebSocketState,
  RealtimeEventType,
  RealtimeEvent,
  WebSocketConfig,
  NotificationType,
  Notification,
  NotificationAction,
  CollaborationState,
  CollaborationUser,
  RealtimeConfig,
  ConflictData,
  RealtimeSubscription,
  NotificationSettings,
  RealtimeStats,
} from './realtime';
