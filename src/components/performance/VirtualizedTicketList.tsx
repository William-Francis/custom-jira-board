/**
 * Virtualized Ticket List Component
 * Efficiently renders large lists of tickets using virtual scrolling
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { Ticket } from '../../types';
import {
  VirtualScrollManager,
  VirtualScrollState,
} from '../../utils/performance';
import './virtualized-ticket-list.css';

/**
 * Virtualized Ticket List Props
 */
export interface VirtualizedTicketListProps {
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
  onTicketEdit?: (ticket: Ticket) => void;
  onTicketDelete?: (ticketId: string) => void;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  className?: string;
  enableSmoothScrolling?: boolean;
  showVirtualizationInfo?: boolean;
}

/**
 * Virtualized Ticket List Component
 */
export const VirtualizedTicketList: React.FC<VirtualizedTicketListProps> = ({
  tickets,
  onTicketClick,
  onTicketEdit,
  onTicketDelete,
  itemHeight = 120,
  containerHeight = 600,
  overscan = 5,
  className = '',
  enableSmoothScrolling = true,
  showVirtualizationInfo = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<VirtualScrollState>({
    scrollTop: 0,
    scrollLeft: 0,
    visibleStartIndex: 0,
    visibleEndIndex: 0,
    totalHeight: 0,
    totalWidth: 0,
  });

  // Create virtual scroll manager
  const virtualScrollManager = useMemo(() => {
    return new VirtualScrollManager(
      {
        itemHeight,
        containerHeight,
        overscan,
        enableSmoothScrolling,
        enableHorizontalScrolling: false,
      },
      setScrollState
    );
  }, [itemHeight, containerHeight, overscan, enableSmoothScrolling]);

  // Update items when tickets change
  useEffect(() => {
    virtualScrollManager.setItems(tickets);
  }, [tickets, virtualScrollManager]);

  // Handle scroll events
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.target as HTMLDivElement;
      virtualScrollManager.handleScroll(target.scrollTop, target.scrollLeft);
    },
    [virtualScrollManager]
  );

  // Get visible items
  const visibleItems = useMemo(() => {
    return virtualScrollManager.getVisibleItems();
  }, [scrollState, virtualScrollManager]);

  // Handle ticket click
  const handleTicketClick = useCallback(
    (ticket: Ticket) => {
      onTicketClick?.(ticket);
    },
    [onTicketClick]
  );

  // Handle ticket edit
  const handleTicketEdit = useCallback(
    (ticket: Ticket, event: React.MouseEvent) => {
      event.stopPropagation();
      onTicketEdit?.(ticket);
    },
    [onTicketEdit]
  );

  // Handle ticket delete
  const handleTicketDelete = useCallback(
    (ticketId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      onTicketDelete?.(ticketId);
    },
    [onTicketDelete]
  );

  // Render individual ticket item
  const renderTicketItem = useCallback(
    (ticket: Ticket, index: number) => {
      const actualIndex = visibleItems.startIndex + index;
      const top = actualIndex * itemHeight;

      return (
        <div
          key={ticket.id}
          className='virtualized-ticket-item'
          style={{
            position: 'absolute',
            top: `${top}px`,
            left: 0,
            right: 0,
            height: `${itemHeight}px`,
          }}
          onClick={() => handleTicketClick(ticket)}
        >
          <div className='virtualized-ticket-item__content'>
            <div className='virtualized-ticket-item__header'>
              <h4 className='virtualized-ticket-item__title'>{ticket.key}</h4>
              <div className='virtualized-ticket-item__priority'>
                <span
                  className={`priority-badge priority-${ticket.priority.toLowerCase()}`}
                >
                  {ticket.priority}
                </span>
              </div>
            </div>

            <div className='virtualized-ticket-item__body'>
              <p className='virtualized-ticket-item__summary'>
                {ticket.description || 'No description available'}
              </p>
              <div className='virtualized-ticket-item__meta'>
                <span className='virtualized-ticket-item__status'>
                  {ticket.status}
                </span>
                <span className='virtualized-ticket-item__assignee'>
                  {ticket.assignee?.name || 'Unassigned'}
                </span>
              </div>
            </div>

            <div className='virtualized-ticket-item__actions'>
              <button
                type='button'
                className='virtualized-ticket-item__action'
                onClick={e => handleTicketEdit(ticket, e)}
                title='Edit ticket'
              >
                ✏️
              </button>
              <button
                type='button'
                className='virtualized-ticket-item__action virtualized-ticket-item__action--danger'
                onClick={e => handleTicketDelete(ticket.id, e)}
                title='Delete ticket'
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      );
    },
    [
      itemHeight,
      handleTicketClick,
      handleTicketEdit,
      handleTicketDelete,
      visibleItems.startIndex,
    ]
  );

  const containerClasses = [
    'virtualized-ticket-list',
    enableSmoothScrolling && 'virtualized-ticket-list--smooth',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {/* Virtualization Info */}
      {showVirtualizationInfo && (
        <div className='virtualized-ticket-list__info'>
          <span>
            Showing {visibleItems.items.length} of {tickets.length} tickets
            (items {visibleItems.startIndex + 1}-{visibleItems.endIndex + 1})
          </span>
        </div>
      )}

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className='virtualized-ticket-list__container'
        style={{
          height: `${containerHeight}px`,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        onScroll={handleScroll}
      >
        {/* Virtual Spacer */}
        <div
          className='virtualized-ticket-list__spacer'
          style={{
            height: `${scrollState.totalHeight}px`,
            position: 'relative',
          }}
        >
          {/* Visible Items */}
          {visibleItems.items.map((ticket, index) =>
            renderTicketItem(ticket, index)
          )}
        </div>
      </div>

      {/* Scroll Position Indicator */}
      {showVirtualizationInfo && (
        <div className='virtualized-ticket-list__scroll-info'>
          <span>
            Scroll: {Math.round(scrollState.scrollTop)}px /{' '}
            {Math.round(scrollState.totalHeight)}px
          </span>
        </div>
      )}
    </div>
  );
};

export default VirtualizedTicketList;
