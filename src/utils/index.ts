/**
 * Utils Export
 * Central export point for all utility functions
 */

// Validation utilities
export {
  validateTicket,
  transformTicketForApi,
  formatTicketKey,
  parseTicketKey,
  getPriorityColor,
  getStatusColor,
  formatDate,
  formatRelativeTime,
  debounce,
  throttle,
  generateId,
  deepClone,
  isEqual,
  sanitizeHtml,
  escapeHtml,
} from './validation';

// Error handling utilities
export {
  ApiError,
  ValidationError as ValidationErrorClass,
  NetworkError,
  handleApiError,
  handleFetchError,
  handleHttpError,
  retryWithBackoff,
  logError,
  createUserErrorMessage,
  isRetryableError,
  getErrorRecoveryStrategy,
} from './errorHandling';

// Filtering utilities
export { TicketFilterUtils, DEFAULT_FILTER_PRESETS, QUICK_FILTER_GROUPS } from './filtering';

// Bulk operations utilities
export { BulkOperationsUtils, SelectionUtils } from './bulkOperations';

// Keyboard shortcuts utilities
export { KeyboardShortcutManager, createShortcutManager, DEFAULT_JIRA_SHORTCUTS } from './keyboardShortcuts';

// Performance utilities
export { 
  PerformanceMonitor, 
  VirtualScrollManager, 
  CacheManager,
  createPerformanceMonitor,
  createVirtualScrollManager,
  createCacheManager 
} from './performance';
