/**
 * Bulk Operations Panel Component
 * Provides comprehensive bulk operation capabilities
 */

import React, { useState, useCallback } from 'react';
import {
  BulkOperation,
  BulkOperationResult,
  BulkSelectionState,
  TicketStatus,
  TicketPriority,
} from '../../types';
import { BulkOperationsUtils } from '../../utils/bulkOperations';
import './bulk-operations-panel.css';

/**
 * Bulk Operations Panel Props
 */
export interface BulkOperationsPanelProps {
  // Selection state
  selectionState: BulkSelectionState;
  selectedTickets: Array<{ id: string; key: string; title: string }>;

  // Available operations
  availableOperations: BulkOperation[];

  // Actions
  onExecuteOperation: (
    operation: BulkOperation,
    params: any
  ) => Promise<BulkOperationResult>;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;

  // Available options
  availableStatuses: TicketStatus[];
  availablePriorities: TicketPriority[];
  availableAssignees: Array<{ id: string; name: string; displayName: string }>;
  availableLabels: string[];

  // UI props
  isOpen: boolean;
  onToggle: () => void;
  isExecuting: boolean;
  lastResult: BulkOperationResult | null;
  className?: string;
}

/**
 * Bulk Operations Panel Component
 */
export const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  selectionState,
  selectedTickets,
  availableOperations,
  onExecuteOperation,
  onClearSelection: _onClearSelection,
  onSelectAll,
  onDeselectAll,
  availableStatuses,
  availablePriorities,
  availableAssignees,
  availableLabels,
  isOpen,
  onToggle,
  isExecuting,
  lastResult,
  className = '',
}) => {
  const [activeOperation, setActiveOperation] = useState<BulkOperation | null>(
    null
  );
  const [operationParams, setOperationParams] = useState<any>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  /**
   * Handle operation selection
   */
  const handleOperationSelect = useCallback((operation: BulkOperation) => {
    setActiveOperation(operation);
    setOperationParams({});
    setShowConfirmation(false);
  }, []);

  /**
   * Handle parameter change
   */
  const handleParameterChange = useCallback((key: string, value: any) => {
    setOperationParams((prev: any) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Handle operation execution
   */
  const handleExecuteOperation = useCallback(async () => {
    if (!activeOperation) return;

    try {
      const result = await onExecuteOperation(activeOperation, operationParams);

      // Show result
      if (result.errorCount > 0) {
        console.warn('Operation completed with errors:', result);
      } else {
        console.log('Operation completed successfully:', result);
      }

      // Reset state
      setActiveOperation(null);
      setOperationParams({});
      setShowConfirmation(false);
    } catch (error) {
      console.error('Operation failed:', error);
    }
  }, [activeOperation, operationParams, onExecuteOperation]);

  /**
   * Handle confirmation
   */
  const handleConfirmOperation = useCallback(() => {
    if (!activeOperation) return;

    const message = BulkOperationsUtils.getConfirmationMessage(
      activeOperation,
      selectedTickets as any,
      operationParams
    );

    setConfirmationMessage(message);
    setShowConfirmation(true);
  }, [activeOperation, selectedTickets, operationParams]);

  /**
   * Handle confirmation cancel
   */
  const handleCancelConfirmation = useCallback(() => {
    setShowConfirmation(false);
    setConfirmationMessage('');
  }, []);

  /**
   * Handle confirmation confirm
   */
  const handleConfirmConfirmation = useCallback(() => {
    setShowConfirmation(false);
    handleExecuteOperation();
  }, [handleExecuteOperation]);

  const panelClasses = [
    'bulk-operations-panel',
    isOpen && 'bulk-operations-panel--open',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={panelClasses}>
      {/* Panel Header */}
      <div className='bulk-operations-panel__header'>
        <div className='bulk-operations-panel__title'>
          <h3>Bulk Operations</h3>
          <div className='bulk-operations-panel__count'>
            {selectionState.selectedCount} of {selectionState.totalCount}{' '}
            selected
          </div>
        </div>

        <div className='bulk-operations-panel__actions'>
          <button
            type='button'
            className='bulk-operations-panel__select-all'
            onClick={onSelectAll}
            disabled={selectionState.isAllSelected}
          >
            Select All
          </button>

          <button
            type='button'
            className='bulk-operations-panel__deselect-all'
            onClick={onDeselectAll}
            disabled={selectionState.selectedCount === 0}
          >
            Deselect All
          </button>

          <button
            type='button'
            className='bulk-operations-panel__toggle'
            onClick={onToggle}
            title={isOpen ? 'Close bulk operations' : 'Open bulk operations'}
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d={isOpen ? 'M18 6L6 18M6 6l12 12' : 'M3 6h18M3 12h18M3 18h18'}
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Panel Content */}
      {isOpen && (
        <div className='bulk-operations-panel__content'>
          {/* Selected Tickets List */}
          {selectionState.selectedCount > 0 && (
            <div className='bulk-operations-panel__selected-tickets'>
              <h4>Selected Tickets ({selectionState.selectedCount})</h4>
              <div className='bulk-operations-panel__ticket-list'>
                {selectedTickets.slice(0, 5).map(ticket => (
                  <div
                    key={ticket.id}
                    className='bulk-operations-panel__ticket-item'
                  >
                    <span className='bulk-operations-panel__ticket-key'>
                      {ticket.key}
                    </span>
                    <span className='bulk-operations-panel__ticket-title'>
                      {ticket.title}
                    </span>
                  </div>
                ))}
                {selectedTickets.length > 5 && (
                  <div className='bulk-operations-panel__ticket-more'>
                    +{selectedTickets.length - 5} more tickets
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Operations List */}
          <div className='bulk-operations-panel__operations'>
            <h4>Available Operations</h4>
            <div className='bulk-operations-panel__operation-list'>
              {availableOperations.map(operation => (
                <button
                  key={operation.id}
                  type='button'
                  className={`bulk-operations-panel__operation-button ${
                    activeOperation?.id === operation.id
                      ? 'bulk-operations-panel__operation-button--active'
                      : ''
                  }`}
                  onClick={() => handleOperationSelect(operation)}
                  disabled={isExecuting}
                >
                  {operation.icon && (
                    <span className='bulk-operations-panel__operation-icon'>
                      {operation.icon}
                    </span>
                  )}
                  <div className='bulk-operations-panel__operation-content'>
                    <div className='bulk-operations-panel__operation-label'>
                      {operation.label}
                    </div>
                    {operation.description && (
                      <div className='bulk-operations-panel__operation-description'>
                        {operation.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Operation Parameters */}
          {activeOperation && (
            <div className='bulk-operations-panel__parameters'>
              <h4>Operation Parameters</h4>

              {/* Move Operation */}
              {activeOperation.type === 'move' && (
                <div className='bulk-operations-panel__parameter-group'>
                  <label className='bulk-operations-panel__parameter-label'>
                    Target Status
                  </label>
                  <select
                    className='bulk-operations-panel__parameter-select'
                    value={operationParams.targetStatus || ''}
                    onChange={e =>
                      handleParameterChange('targetStatus', e.target.value)
                    }
                  >
                    <option value=''>Select status</option>
                    {availableStatuses.map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Assign Operation */}
              {activeOperation.type === 'assign' && (
                <div className='bulk-operations-panel__parameter-group'>
                  <label className='bulk-operations-panel__parameter-label'>
                    Assignee
                  </label>
                  <select
                    className='bulk-operations-panel__parameter-select'
                    value={operationParams.assigneeId || ''}
                    onChange={e => {
                      const assignee = availableAssignees.find(
                        a => a.id === e.target.value
                      );
                      handleParameterChange('assigneeId', e.target.value);
                      handleParameterChange(
                        'assigneeName',
                        assignee?.displayName || ''
                      );
                    }}
                  >
                    <option value=''>Select assignee</option>
                    {availableAssignees.map(assignee => (
                      <option key={assignee.id} value={assignee.id}>
                        {assignee.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Priority Operation */}
              {activeOperation.type === 'priority' && (
                <div className='bulk-operations-panel__parameter-group'>
                  <label className='bulk-operations-panel__parameter-label'>
                    Priority
                  </label>
                  <select
                    className='bulk-operations-panel__parameter-select'
                    value={operationParams.priority || ''}
                    onChange={e =>
                      handleParameterChange('priority', e.target.value)
                    }
                  >
                    <option value=''>Select priority</option>
                    {availablePriorities.map(priority => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Labels Operation */}
              {activeOperation.type === 'labels' && (
                <div className='bulk-operations-panel__parameter-group'>
                  <label className='bulk-operations-panel__parameter-label'>
                    Action
                  </label>
                  <select
                    className='bulk-operations-panel__parameter-select'
                    value={operationParams.action || ''}
                    onChange={e =>
                      handleParameterChange('action', e.target.value)
                    }
                  >
                    <option value=''>Select action</option>
                    <option value='add'>Add Labels</option>
                    <option value='remove'>Remove Labels</option>
                    <option value='replace'>Replace Labels</option>
                  </select>

                  {operationParams.action && (
                    <div className='bulk-operations-panel__checkbox-group'>
                      {availableLabels.map(label => (
                        <label
                          key={label}
                          className='bulk-operations-panel__checkbox'
                        >
                          <input
                            type='checkbox'
                            checked={
                              operationParams.labels?.includes(label) || false
                            }
                            onChange={e => {
                              const currentLabels =
                                operationParams.labels || [];
                              const newLabels = e.target.checked
                                ? [...currentLabels, label]
                                : currentLabels.filter(
                                    (l: string) => l !== label
                                  );
                              handleParameterChange('labels', newLabels);
                            }}
                          />
                          <span className='bulk-operations-panel__checkbox-label'>
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Export Operation */}
              {activeOperation.type === 'export' && (
                <div className='bulk-operations-panel__parameter-group'>
                  <label className='bulk-operations-panel__parameter-label'>
                    Format
                  </label>
                  <select
                    className='bulk-operations-panel__parameter-select'
                    value={operationParams.format || ''}
                    onChange={e =>
                      handleParameterChange('format', e.target.value)
                    }
                  >
                    <option value=''>Select format</option>
                    <option value='csv'>CSV</option>
                    <option value='json'>JSON</option>
                    <option value='excel'>Excel</option>
                  </select>

                  {operationParams.format && (
                    <div className='bulk-operations-panel__checkbox-group'>
                      <h5>Include Fields:</h5>
                      {BulkOperationsUtils.getExportFields().map(field => (
                        <label
                          key={field.key}
                          className='bulk-operations-panel__checkbox'
                        >
                          <input
                            type='checkbox'
                            checked={
                              operationParams.includeFields?.includes(
                                field.key
                              ) || false
                            }
                            onChange={e => {
                              const currentFields =
                                operationParams.includeFields || [];
                              const newFields = e.target.checked
                                ? [...currentFields, field.key]
                                : currentFields.filter(
                                    (f: string) => f !== field.key
                                  );
                              handleParameterChange('includeFields', newFields);
                            }}
                          />
                          <span className='bulk-operations-panel__checkbox-label'>
                            {field.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Execute Button */}
              <div className='bulk-operations-panel__execute'>
                <button
                  type='button'
                  className='bulk-operations-panel__execute-button'
                  onClick={handleConfirmOperation}
                  disabled={isExecuting || !isOperationReady()}
                >
                  {isExecuting
                    ? 'Executing...'
                    : `Execute ${activeOperation.label}`}
                </button>
              </div>
            </div>
          )}

          {/* Last Result */}
          {lastResult && (
            <div className='bulk-operations-panel__result'>
              <h4>Last Operation Result</h4>
              <div
                className={`bulk-operations-panel__result-content ${
                  lastResult.errorCount > 0
                    ? 'bulk-operations-panel__result-content--error'
                    : 'bulk-operations-panel__result-content--success'
                }`}
              >
                <div className='bulk-operations-panel__result-summary'>
                  {lastResult.successCount} successful, {lastResult.errorCount}{' '}
                  failed
                </div>
                {lastResult.errors.length > 0 && (
                  <div className='bulk-operations-panel__result-errors'>
                    {lastResult.errors.slice(0, 3).map((error, index) => (
                      <div
                        key={index}
                        className='bulk-operations-panel__result-error'
                      >
                        {error.ticketKey}: {error.error}
                      </div>
                    ))}
                    {lastResult.errors.length > 3 && (
                      <div className='bulk-operations-panel__result-error-more'>
                        +{lastResult.errors.length - 3} more errors
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className='bulk-operations-panel__confirmation-overlay'>
          <div className='bulk-operations-panel__confirmation-modal'>
            <h3>Confirm Operation</h3>
            <p>{confirmationMessage}</p>
            <div className='bulk-operations-panel__confirmation-actions'>
              <button
                type='button'
                className='bulk-operations-panel__confirmation-cancel'
                onClick={handleCancelConfirmation}
              >
                Cancel
              </button>
              <button
                type='button'
                className='bulk-operations-panel__confirmation-confirm'
                onClick={handleConfirmConfirmation}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Check if operation is ready to execute
   */
  function isOperationReady(): boolean {
    if (!activeOperation) return false;

    switch (activeOperation.type) {
      case 'move':
        return !!operationParams.targetStatus;
      case 'assign':
        return !!operationParams.assigneeId;
      case 'priority':
        return !!operationParams.priority;
      case 'labels':
        return !!operationParams.action && !!operationParams.labels?.length;
      case 'delete':
        return true;
      case 'export':
        return (
          !!operationParams.format && !!operationParams.includeFields?.length
        );
      default:
        return false;
    }
  }
};

export default BulkOperationsPanel;
