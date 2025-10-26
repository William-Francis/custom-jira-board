/**
 * Ticket component for displaying individual tickets
 * Supports drag-and-drop functionality and accessibility features
 */

import React, { useState, useRef } from 'react';
import { Ticket as TicketType, TicketProps } from '../../types';
import {
  formatRelativeTime,
  getPriorityColor,
  getStatusColor,
} from '../../utils';
import './ticket.css';

/**
 * Extended ticket component props
 */
interface ExtendedTicketProps extends TicketProps {
  onEdit?: (ticket: TicketType) => void;
  onDelete?: (ticketId: string) => void;
  onView?: (ticket: TicketType) => void;
  showActions?: boolean;
  compact?: boolean;
  isDragOver?: boolean;
  dragPosition?: 'above' | 'below' | null;
}

/**
 * Ticket component with drag-and-drop and accessibility support
 */
export const Ticket: React.FC<ExtendedTicketProps> = ({
  ticket,
  onDragStart,
  onDragEnd,
  isDragging = false,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  compact = false,
  isDragOver = false,
  dragPosition = null,
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Handle clicks outside the menu to close it
   */
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  /**
   * Handle menu toggle
   */
  const handleMenuToggle = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering ticket click
    setShowMenu(prev => !prev);
  };

  /**
   * Handle drag start
   */
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', ticket.id);

    // Add visual feedback
    if (ticketRef.current) {
      ticketRef.current.style.opacity = '0.5';
    }

    onDragStart(ticket);
  };

  /**
   * Handle drag end
   */
  const handleDragEnd = (_event: React.DragEvent<HTMLDivElement>) => {
    if (ticketRef.current) {
      ticketRef.current.style.opacity = '1';
    }

    onDragEnd();
  };

  /**
   * Handle click events
   */
  const handleClick = (_event: React.MouseEvent) => {
    // Don't trigger click if dragging
    if (isDragging) return;

    // Don't trigger click if clicking on actions
    if ((_event.target as HTMLElement).closest('.ticket__actions')) return;

    onView?.(ticket);
  };

  /**
   * Handle keyboard events
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onView?.(ticket);
    }
  };

  /**
   * Handle action clicks
   */
  const handleActionClick = (
    action: 'edit' | 'delete',
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setShowMenu(false);

    if (action === 'edit') {
      onEdit?.(ticket);
    } else if (action === 'delete') {
      onDelete?.(ticket.id);
    }
  };

  const ticketClasses = [
    'ticket',
    `ticket--${ticket.priority.toLowerCase()}`,
    `ticket--${ticket.status.toLowerCase().replace('_', '-')}`,
    isDragging && 'ticket--dragging',
    isHovered && 'ticket--hovered',
    compact && 'ticket--compact',
    isDragOver && 'ticket--drag-over',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const priorityColor = getPriorityColor(ticket.priority);
  const statusColor = getStatusColor(ticket.status);

  return (
    <div
      ref={ticketRef}
      className={ticketClasses}
      draggable={!isDragging}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role='button'
      aria-label={`Ticket ${ticket.key}: ${ticket.title}`}
      aria-describedby={`ticket-${ticket.id}-description`}
      data-testid={`ticket-${ticket.id}`}
      {...props}
    >
      {/* Ticket Header */}
      <div className='ticket__header'>
        <div className='ticket__key'>{ticket.key}</div>
        {showActions && (
          <div className='ticket__actions' ref={menuRef}>
            <button
              type='button'
              className='ticket__menu-toggle'
              onClick={handleMenuToggle}
              aria-label='Ticket actions'
              aria-expanded={showMenu}
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden='true'
              >
                <circle cx='12' cy='5' r='2' fill='currentColor' />
                <circle cx='12' cy='12' r='2' fill='currentColor' />
                <circle cx='12' cy='19' r='2' fill='currentColor' />
              </svg>
            </button>

            {showMenu && (
              <div className='ticket__menu'>
                <button
                  type='button'
                  className='ticket__menu-item'
                  onClick={e => handleActionClick('edit', e)}
                  aria-label='Edit ticket'
                >
                  <svg
                    width='14'
                    height='14'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  Edit
                </button>
                <button
                  type='button'
                  className='ticket__menu-item ticket__menu-item--danger'
                  onClick={e => handleActionClick('delete', e)}
                  aria-label='Delete ticket'
                >
                  <svg
                    width='14'
                    height='14'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M10 11v6M14 11v6'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ticket Title */}
      <div className='ticket__title'>{ticket.title}</div>

      {/* Ticket Description (if not compact) */}
      {!compact && ticket.description && (
        <div
          id={`ticket-${ticket.id}-description`}
          className='ticket__description'
        >
          {ticket.description}
        </div>
      )}

      {/* Ticket Footer */}
      <div className='ticket__footer'>
        {/* Priority Indicator */}
        <div
          className='ticket__priority'
          style={{ backgroundColor: priorityColor }}
          aria-label={`Priority: ${ticket.priority}`}
        />

        {/* Story Points */}
        {ticket.storyPoints && (
          <div className='ticket__story-points'>
            <svg
              width='12'
              height='12'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden='true'
            >
              <path
                d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
                fill='currentColor'
              />
            </svg>
            {ticket.storyPoints}
          </div>
        )}

        {/* Assignee Avatar */}
        {ticket.assignee && (
          <div className='ticket__assignee'>
            <img
              src={
                ticket.assignee.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.assignee.name}`
              }
              alt={`${ticket.assignee.displayName} avatar`}
              className='ticket__avatar'
            />
          </div>
        )}

        {/* Labels */}
        {ticket.labels && ticket.labels.length > 0 && (
          <div className='ticket__labels'>
            {ticket.labels.slice(0, 2).map((label, index) => (
              <span key={index} className='ticket__label'>
                {label}
              </span>
            ))}
            {ticket.labels.length > 2 && (
              <span className='ticket__label-more'>
                +{ticket.labels.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div
        className='ticket__status-indicator'
        style={{ backgroundColor: statusColor }}
        aria-label={`Status: ${ticket.status}`}
      />

      {/* Updated Time */}
      <div className='ticket__updated'>
        {formatRelativeTime(ticket.updatedAt || ticket.updated || new Date())}
      </div>
    </div>
  );
};

export default Ticket;
