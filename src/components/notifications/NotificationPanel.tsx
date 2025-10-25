/**
 * Notification Panel Component
 * Displays real-time notifications with actions and management
 */

import React, { useState, useCallback } from 'react';
import { Notification, NotificationAction } from '../../types';
import './notification-panel.css';

/**
 * Notification Panel Props
 */
export interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (notificationId: string) => void;
  onClearAll: () => void;
  onActionClick: (action: NotificationAction) => void;
  className?: string;
}

/**
 * Notification Panel Component
 */
export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  unreadCount,
  isOpen,
  onToggle,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove,
  onClearAll,
  onActionClick,
  className = '',
}) => {
  const [selectedNotification, setSelectedNotification] = useState<
    string | null
  >(null);

  /**
   * Handle notification click
   */
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.read) {
        onMarkAsRead(notification.id);
      }
      setSelectedNotification(notification.id);
    },
    [onMarkAsRead]
  );

  /**
   * Handle action click
   */
  const handleActionClick = useCallback(
    (action: NotificationAction, event: React.MouseEvent) => {
      event.stopPropagation();
      onActionClick(action);
    },
    [onActionClick]
  );

  /**
   * Handle remove click
   */
  const handleRemoveClick = useCallback(
    (notificationId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      onRemove(notificationId);
    },
    [onRemove]
  );

  /**
   * Format timestamp
   */
  const formatTimestamp = useCallback((timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }, []);

  /**
   * Get notification icon
   */
  const getNotificationIcon = useCallback((type: string): string => {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      ticket_update: '🎫',
      assignment: '👤',
      mention: '💬',
      deadline: '⏰',
      collaboration: '🤝',
    };
    return icons[type as keyof typeof icons] || '🔔';
  }, []);

  const panelClasses = [
    'notification-panel',
    isOpen && 'notification-panel--open',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={panelClasses}>
      {/* Header */}
      <div className='notification-panel__header'>
        <div className='notification-panel__title'>
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <span className='notification-panel__badge'>{unreadCount}</span>
          )}
        </div>

        <div className='notification-panel__actions'>
          {unreadCount > 0 && (
            <button
              type='button'
              className='notification-panel__mark-all'
              onClick={onMarkAllAsRead}
              title='Mark all as read'
            >
              Mark all read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type='button'
              className='notification-panel__clear-all'
              onClick={onClearAll}
              title='Clear all notifications'
            >
              Clear all
            </button>
          )}

          <button
            type='button'
            className='notification-panel__close'
            onClick={onToggle}
            title='Close notifications'
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
              <path
                d='M18 6L6 18M6 6l12 12'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='notification-panel__content'>
        {notifications.length === 0 ? (
          <div className='notification-panel__empty'>
            <div className='notification-panel__empty-icon'>🔔</div>
            <p>No notifications</p>
            <span>You're all caught up!</span>
          </div>
        ) : (
          <div className='notification-panel__list'>
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-panel__item ${
                  !notification.read ? 'notification-panel__item--unread' : ''
                } ${
                  selectedNotification === notification.id
                    ? 'notification-panel__item--selected'
                    : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className='notification-panel__item-header'>
                  <div className='notification-panel__item-icon'>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className='notification-panel__item-content'>
                    <h4 className='notification-panel__item-title'>
                      {notification.title}
                    </h4>
                    <p className='notification-panel__item-message'>
                      {notification.message}
                    </p>
                    <div className='notification-panel__item-meta'>
                      <span className='notification-panel__item-time'>
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      {notification.ticketId && (
                        <span className='notification-panel__item-ticket'>
                          Ticket {notification.ticketId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='notification-panel__item-actions'>
                    <button
                      type='button'
                      className='notification-panel__item-remove'
                      onClick={e => handleRemoveClick(notification.id, e)}
                      title='Remove notification'
                    >
                      <svg
                        width='12'
                        height='12'
                        viewBox='0 0 24 24'
                        fill='none'
                      >
                        <path
                          d='M18 6L6 18M6 6l12 12'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Actions */}
                {notification.actions && notification.actions.length > 0 && (
                  <div className='notification-panel__item-actions-list'>
                    {notification.actions.map(action => (
                      <button
                        key={action.id}
                        type='button'
                        className={`notification-panel__action notification-panel__action--${action.variant || 'secondary'}`}
                        onClick={e => handleActionClick(action, e)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
