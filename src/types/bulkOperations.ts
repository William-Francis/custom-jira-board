/**
 * Bulk operations types for ticket management
 */

import { Ticket, TicketStatus, TicketPriority } from './ticket';

/**
 * Bulk operation types
 */
export type BulkOperationType = 
  | 'move'
  | 'assign'
  | 'priority'
  | 'labels'
  | 'delete'
  | 'archive'
  | 'export'
  | 'duplicate';

/**
 * Bulk operation configuration
 */
export interface BulkOperation {
  id: string;
  type: BulkOperationType;
  label: string;
  description?: string;
  icon?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  isDestructive?: boolean;
  isDisabled?: (selectedTickets: Ticket[]) => boolean;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  operationId: string;
  successCount: number;
  errorCount: number;
  totalCount: number;
  errors: Array<{
    ticketId: string;
    ticketKey: string;
    error: string;
  }>;
  successTicketIds: string[];
}

/**
 * Bulk operation context
 */
export interface BulkOperationContext {
  selectedTickets: Ticket[];
  operation: BulkOperation;
  parameters: Record<string, any>;
}

/**
 * Bulk selection state
 */
export interface BulkSelectionState {
  selectedTicketIds: Set<string>;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  totalCount: number;
  selectedCount: number;
}

/**
 * Bulk operation parameters
 */
export interface BulkMoveParams {
  targetStatus: TicketStatus;
  targetColumn?: string;
}

export interface BulkAssignParams {
  assigneeId: string;
  assigneeName: string;
}

export interface BulkPriorityParams {
  priority: TicketPriority;
}

export interface BulkLabelsParams {
  action: 'add' | 'remove' | 'replace';
  labels: string[];
}

export interface BulkExportParams {
  format: 'csv' | 'json' | 'excel';
  includeFields: string[];
}

/**
 * Bulk operation handler
 */
export interface BulkOperationHandler {
  canExecute: (tickets: Ticket[], params: any) => boolean;
  execute: (tickets: Ticket[], params: any) => Promise<BulkOperationResult>;
  validate: (tickets: Ticket[], params: any) => string[];
}

/**
 * Bulk operations configuration
 */
export interface BulkOperationsConfig {
  enableSelection: boolean;
  enableKeyboardShortcuts: boolean;
  enableDragSelection: boolean;
  maxSelectionCount?: number;
  operations: BulkOperation[];
  onOperationComplete: (result: BulkOperationResult) => void;
  onSelectionChange: (state: BulkSelectionState) => void;
}

/**
 * Selection mode
 */
export type SelectionMode = 'none' | 'single' | 'multiple' | 'all';

/**
 * Selection strategy
 */
export interface SelectionStrategy {
  mode: SelectionMode;
  allowDeselect: boolean;
  requireConfirmation: boolean;
  maxSelections?: number;
}
