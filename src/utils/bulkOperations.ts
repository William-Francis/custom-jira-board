/**
 * Bulk operations utilities for ticket management
 * Provides comprehensive bulk operation capabilities
 */

import { 
  Ticket, 
  BulkOperation, 
  BulkOperationResult, 
  BulkSelectionState,
  BulkMoveParams,
  BulkAssignParams,
  BulkPriorityParams,
  BulkLabelsParams,
  BulkExportParams
} from '../types';

/**
 * Bulk operations utility class
 */
export class BulkOperationsUtils {
  /**
   * Get default bulk operations
   */
  static getDefaultOperations(): BulkOperation[] {
    return [
      {
        id: 'move',
        type: 'move',
        label: 'Move Tickets',
        description: 'Move selected tickets to a different status',
        icon: '↔️',
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to move the selected tickets?',
      },
      {
        id: 'assign',
        type: 'assign',
        label: 'Assign Tickets',
        description: 'Assign selected tickets to a user',
        icon: '👤',
        requiresConfirmation: false,
      },
      {
        id: 'priority',
        type: 'priority',
        label: 'Change Priority',
        description: 'Change priority of selected tickets',
        icon: '⚡',
        requiresConfirmation: false,
      },
      {
        id: 'labels',
        type: 'labels',
        label: 'Manage Labels',
        description: 'Add, remove, or replace labels on selected tickets',
        icon: '🏷️',
        requiresConfirmation: false,
      },
      {
        id: 'delete',
        type: 'delete',
        label: 'Delete Tickets',
        description: 'Permanently delete selected tickets',
        icon: '🗑️',
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to delete the selected tickets? This action cannot be undone.',
        isDestructive: true,
        isDisabled: (tickets) => tickets.length === 0,
      },
      {
        id: 'export',
        type: 'export',
        label: 'Export Tickets',
        description: 'Export selected tickets to CSV, JSON, or Excel',
        icon: '📤',
        requiresConfirmation: false,
      },
    ];
  }

  /**
   * Create bulk operation result
   */
  static createResult(
    operationId: string,
    tickets: Ticket[],
    successIds: string[],
    errors: Array<{ ticketId: string; ticketKey: string; error: string }>
  ): BulkOperationResult {
    return {
      operationId,
      successCount: successIds.length,
      errorCount: errors.length,
      totalCount: tickets.length,
      errors,
      successTicketIds: successIds,
    };
  }

  /**
   * Validate bulk operation parameters
   */
  static validateOperation(
    operation: BulkOperation,
    tickets: Ticket[],
    params: any
  ): string[] {
    const errors: string[] = [];

    if (tickets.length === 0) {
      errors.push('No tickets selected');
      return errors;
    }

    switch (operation.type) {
      case 'move':
        const moveParams = params as BulkMoveParams;
        if (!moveParams?.targetStatus) {
          errors.push('Target status is required');
        }
        break;

      case 'assign':
        const assignParams = params as BulkAssignParams;
        if (!assignParams?.assigneeId) {
          errors.push('Assignee is required');
        }
        break;

      case 'priority':
        const priorityParams = params as BulkPriorityParams;
        if (!priorityParams?.priority) {
          errors.push('Priority is required');
        }
        break;

      case 'labels':
        const labelsParams = params as BulkLabelsParams;
        if (!labelsParams?.action || !labelsParams?.labels) {
          errors.push('Labels action and labels are required');
        }
        break;

      case 'delete':
        // Additional validation for delete operation
        const hasInProgressTickets = tickets.some(t => t.status === 'IN_PROGRESS');
        if (hasInProgressTickets) {
          errors.push('Cannot delete tickets that are in progress');
        }
        break;

      case 'export':
        const exportParams = params as BulkExportParams;
        if (!exportParams?.format) {
          errors.push('Export format is required');
        }
        break;
    }

    return errors;
  }

  /**
   * Check if operation can be executed
   */
  static canExecuteOperation(
    operation: BulkOperation,
    tickets: Ticket[]
  ): boolean {
    if (operation.isDisabled && operation.isDisabled(tickets)) {
      return false;
    }

    if (tickets.length === 0) {
      return false;
    }

    // Additional checks based on operation type
    switch (operation.type) {
      case 'move':
        // Can't move tickets that are already in the target status
        return true;

      case 'assign':
        // Can assign any tickets
        return true;

      case 'priority':
        // Can change priority of any tickets
        return true;

      case 'labels':
        // Can manage labels on any tickets
        return true;

      case 'delete':
        // Can't delete tickets that are in progress
        return !tickets.some(t => t.status === 'IN_PROGRESS');

      case 'export':
        // Can export any tickets
        return true;

      default:
        return true;
    }
  }

  /**
   * Get operation confirmation message
   */
  static getConfirmationMessage(
    operation: BulkOperation,
    tickets: Ticket[],
    params: any
  ): string {
    if (operation.confirmationMessage) {
      return operation.confirmationMessage;
    }

    const count = tickets.length;
    const ticketText = count === 1 ? 'ticket' : 'tickets';

    switch (operation.type) {
      case 'move':
        const moveParams = params as BulkMoveParams;
        return `Move ${count} ${ticketText} to ${moveParams.targetStatus}?`;

      case 'assign':
        const assignParams = params as BulkAssignParams;
        return `Assign ${count} ${ticketText} to ${assignParams.assigneeName}?`;

      case 'priority':
        const priorityParams = params as BulkPriorityParams;
        return `Change priority of ${count} ${ticketText} to ${priorityParams.priority}?`;

      case 'labels':
        const labelsParams = params as BulkLabelsParams;
        return `${labelsParams.action} labels on ${count} ${ticketText}?`;

      case 'delete':
        return `Delete ${count} ${ticketText}? This action cannot be undone.`;

      case 'export':
        const exportParams = params as BulkExportParams;
        return `Export ${count} ${ticketText} as ${exportParams.format.toUpperCase()}?`;

      default:
        return `Execute ${operation.label} on ${count} ${ticketText}?`;
    }
  }

  /**
   * Generate operation summary
   */
  static getOperationSummary(
    operation: BulkOperation,
    tickets: Ticket[],
    params: any
  ): string {
    const count = tickets.length;
    const ticketText = count === 1 ? 'ticket' : 'tickets';

    switch (operation.type) {
      case 'move':
        const moveParams = params as BulkMoveParams;
        return `Moving ${count} ${ticketText} to ${moveParams.targetStatus}`;

      case 'assign':
        const assignParams = params as BulkAssignParams;
        return `Assigning ${count} ${ticketText} to ${assignParams.assigneeName}`;

      case 'priority':
        const priorityParams = params as BulkPriorityParams;
        return `Changing priority of ${count} ${ticketText} to ${priorityParams.priority}`;

      case 'labels':
        const labelsParams = params as BulkLabelsParams;
        return `${labelsParams.action} labels on ${count} ${ticketText}`;

      case 'delete':
        return `Deleting ${count} ${ticketText}`;

      case 'export':
        const exportParams = params as BulkExportParams;
        return `Exporting ${count} ${ticketText} as ${exportParams.format.toUpperCase()}`;

      default:
        return `${operation.label} on ${count} ${ticketText}`;
    }
  }

  /**
   * Export tickets to different formats
   */
  static exportTickets(tickets: Ticket[], params: BulkExportParams): string {
    const { format, includeFields } = params;

    switch (format) {
      case 'csv':
        return this.exportToCSV(tickets, includeFields);
      case 'json':
        return this.exportToJSON(tickets, includeFields);
      case 'excel':
        return this.exportToExcel(tickets, includeFields);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export to CSV format
   */
  private static exportToCSV(tickets: Ticket[], fields: string[]): string {
    const headers = fields.map(field => field.charAt(0).toUpperCase() + field.slice(1));
    const rows = tickets.map(ticket => 
      fields.map(field => {
        const value = this.getTicketFieldValue(ticket, field);
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      })
    );

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Export to JSON format
   */
  private static exportToJSON(tickets: Ticket[], fields: string[]): string {
    const data = tickets.map(ticket => {
      const obj: any = {};
      fields.forEach(field => {
        obj[field] = this.getTicketFieldValue(ticket, field);
      });
      return obj;
    });

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export to Excel format (simplified CSV for now)
   */
  private static exportToExcel(tickets: Ticket[], fields: string[]): string {
    // For now, return CSV format. In a real implementation, you'd use a library like xlsx
    return this.exportToCSV(tickets, fields);
  }

  /**
   * Get ticket field value for export
   */
  private static getTicketFieldValue(ticket: Ticket, field: string): any {
    switch (field) {
      case 'id':
        return ticket.id;
      case 'key':
        return ticket.key;
      case 'title':
        return ticket.title;
      case 'description':
        return ticket.description || '';
      case 'status':
        return ticket.status;
      case 'priority':
        return ticket.priority;
      case 'assignee':
        return ticket.assignee?.displayName || '';
      case 'reporter':
        return ticket.reporter.displayName;
      case 'labels':
        return ticket.labels?.join(', ') || '';
      case 'storyPoints':
        return ticket.storyPoints || '';
      case 'created':
        return ticket.created.toISOString();
      case 'updated':
        return ticket.updated.toISOString();
      default:
        return '';
    }
  }

  /**
   * Get available export fields
   */
  static getExportFields(): Array<{ key: string; label: string; description: string }> {
    return [
      { key: 'id', label: 'ID', description: 'Ticket ID' },
      { key: 'key', label: 'Key', description: 'Ticket Key' },
      { key: 'title', label: 'Title', description: 'Ticket Title' },
      { key: 'description', label: 'Description', description: 'Ticket Description' },
      { key: 'status', label: 'Status', description: 'Current Status' },
      { key: 'priority', label: 'Priority', description: 'Priority Level' },
      { key: 'assignee', label: 'Assignee', description: 'Assigned User' },
      { key: 'reporter', label: 'Reporter', description: 'Ticket Reporter' },
      { key: 'labels', label: 'Labels', description: 'Ticket Labels' },
      { key: 'storyPoints', label: 'Story Points', description: 'Story Points' },
      { key: 'created', label: 'Created', description: 'Creation Date' },
      { key: 'updated', label: 'Updated', description: 'Last Updated' },
    ];
  }

  /**
   * Get default export fields
   */
  static getDefaultExportFields(): string[] {
    return ['key', 'title', 'status', 'priority', 'assignee', 'labels', 'storyPoints'];
  }
}

/**
 * Selection utilities
 */
export class SelectionUtils {
  /**
   * Create initial selection state
   */
  static createInitialState(totalCount: number): BulkSelectionState {
    return {
      selectedTicketIds: new Set(),
      isAllSelected: false,
      isPartiallySelected: false,
      totalCount,
      selectedCount: 0,
    };
  }

  /**
   * Update selection state
   */
  static updateSelectionState(
    state: BulkSelectionState,
    selectedIds: Set<string>
  ): BulkSelectionState {
    const selectedCount = selectedIds.size;
    const isAllSelected = selectedCount === state.totalCount && state.totalCount > 0;
    const isPartiallySelected = selectedCount > 0 && selectedCount < state.totalCount;

    return {
      ...state,
      selectedTicketIds: selectedIds,
      selectedCount,
      isAllSelected,
      isPartiallySelected,
    };
  }

  /**
   * Select all tickets
   */
  static selectAll(ticketIds: string[]): Set<string> {
    return new Set(ticketIds);
  }

  /**
   * Deselect all tickets
   */
  static deselectAll(): Set<string> {
    return new Set();
  }

  /**
   * Toggle ticket selection
   */
  static toggleSelection(
    currentSelection: Set<string>,
    ticketId: string
  ): Set<string> {
    const newSelection = new Set(currentSelection);
    if (newSelection.has(ticketId)) {
      newSelection.delete(ticketId);
    } else {
      newSelection.add(ticketId);
    }
    return newSelection;
  }

  /**
   * Select range of tickets
   */
  static selectRange(
    currentSelection: Set<string>,
    ticketIds: string[],
    startIndex: number,
    endIndex: number
  ): Set<string> {
    const newSelection = new Set(currentSelection);
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);

    for (let i = start; i <= end; i++) {
      if (ticketIds[i]) {
        newSelection.add(ticketIds[i]);
      }
    }

    return newSelection;
  }
}
