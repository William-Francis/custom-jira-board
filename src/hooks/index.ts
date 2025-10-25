/**
 * Hooks Export
 * Central export point for all custom hooks
 */

// Ticket management hook
export { useTickets } from './useTickets';
export type { UseTicketsReturn, UseTicketsConfig } from './useTickets';

// Board state management hook
export { useBoardState } from './useBoardState';
export type { UseBoardStateReturn, UseBoardStateConfig } from './useBoardState';

// API interaction hook
export { useApi } from './useApi';
export type { UseApiReturn, UseApiConfig } from './useApi';

// Error handling hook
export { useErrorHandler } from './useErrorHandler';
export type { 
  UseErrorHandlerReturn, 
  UseErrorHandlerConfig, 
  ErrorSeverity, 
  ErrorContext, 
  ErrorInfo 
} from './useErrorHandler';

// Drag and drop hook
export { useDragDrop } from './useDragDrop';
export type { UseDragDropConfig, UseDragDropReturn } from './useDragDrop';

// Filter management hook
export { useFilters } from './useFilters';
export type { UseFiltersConfig, UseFiltersReturn } from './useFilters';

// Bulk operations hook
export { useBulkOperations } from './useBulkOperations';
export type { UseBulkOperationsConfig, UseBulkOperationsReturn } from './useBulkOperations';

// Keyboard shortcuts hook
export { useKeyboardShortcuts, useKeyboardActions, useShortcutHelp } from './useKeyboardShortcuts';
export type { UseKeyboardShortcutsConfig, UseKeyboardShortcutsReturn } from './useKeyboardShortcuts';

// Real-time updates hook
export { useRealtime } from './useRealtime';
export type { UseRealtimeConfig, UseRealtimeReturn } from './useRealtime';

// Performance monitoring hook
export { 
  usePerformance, 
  useVirtualScroll, 
  useCache, 
  usePerformanceOptimization 
} from './usePerformance';
export type { 
  UsePerformanceConfig, 
  UsePerformanceReturn,
  UseVirtualScrollConfig,
  UseVirtualScrollReturn,
  UseCacheConfig,
  UseCacheReturn,
  UsePerformanceOptimizationReturn
} from './usePerformance';
