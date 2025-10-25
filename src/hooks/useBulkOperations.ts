/**
 * Custom hook for managing bulk operations
 * Provides comprehensive bulk operation state management
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
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
import { BulkOperationsUtils, SelectionUtils } from '../utils/bulkOperations';

/**
 * Configuration for the useBulkOperations hook
 */
export interface UseBulkOperationsConfig {
  tickets: Ticket[];
  operations?: BulkOperation[];
  onOperationComplete?: (result: BulkOperationResult) => void;
  onSelectionChange?: (state: BulkSelectionState) => void;
  maxSelectionCount?: number;
}

/**
 * Return type for the useBulkOperations hook
 */
export interface UseBulkOperationsReturn {
  // Selection state
  selectionState: BulkSelectionState;
  selectedTickets: Ticket[];
  
  // Selection actions
  selectTicket: (ticketId: string) => void;
  deselectTicket: (ticketId: string) => void;
  toggleTicketSelection: (ticketId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  selectRange: (startIndex: number, endIndex: number) => void;
  
  // Bulk operations
  availableOperations: BulkOperation[];
  executeOperation: (operation: BulkOperation, params: any) => Promise<BulkOperationResult>;
  canExecuteOperation: (operation: BulkOperation) => boolean;
  getConfirmationMessage: (operation: BulkOperation, params: any) => string;
  
  // Operation state
  isExecuting: boolean;
  lastResult: BulkOperationResult | null;
  
  // Utility functions
  isSelected: (ticketId: string) => boolean;
  getSelectionSummary: () => string;
  clearSelection: () => void;
}

/**
 * Custom hook for managing bulk operations
 */
export const useBulkOperations = (config: UseBulkOperationsConfig): UseBulkOperationsReturn => {
  const {
    tickets,
    operations = BulkOperationsUtils.getDefaultOperations(),
    onOperationComplete,
    onSelectionChange,
    maxSelectionCount,
  } = config;

  // State management
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<BulkOperationResult | null>(null);

  // Memoized selection state
  const selectionState: BulkSelectionState = useMemo(() => {
    const selectedCount = selectedTicketIds.size;
    const totalCount = tickets.length;
    const isAllSelected = selectedCount === totalCount && totalCount > 0;
    const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

    return {
      selectedTicketIds,
      isAllSelected,
      isPartiallySelected,
      totalCount,
      selectedCount,
    };
  }, [selectedTicketIds, tickets.length]);

  // Memoized selected tickets
  const selectedTickets = useMemo(() => {
    return tickets.filter(ticket => selectedTicketIds.has(ticket.id));
  }, [tickets, selectedTicketIds]);

  // Memoized available operations
  const availableOperations = useMemo(() => {
    return operations.filter(operation => 
      BulkOperationsUtils.canExecuteOperation(operation, selectedTickets)
    );
  }, [operations, selectedTickets]);

  // Selection actions
  const selectTicket = useCallback((ticketId: string) => {
    if (maxSelectionCount && selectedTicketIds.size >= maxSelectionCount) {
      return;
    }
    
    setSelectedTicketIds(prev => {
      const newSelection = new Set(prev);
      newSelection.add(ticketId);
      return newSelection;
    });
  }, [maxSelectionCount]);

  const deselectTicket = useCallback((ticketId: string) => {
    setSelectedTicketIds(prev => {
      const newSelection = new Set(prev);
      newSelection.delete(ticketId);
      return newSelection;
    });
  }, []);

  const toggleTicketSelection = useCallback((ticketId: string) => {
    setSelectedTicketIds(prev => {
      const newSelection = SelectionUtils.toggleSelection(prev, ticketId);
      
      // Check max selection limit
      if (maxSelectionCount && newSelection.size > maxSelectionCount) {
        return prev;
      }
      
      return newSelection;
    });
  }, [maxSelectionCount]);

  const selectAll = useCallback(() => {
    const ticketIds = tickets.map(ticket => ticket.id);
    const limitedIds = maxSelectionCount 
      ? ticketIds.slice(0, maxSelectionCount)
      : ticketIds;
    
    setSelectedTicketIds(new Set(limitedIds));
  }, [tickets, maxSelectionCount]);

  const deselectAll = useCallback(() => {
    setSelectedTicketIds(new Set());
  }, []);

  const selectRange = useCallback((startIndex: number, endIndex: number) => {
    const ticketIds = tickets.map(ticket => ticket.id);
    setSelectedTicketIds(prev => {
      const newSelection = SelectionUtils.selectRange(prev, ticketIds, startIndex, endIndex);
      
      // Check max selection limit
      if (maxSelectionCount && newSelection.size > maxSelectionCount) {
        return prev;
      }
      
      return newSelection;
    });
  }, [tickets, maxSelectionCount]);

  // Bulk operation execution
  const executeOperation = useCallback(async (
    operation: BulkOperation,
    params: any
  ): Promise<BulkOperationResult> => {
    setIsExecuting(true);
    
    try {
      // Validate operation
      const validationErrors = BulkOperationsUtils.validateOperation(
        operation,
        selectedTickets,
        params
      );
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Execute operation based on type
      let result: BulkOperationResult;
      
      switch (operation.type) {
        case 'move':
          result = await executeMoveOperation(selectedTickets, params as BulkMoveParams);
          break;
        case 'assign':
          result = await executeAssignOperation(selectedTickets, params as BulkAssignParams);
          break;
        case 'priority':
          result = await executePriorityOperation(selectedTickets, params as BulkPriorityParams);
          break;
        case 'labels':
          result = await executeLabelsOperation(selectedTickets, params as BulkLabelsParams);
          break;
        case 'delete':
          result = await executeDeleteOperation(selectedTickets);
          break;
        case 'export':
          result = await executeExportOperation(selectedTickets, params as BulkExportParams);
          break;
        default:
          throw new Error(`Unsupported operation type: ${operation.type}`);
      }

      setLastResult(result);
      onOperationComplete?.(result);
      
      // Clear selection after successful operation (except for export)
      if (operation.type !== 'export' && result.errorCount === 0) {
        setSelectedTicketIds(new Set());
      }
      
      return result;
    } catch (error) {
      const errorResult: BulkOperationResult = {
        operationId: operation.id,
        successCount: 0,
        errorCount: selectedTickets.length,
        totalCount: selectedTickets.length,
        errors: selectedTickets.map(ticket => ({
          ticketId: ticket.id,
          ticketKey: ticket.key,
          error: error instanceof Error ? error.message : 'Unknown error',
        })),
        successTicketIds: [],
      };
      
      setLastResult(errorResult);
      onOperationComplete?.(errorResult);
      return errorResult;
    } finally {
      setIsExecuting(false);
    }
  }, [selectedTickets, onOperationComplete]);

  // Check if operation can be executed
  const canExecuteOperation = useCallback((operation: BulkOperation) => {
    return BulkOperationsUtils.canExecuteOperation(operation, selectedTickets);
  }, [selectedTickets]);

  // Get confirmation message
  const getConfirmationMessage = useCallback((operation: BulkOperation, params: any) => {
    return BulkOperationsUtils.getConfirmationMessage(operation, selectedTickets, params);
  }, [selectedTickets]);

  // Utility functions
  const isSelected = useCallback((ticketId: string) => {
    return selectedTicketIds.has(ticketId);
  }, [selectedTicketIds]);

  const getSelectionSummary = useCallback(() => {
    const count = selectedTicketIds.size;
    if (count === 0) return 'No tickets selected';
    if (count === 1) return '1 ticket selected';
    return `${count} tickets selected`;
  }, [selectedTicketIds.size]);

  const clearSelection = useCallback(() => {
    setSelectedTicketIds(new Set());
  }, []);

  // Notify selection changes
  useEffect(() => {
    onSelectionChange?.(selectionState);
  }, [selectionState, onSelectionChange]);

  // Auto-save selection to localStorage
  useEffect(() => {
    const savedSelection = localStorage.getItem('jira-board-selection');
    if (savedSelection && selectedTicketIds.size === 0) {
      try {
        const parsed = JSON.parse(savedSelection);
        const validIds = tickets.filter(t => parsed.includes(t.id)).map(t => t.id);
        if (validIds.length > 0) {
          setSelectedTicketIds(new Set(validIds));
        }
      } catch {
        // Ignore invalid saved data
      }
    }
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('jira-board-selection', JSON.stringify([...selectedTicketIds]));
  }, [selectedTicketIds]);

  return {
    selectionState,
    selectedTickets,
    selectTicket,
    deselectTicket,
    toggleTicketSelection,
    selectAll,
    deselectAll,
    selectRange,
    availableOperations,
    executeOperation,
    canExecuteOperation,
    getConfirmationMessage,
    isExecuting,
    lastResult,
    isSelected,
    getSelectionSummary,
    clearSelection,
  };
};

// Mock operation implementations (in a real app, these would call actual APIs)
async function executeMoveOperation(tickets: Ticket[], _params: BulkMoveParams): Promise<BulkOperationResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const successIds: string[] = [];
  const errors: Array<{ ticketId: string; ticketKey: string; error: string }> = [];
  
  tickets.forEach(ticket => {
    // Simulate some failures
    if (Math.random() < 0.1) {
      errors.push({
        ticketId: ticket.id,
        ticketKey: ticket.key,
        error: 'Failed to move ticket',
      });
    } else {
      successIds.push(ticket.id);
    }
  });
  
  return BulkOperationsUtils.createResult('move', tickets, successIds, errors);
}

async function executeAssignOperation(tickets: Ticket[], _params: BulkAssignParams): Promise<BulkOperationResult> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const successIds: string[] = [];
  const errors: Array<{ ticketId: string; ticketKey: string; error: string }> = [];
  
  tickets.forEach(ticket => {
    if (Math.random() < 0.05) {
      errors.push({
        ticketId: ticket.id,
        ticketKey: ticket.key,
        error: 'Failed to assign ticket',
      });
    } else {
      successIds.push(ticket.id);
    }
  });
  
  return BulkOperationsUtils.createResult('assign', tickets, successIds, errors);
}

async function executePriorityOperation(tickets: Ticket[], _params: BulkPriorityParams): Promise<BulkOperationResult> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const successIds: string[] = [];
  const errors: Array<{ ticketId: string; ticketKey: string; error: string }> = [];
  
  tickets.forEach(ticket => {
    if (Math.random() < 0.03) {
      errors.push({
        ticketId: ticket.id,
        ticketKey: ticket.key,
        error: 'Failed to update priority',
      });
    } else {
      successIds.push(ticket.id);
    }
  });
  
  return BulkOperationsUtils.createResult('priority', tickets, successIds, errors);
}

async function executeLabelsOperation(tickets: Ticket[], _params: BulkLabelsParams): Promise<BulkOperationResult> {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const successIds: string[] = [];
  const errors: Array<{ ticketId: string; ticketKey: string; error: string }> = [];
  
  tickets.forEach(ticket => {
    if (Math.random() < 0.04) {
      errors.push({
        ticketId: ticket.id,
        ticketKey: ticket.key,
        error: 'Failed to update labels',
      });
    } else {
      successIds.push(ticket.id);
    }
  });
  
  return BulkOperationsUtils.createResult('labels', tickets, successIds, errors);
}

async function executeDeleteOperation(tickets: Ticket[]): Promise<BulkOperationResult> {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const successIds: string[] = [];
  const errors: Array<{ ticketId: string; ticketKey: string; error: string }> = [];
  
  tickets.forEach(ticket => {
    if (Math.random() < 0.08) {
      errors.push({
        ticketId: ticket.id,
        ticketKey: ticket.key,
        error: 'Failed to delete ticket',
      });
    } else {
      successIds.push(ticket.id);
    }
  });
  
  return BulkOperationsUtils.createResult('delete', tickets, successIds, errors);
}

async function executeExportOperation(tickets: Ticket[], params: BulkExportParams): Promise<BulkOperationResult> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const exportData = BulkOperationsUtils.exportTickets(tickets, params);
    
    // Create download link
    const blob = new Blob([exportData], { 
      type: params.format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tickets-export.${params.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return BulkOperationsUtils.createResult('export', tickets, tickets.map(t => t.id), []);
  } catch (error) {
    return BulkOperationsUtils.createResult('export', tickets, [], [{
      ticketId: '',
      ticketKey: '',
      error: error instanceof Error ? error.message : 'Export failed',
    }]);
  }
}
