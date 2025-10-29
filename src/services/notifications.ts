/**
 * Notification service for managing notifications and alerts
 * Provides comprehensive notification management with desktop notifications
 */

import {
  Notification as NotificationType,
  NotificationType as NotificationTypeEnum,
  NotificationAction,
  NotificationSettings,
} from '../types';

/**
 * Notification service class
 */
export class NotificationService {
  private notifications: Map<string, NotificationType> = new Map();
  private settings: NotificationSettings;
  private maxNotifications: number = 50;
  private soundEnabled: boolean = true;
  private desktopNotificationsEnabled: boolean = true;

  constructor(settings?: Partial<NotificationSettings>) {
    this.settings = {
      enableNotifications: true,
      enableDesktopNotifications: true,
      enableSound: true,
      enableEmail: false,
      notificationTypes: ['info', 'success', 'warning', 'error', 'ticket_update', 'assignment'],
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      frequency: 'immediate',
      ...settings,
    };

    this.requestNotificationPermission();
  }

  /**
   * Show a notification
   */
  show(notification: Omit<NotificationType, 'id' | 'timestamp' | 'read'>): string {
    if (!this.settings.enableDesktopNotifications) {
      return '';
    }

    // Check quiet hours
    if (this.isQuietHours()) {
      return '';
    }

    const id = this.generateId();
    const fullNotification: NotificationType = {
      id,
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    this.notifications.set(id, fullNotification);

    // Show desktop notification
    if (this.settings.enableDesktopNotifications && this.desktopNotificationsEnabled) {
      this.showDesktopNotification(fullNotification);
    }

    // Play sound
    if (this.settings.enableSound && this.soundEnabled) {
      this.playNotificationSound(notification.type);
    }

    // Clean up old notifications
    this.cleanupOldNotifications();

    return id;
  }

  /**
   * Show success notification
   */
  success(title: string, message: string, actions?: NotificationAction[]): string {
    return this.show({
      type: 'success',
      title,
      message,
      persistent: false,
      actions,
    });
  }

  /**
   * Show error notification
   */
  error(title: string, message: string, actions?: NotificationAction[]): string {
    return this.show({
      type: 'error',
      title,
      message,
      persistent: true,
      actions,
    });
  }

  /**
   * Show warning notification
   */
  warning(title: string, message: string, actions?: NotificationAction[]): string {
    return this.show({
      type: 'warning',
      title,
      message,
      persistent: false,
      actions,
    });
  }

  /**
   * Show info notification
   */
  info(title: string, message: string, actions?: NotificationAction[]): string {
    return this.show({
      type: 'info',
      title,
      message,
      persistent: false,
      actions,
    });
  }

  /**
   * Show ticket update notification
   */
  ticketUpdate(ticketId: string, ticketKey: string, changes: string[], userId: string): string {
    const changesText = Array.isArray(changes) ? changes.join(', ') : String(changes || 'updated');
    return this.show({
      type: 'ticket_update',
      title: `Ticket ${ticketKey} Updated`,
      message: `Updated by ${userId}: ${changesText}`,
      persistent: false,
      ticketId,
      data: { changes, userId },
    });
  }

  /**
   * Show assignment notification
   */
  assignment(ticketId: string, ticketKey: string, assigneeName: string): string {
    return this.show({
      type: 'assignment',
      title: `Assigned to ${assigneeName}`,
      message: `You have been assigned to ticket ${ticketKey}`,
      persistent: false,
      ticketId,
      data: { assigneeName },
    });
  }

  /**
   * Show mention notification
   */
  mention(ticketId: string, ticketKey: string, mentionedBy: string): string {
    return this.show({
      type: 'mention',
      title: `Mentioned in ${ticketKey}`,
      message: `${mentionedBy} mentioned you in ticket ${ticketKey}`,
      persistent: false,
      ticketId,
      data: { mentionedBy },
    });
  }

  /**
   * Show deadline notification
   */
  deadline(ticketId: string, ticketKey: string, deadline: Date): string {
    const timeLeft = this.getTimeLeft(deadline);
    return this.show({
      type: 'deadline',
      title: `Deadline Approaching`,
      message: `Ticket ${ticketKey} is due ${timeLeft}`,
      persistent: true,
      ticketId,
      data: { deadline },
    });
  }

  /**
   * Show collaboration notification
   */
  collaboration(action: 'start' | 'end', ticketId: string, ticketKey: string, userName: string): string {
    const title = action === 'start' ? 'Collaboration Started' : 'Collaboration Ended';
    const message = `${userName} ${action === 'start' ? 'started' : 'ended'} collaborating on ${ticketKey}`;
    
    return this.show({
      type: 'collaboration',
      title,
      message,
      persistent: false,
      ticketId,
      data: { action, userName },
    });
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
  }

  /**
   * Remove notification
   */
  remove(notificationId: string): void {
    this.notifications.delete(notificationId);
  }

  /**
   * Remove all notifications
   */
  removeAll(): void {
    this.notifications.clear();
  }

  /**
   * Get all notifications
   */
  getAll(): NotificationType[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get unread notifications
   */
  getUnread(): NotificationType[] {
    return this.getAll().filter(notification => !notification.read);
  }

  /**
   * Get notifications by type
   */
  getByType(type: NotificationTypeEnum): NotificationType[] {
    return this.getAll().filter(notification => notification.type === type);
  }

  /**
   * Get notification count
   */
  getCount(): number {
    return this.notifications.size;
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.getUnread().length;
  }

  /**
   * Update notification settings
   */
  updateSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Enable/disable sound
   */
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  /**
   * Enable/disable desktop notifications
   */
  setDesktopNotificationsEnabled(enabled: boolean): void {
    this.desktopNotificationsEnabled = enabled;
  }

  /**
   * Request notification permission
   */
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error('Failed to request notification permission:', error);
      }
    }
  }

  /**
   * Show desktop notification
   */
  private showDesktopNotification(notification: NotificationType): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const desktopNotification = new Notification(notification.title, {
      body: notification.message,
      icon: this.getNotificationIcon(notification.type),
      tag: notification.id,
      requireInteraction: notification.persistent,
    });

    desktopNotification.onclick = () => {
      window.focus();
      desktopNotification.close();
      this.markAsRead(notification.id);
    };

    // Auto-close non-persistent notifications
    if (!notification.persistent) {
      setTimeout(() => {
        desktopNotification.close();
      }, 5000);
    }
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(type: NotificationTypeEnum): void {
    if (!this.soundEnabled) return;

    try {
      const soundUrl = this.getNotificationSound(type);
      const audio = new Audio(soundUrl);
      audio.volume = 0.3;
      
      // Handle audio loading errors gracefully
      audio.addEventListener('error', (e) => {
        // Silently handle audio errors - file might not exist or format not supported
        // Only log if it's not a NotSupportedError (format issue)
        const error = e.target?.error;
        if (error && error.code !== error.MEDIA_ERR_SRC_NOT_SUPPORTED) {
          console.warn(`Notification sound ${soundUrl} failed to load:`, error);
        }
      });
      
      audio.play().catch(error => {
        // Only log if user interaction is required or it's not a format issue
        if (error.name !== 'NotAllowedError' && error.name !== 'NotSupportedError') {
          console.warn('Failed to play notification sound:', error);
        }
      });
    } catch (error) {
      // Silently handle errors - notification sounds are optional
      console.warn('Error setting up notification sound:', error);
    }
  }

  /**
   * Get notification icon
   */
  private getNotificationIcon(type: NotificationTypeEnum): string {
    const icons = {
      info: '/icons/info.svg',
      success: '/icons/success.svg',
      warning: '/icons/warning.svg',
      error: '/icons/error.svg',
      ticket_update: '/icons/ticket.svg',
      assignment: '/icons/assignment.svg',
      mention: '/icons/mention.svg',
      deadline: '/icons/deadline.svg',
      collaboration: '/icons/collaboration.svg',
    };

    return icons[type] || '/icons/notification.svg';
  }

  /**
   * Get notification sound
   */
  private getNotificationSound(type: NotificationTypeEnum): string {
    const sounds = {
      info: '/sounds/info.mp3',
      success: '/sounds/success.mp3',
      warning: '/sounds/warning.mp3',
      error: '/sounds/error.mp3',
      ticket_update: '/sounds/update.mp3',
      assignment: '/sounds/assignment.mp3',
      mention: '/sounds/mention.mp3',
      deadline: '/sounds/deadline.mp3',
      collaboration: '/sounds/collaboration.mp3',
    };

    return sounds[type] || '/sounds/notification.mp3';
  }

  /**
   * Check if currently in quiet hours
   */
  private isQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = this.parseTime(this.settings.quietHours.start);
    const endTime = this.parseTime(this.settings.quietHours.end);

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Parse time string (HH:MM) to minutes
   */
  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Get time left until deadline
   */
  private getTimeLeft(deadline: Date): string {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) {
      return 'now';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `in ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }

  /**
   * Clean up old notifications
   */
  private cleanupOldNotifications(): void {
    if (this.notifications.size <= this.maxNotifications) {
      return;
    }

    const sortedNotifications = this.getAll();
    const toRemove = sortedNotifications.slice(this.maxNotifications);

    toRemove.forEach(notification => {
      this.notifications.delete(notification.id);
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Create notification service instance
 */
export function createNotificationService(settings?: Partial<NotificationSettings>): NotificationService {
  return new NotificationService(settings);
}

/**
 * Mock notification service for development
 */
export class MockNotificationService extends NotificationService {
  private mockNotifications: NotificationType[] = [];

  constructor(settings?: Partial<NotificationSettings>) {
    super(settings);
    this.generateMockNotifications();
  }

  /**
   * Generate mock notifications for testing
   */
  private generateMockNotifications(): void {
    this.mockNotifications = [
      {
        id: 'mock-1',
        type: 'ticket_update',
        title: 'Ticket PROJ-123 Updated',
        message: 'Status changed from TODO to IN_PROGRESS',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        persistent: false,
        ticketId: 'ticket-1',
        data: { changes: ['status'], userId: 'john.doe' },
      },
      {
        id: 'mock-2',
        type: 'assignment',
        title: 'Assigned to PROJ-124',
        message: 'You have been assigned to ticket PROJ-124',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: false,
        persistent: false,
        ticketId: 'ticket-2',
        data: { assigneeName: 'John Doe' },
      },
      {
        id: 'mock-3',
        type: 'mention',
        title: 'Mentioned in PROJ-125',
        message: 'Jane Smith mentioned you in ticket PROJ-125',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true,
        persistent: false,
        ticketId: 'ticket-3',
        data: { mentionedBy: 'Jane Smith' },
      },
    ];

    // Add mock notifications to the service
    this.mockNotifications.forEach(notification => {
      (this as any).notifications.set(notification.id, notification);
    });
  }

  /**
   * Override show method to add mock notifications
   */
  show(notification: Omit<NotificationType, 'id' | 'timestamp' | 'read'>): string {
    const id = super.show(notification);
    
    // Add some mock notifications periodically
    if (Math.random() < 0.3) { // 30% chance
      setTimeout(() => {
        const mockNotification = this.mockNotifications[Math.floor(Math.random() * this.mockNotifications.length)];
        if (mockNotification) {
          const newNotification = { ...mockNotification, id: `mock-${Date.now()}` };
          (this as any).notifications.set(newNotification.id, newNotification);
        }
      }, 2000);
    }
    
    return id;
  }
}
