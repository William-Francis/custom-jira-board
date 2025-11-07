/**
 * Board component - Main container for the kanban board
 * Manages columns, tickets, and drag-and-drop functionality
 */

import React, { useCallback, useEffect, useState } from 'react';
import { BoardProps, Ticket as TicketType, TicketStatus } from '../../types';
import { Column } from './Column';
import { AddTicketModal } from './AddTicketModal';
import { EditTicketModal } from './EditTicketModal';
import { useTickets, useBoardState, useErrorHandler } from '../../hooks';
import './board.css';

/**
 * Extended board component props
 */
interface ExtendedBoardProps extends BoardProps {
  onTicketEdit?: (ticket: TicketType) => void;
  onTicketDelete?: (ticketId: string) => void;
  onTicketView?: (ticket: TicketType) => void;
  onTicketAdd?: (status: TicketStatus) => void;
  onTicketsChange?: (tickets: TicketType[]) => void;
  showAddButtons?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Board component with drag-and-drop and state management
 */
export const Board: React.FC<ExtendedBoardProps> = ({
  boardId,
  sprintId,
  onTicketUpdate,
  onTicketEdit,
  onTicketDelete,
  onTicketView,
  onTicketAdd,
  onTicketsChange,
  showAddButtons = true,
  autoRefresh = false,
  refreshInterval = 30000,
  className = '',
  ...props
}) => {
  const [isAddTicketModalOpen, setIsAddTicketModalOpen] = useState(false);
  const [addTicketStatus, setAddTicketStatus] = useState<TicketStatus | null>(
    null
  );
  const [isEditTicketModalOpen, setIsEditTicketModalOpen] = useState(false);
  const [editTicket, setEditTicket] = useState<TicketType | null>(null);

  // Initialize error handler
  const errorHandler = useErrorHandler({
    onError: error => console.log('Board error:', error),
    onCriticalError: error => console.error('Critical board error:', error),
  });

  // Initialize board state
  const { boardConfig, loading: boardLoading } = useBoardState({
    boardId,
    autoRefresh,
    refreshInterval,
    onError: error =>
      errorHandler.addError(error, {
        component: 'Board',
        action: 'fetchBoard',
      }),
  });

  // Initialize tickets
  const {
    tickets,
    loading: ticketsLoading,
    moveTicket,
    refreshTickets,
  } = useTickets({
    boardId,
    autoRefresh,
    refreshInterval,
    onError: error =>
      errorHandler.addError(error, {
        component: 'Board',
        action: 'fetchTickets',
      }),
  });

  // Notify parent when tickets change
  useEffect(() => {
    onTicketsChange?.(tickets);
  }, [tickets, onTicketsChange]);

  /**
   * Handle ticket movement between columns
   */
  const handleTicketMove = useCallback(
    async (ticketId: string, newStatus: TicketStatus) => {
      try {
        await moveTicket(ticketId, newStatus);
        onTicketUpdate?.(tickets.find(t => t.id === ticketId)!);
      } catch (error) {
        errorHandler.addError(error as Error, {
          component: 'Board',
          action: 'moveTicket',
          additionalData: { ticketId, newStatus },
        });
      }
    },
    [moveTicket, tickets, onTicketUpdate, errorHandler]
  );

  /**
   * Handle ticket edit
   */
  const handleTicketEdit = useCallback(
    (ticket: TicketType) => {
      setEditTicket(ticket);
      setIsEditTicketModalOpen(true);
      onTicketEdit?.(ticket);
    },
    [onTicketEdit]
  );

  /**
   * Handle ticket update
   */
  const handleTicketUpdate = useCallback(
    async (ticketData: {
      title: string;
      description?: string;
      epic?: string;
    }) => {
      if (!editTicket) return;

      try {
        const { ticketService } = await import('../../services');

        // Update ticket in Jira
        await ticketService.updateTicket(editTicket.id, ticketData);

        console.log('✅ Ticket updated successfully');

        // Close modal immediately for better UX
        setIsEditTicketModalOpen(false);
        setEditTicket(null);

        // Refresh tickets in the background (non-blocking, no loading spinner)
        setTimeout(async () => {
          try {
            await refreshTickets(false); // Pass false to avoid loading spinner
          } catch (refreshError) {
            console.warn(
              'Failed to refresh tickets after update:',
              refreshError
            );
            // Retry once after longer delay
            setTimeout(async () => {
              try {
                await refreshTickets(false);
              } catch (retryError) {
                console.error('Retry refresh also failed:', retryError);
              }
            }, 2000);
          }
        }, 500);
      } catch (error) {
        errorHandler.addError(error as Error, {
          component: 'Board',
          action: 'updateTicket',
        });
      }
    },
    [editTicket, errorHandler, refreshTickets]
  );

  /**
   * Handle ticket delete
   */
  const handleTicketDelete = useCallback(
    async (ticketId: string) => {
      try {
        // In a real implementation, this would call the delete service
        console.log('Delete ticket:', ticketId);
        onTicketDelete?.(ticketId);
      } catch (error) {
        errorHandler.addError(error as Error, {
          component: 'Board',
          action: 'deleteTicket',
          additionalData: { ticketId },
        });
      }
    },
    [onTicketDelete, errorHandler]
  );

  /**
   * Handle ticket view
   */
  const handleTicketView = useCallback(
    (ticket: TicketType) => {
      onTicketView?.(ticket);
    },
    [onTicketView]
  );

  /**
   * Handle add ticket button click
   */
  const handleAddTicketClick = useCallback((status: TicketStatus) => {
    setAddTicketStatus(status);
    setIsAddTicketModalOpen(true);
  }, []);

  /**
   * Handle ticket submission
   */
  const handleTicketSubmit = useCallback(
    async (ticketData: {
      title: string;
      description?: string;
      epic?: string;
    }) => {
      try {
        const { ticketService } = await import('../../services');

        // Create ticket with status and other fields
        // Include boardId so we can get the project key from the board
        const ticketDataWithStatus = {
          ...ticketData,
          status: addTicketStatus!,
          // @ts-ignore - boardId is used internally by ticketService to get project key
          boardId: boardId,
        };

        const newTicket = await ticketService.createTicket(
          ticketDataWithStatus as any
        );

        console.log('✅ Ticket created successfully:', newTicket);

        // Close modal immediately for better UX
        setIsAddTicketModalOpen(false);

        // Refresh tickets in the background (without blocking or showing loading spinner)
        // Use a small delay to ensure Jira has processed the ticket
        setTimeout(async () => {
          try {
            await refreshTickets(false); // Pass false to avoid loading spinner
          } catch (refreshError) {
            console.warn(
              'Failed to refresh tickets after creation:',
              refreshError
            );
            // If refresh fails, try again after a longer delay
            setTimeout(async () => {
              try {
                await refreshTickets(false);
              } catch (retryError) {
                console.error('Retry refresh also failed:', retryError);
              }
            }, 2000);
          }
        }, 500); // Small delay to let Jira process the ticket

        // Call parent handler
        onTicketAdd?.(addTicketStatus!);
      } catch (error) {
        errorHandler.addError(error as Error, {
          component: 'Board',
          action: 'createTicket',
        });
      }
    },
    [addTicketStatus, onTicketAdd, errorHandler, refreshTickets]
  );

  /**
   * Group tickets by status
   */
  const groupTicketsByStatus = useCallback(() => {
    if (!boardConfig) return {};

    const grouped: Record<string, TicketType[]> = {};

    boardConfig.columns.forEach(column => {
      grouped[column.status] = tickets.filter(
        ticket => ticket.status === column.status
      );
    });

    return grouped;
  }, [tickets, boardConfig]);

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(async () => {
    try {
      await refreshTickets(true); // Show loading spinner for manual refresh
    } catch (error) {
      errorHandler.addError(error as Error, {
        component: 'Board',
        action: 'refreshBoard',
      });
    }
  }, [refreshTickets, errorHandler]);

  // Show loading state
  if (boardLoading.isLoading || ticketsLoading.isLoading) {
    return (
      <div className={`board board--loading ${className}`} {...props}>
        <div className='board__loading'>
          <div className='board__loading-spinner'>
            <svg
              width='32'
              height='32'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <circle
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeDasharray='31.416'
                strokeDashoffset='31.416'
                opacity='0.3'
              />
              <circle
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeDasharray='31.416'
                strokeDashoffset='31.416'
              >
                <animate
                  attributeName='stroke-dasharray'
                  dur='2s'
                  values='0 31.416;15.708 15.708;0 31.416'
                  repeatCount='indefinite'
                />
                <animate
                  attributeName='stroke-dashoffset'
                  dur='2s'
                  values='0;-15.708;-31.416'
                  repeatCount='indefinite'
                />
              </circle>
            </svg>
          </div>
          <p className='board__loading-text'>Loading board...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (boardLoading.error || ticketsLoading.error) {
    return (
      <div className={`board board--error ${className}`} {...props}>
        <div className='board__error'>
          <div className='board__error-icon'>
            <svg
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <circle
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='2'
              />
              <path
                d='M15 9L9 15M9 9L15 15'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </div>
          <h3 className='board__error-title'>Failed to load board</h3>
          <p className='board__error-message'>
            {boardLoading.error || ticketsLoading.error}
          </p>
          <button
            type='button'
            className='board__error-retry'
            onClick={handleRefresh}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!boardConfig) {
    return (
      <div className={`board board--empty ${className}`} {...props}>
        <div className='board__empty'>
          <div className='board__empty-icon'>
            <svg
              width='64'
              height='64'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <rect
                x='3'
                y='3'
                width='18'
                height='18'
                rx='2'
                ry='2'
                stroke='currentColor'
                strokeWidth='2'
              />
              <path d='M9 9h6v6H9z' stroke='currentColor' strokeWidth='2' />
            </svg>
          </div>
          <h3 className='board__empty-title'>No board configuration found</h3>
          <p className='board__empty-message'>
            The board configuration could not be loaded. Please check your
            connection and try again.
          </p>
        </div>
      </div>
    );
  }

  const groupedTickets = groupTicketsByStatus();

  const boardClasses = ['board', className].filter(Boolean).join(' ');

  return (
    <div className={boardClasses} {...props}>
      {/* Board Header */}
      <div className='board__header'>
        <div className='board__title-section'>
          <h1 className='board__title'>{boardConfig.name}</h1>
          {boardConfig.description && (
            <p className='board__description'>{boardConfig.description}</p>
          )}
        </div>

        <div className='board__actions'>
          <button
            type='button'
            className='board__refresh'
            onClick={handleRefresh}
            aria-label='Refresh board'
            title='Refresh board'
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M21 3v5h-5'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M3 21v-5h5'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Board Content */}
      <div className='board__content'>
        <div className='board__columns'>
          {boardConfig.columns.map(column => (
            <Column
              key={column.id}
              id={column.id}
              title={column.name}
              tickets={groupedTickets[column.status] || []}
              status={column.status}
              onTicketMove={handleTicketMove}
              onEditTicket={handleTicketEdit}
              onDeleteTicket={handleTicketDelete}
              onViewTicket={handleTicketView}
              onAddTicket={handleAddTicketClick}
              showAddButton={showAddButtons}
              wipLimit={column.wipLimit}
              isDropTarget={true}
            />
          ))}
        </div>
      </div>

      {/* Error Display */}
      {errorHandler.hasErrors && (
        <div className='board__errors'>
          <h4>Errors ({errorHandler.errors.length})</h4>
          {errorHandler.errors.slice(0, 3).map(error => (
            <div key={error.id} className='board__error-item'>
              <span
                className={`board__error-severity severity-${error.severity}`}
              >
                {error.severity}
              </span>
              <span className='board__error-message'>{error.message}</span>
              <button
                onClick={() => errorHandler.removeError(error.id)}
                className='board__error-remove'
                aria-label='Remove error'
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Ticket Modal */}
      {addTicketStatus && (
        <AddTicketModal
          isOpen={isAddTicketModalOpen}
          status={addTicketStatus}
          onClose={() => setIsAddTicketModalOpen(false)}
          onSubmit={handleTicketSubmit}
        />
      )}

      {/* Edit Ticket Modal */}
      <EditTicketModal
        isOpen={isEditTicketModalOpen}
        ticket={editTicket}
        onClose={() => {
          setIsEditTicketModalOpen(false);
          setEditTicket(null);
        }}
        onSubmit={handleTicketUpdate}
      />
    </div>
  );
};

export default Board;
