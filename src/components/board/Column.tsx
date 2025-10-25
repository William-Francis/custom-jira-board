/**
 * Column component for organizing tickets by status
 * Supports drag-and-drop functionality and ticket management
 */

import React, { useState, useRef } from 'react';
import { ColumnProps, Ticket as TicketType, TicketStatus } from '../../types';
import { Ticket } from './Ticket';
import './column.css';

/**
 * Extended column component props
 */
interface ExtendedColumnProps extends ColumnProps {
  onAddTicket?: (status: TicketStatus) => void;
  onEditTicket?: (ticket: TicketType) => void;
  onDeleteTicket?: (ticketId: string) => void;
  onViewTicket?: (ticket: TicketType) => void;
  showAddButton?: boolean;
  maxHeight?: string;
  isDragOver?: boolean;
  draggedTicket?: TicketType | null;
}

/**
 * Column component with drag-and-drop support
 */
export const Column: React.FC<ExtendedColumnProps> = ({
  id,
  title,
  tickets,
  status,
  onTicketMove,
  isDropTarget = false,
  wipLimit,
  onAddTicket,
  onEditTicket,
  onDeleteTicket,
  onViewTicket,
  showAddButton = true,
  maxHeight = 'calc(100vh - 200px)',
  isDragOver = false,
  draggedTicket = null,
  className = '',
  ...props
}) => {
  const [isDragOverState, setIsDragOverState] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const columnRef = useRef<HTMLDivElement>(null);

  /**
   * Handle drag over
   */
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    if (!isDragOverState) {
      setIsDragOverState(true);
    }
  };

  /**
   * Handle drag enter
   */
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragCounter(prev => prev + 1);

    if (!isDragOverState) {
      setIsDragOverState(true);
    }
  };

  /**
   * Handle drag leave
   */
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragCounter(prev => prev - 1);

    if (dragCounter <= 1) {
      setIsDragOverState(false);
    }
  };

  /**
   * Handle drop
   */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOverState(false);
    setDragCounter(0);

    const ticketId = event.dataTransfer.getData('text/plain');
    if (ticketId) {
      onTicketMove(ticketId, status);
    }
  };

  /**
   * Handle add ticket
   */
  const handleAddTicket = () => {
    onAddTicket?.(status);
  };

  /**
   * Handle ticket drag start
   */
  const handleTicketDragStart = (_ticket: TicketType) => {
    // Additional logic can be added here if needed
  };

  /**
   * Handle ticket drag end
   */
  const handleTicketDragEnd = () => {
    // Additional logic can be added here if needed
  };

  const columnClasses = [
    'column',
    `column--${status.toLowerCase().replace('_', '-')}`,
    (isDragOverState || isDragOver) && 'column--drag-over',
    isDropTarget && 'column--drop-target',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const isOverWipLimit = wipLimit && tickets.length > wipLimit;
  const wipStatus = wipLimit ? `${tickets.length}/${wipLimit}` : tickets.length;

  return (
    <div
      ref={columnRef}
      className={columnClasses}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role='region'
      aria-label={`${title} column`}
      aria-describedby={`column-${id}-description`}
      data-testid={`column-${id}`}
      {...props}
    >
      {/* Column Header */}
      <div className='column__header'>
        <div className='column__title-section'>
          <h3 className='column__title'>{title}</h3>
          <div className='column__count'>
            <span
              className={`column__count-number ${isOverWipLimit ? 'column__count-number--over-limit' : ''}`}
            >
              {wipStatus}
            </span>
            {wipLimit && <span className='column__wip-limit'>WIP</span>}
          </div>
        </div>

        {showAddButton && (
          <button
            type='button'
            className='column__add-button'
            onClick={handleAddTicket}
            aria-label={`Add ticket to ${title}`}
            title={`Add ticket to ${title}`}
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden='true'
            >
              <path
                d='M12 5v14M5 12h14'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        )}
      </div>

      {/* Column Description */}
      <div id={`column-${id}-description`} className='column__description'>
        {wipLimit && isOverWipLimit && (
          <div className='column__wip-warning' role='alert'>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden='true'
            >
              <path
                d='M12 9v4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            WIP limit exceeded
          </div>
        )}
      </div>

      {/* Tickets Container */}
      <div
        className='column__tickets'
        style={{ maxHeight }}
        role='list'
        aria-label={`Tickets in ${title}`}
      >
        {tickets.length === 0 ? (
          <div className='column__empty'>
            <div className='column__empty-icon'>
              <svg
                width='32'
                height='32'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden='true'
              >
                <path
                  d='M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
            <p className='column__empty-text'>No tickets</p>
            {showAddButton && (
              <button
                type='button'
                className='column__empty-add'
                onClick={handleAddTicket}
              >
                Add first ticket
              </button>
            )}
          </div>
        ) : (
          tickets.map(ticket => (
            <Ticket
              key={ticket.id}
              ticket={ticket}
              onDragStart={handleTicketDragStart}
              onDragEnd={handleTicketDragEnd}
              onEdit={onEditTicket}
              onDelete={onDeleteTicket}
              onView={onViewTicket}
            />
          ))
        )}
      </div>

      {/* Drop Zone Indicator */}
      {(isDragOverState || isDragOver) && (
        <div className='column__drop-zone'>
          <div className='column__drop-indicator'>
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden='true'
            >
              <path
                d='M12 5v14M5 12h14'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            Drop ticket here
          </div>
        </div>
      )}
    </div>
  );
};

export default Column;
