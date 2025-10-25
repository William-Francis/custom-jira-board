/**
 * Board component - Main container for the kanban board
 * Manages columns, tickets, and drag-and-drop functionality
 */

import React, { useCallback } from 'react';
import { BoardProps, Ticket as TicketType, TicketStatus } from '../../types';
import { Column } from './Column';
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
  showAddButtons = true,
  autoRefresh = false,
  refreshInterval = 30000,
  className = '',
  ...props
}) => {
  // const [draggedTicket, setDraggedTicket] = useState<TicketType | null>(null);

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
      onTicketEdit?.(ticket);
    },
    [onTicketEdit]
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
   * Handle add ticket
   */
  const handleAddTicket = useCallback(
    (status: TicketStatus) => {
      onTicketAdd?.(status);
    },
    [onTicketAdd]
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
      await refreshTickets();
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
              onAddTicket={handleAddTicket}
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
    </div>
  );
};

export default Board;
