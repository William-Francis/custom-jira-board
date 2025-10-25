/**
 * Notification Bell Component
 * Shows notification count and toggles notification panel
 */

import React, { useState, useCallback } from 'react';
import './notification-bell.css';

/**
 * Notification Bell Props
 */
export interface NotificationBellProps {
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Notification Bell Component
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({
  unreadCount,
  isOpen,
  onToggle,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  /**
   * Handle click with animation
   */
  const handleClick = useCallback(() => {
    setIsAnimating(true);
    onToggle();

    // Reset animation after a short delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [onToggle]);

  const bellClasses = [
    'notification-bell',
    isOpen && 'notification-bell--open',
    isAnimating && 'notification-bell--animating',
    unreadCount > 0 && 'notification-bell--has-notifications',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type='button'
      className={bellClasses}
      onClick={handleClick}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      {/* Bell Icon */}
      <svg
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='notification-bell__icon'
      >
        <path
          d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M13.73 21a2 2 0 0 1-3.46 0'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>

      {/* Notification Badge */}
      {unreadCount > 0 && (
        <span className='notification-bell__badge'>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {/* Pulse Animation */}
      {unreadCount > 0 && <span className='notification-bell__pulse' />}
    </button>
  );
};

export default NotificationBell;
