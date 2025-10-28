/**
 * Custom hook for managing real-time updates and notifications
 * Provides React integration for real-time functionality
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  RealtimeEvent,
  RealtimeEventType,
  RealtimeConfig,
  RealtimeSubscription,
  WebSocketState,
  RealtimeStats,
  Notification as RealtimeNotification,
  NotificationSettings,
  CollaborationState,
  CollaborationUser,
  ConflictData,
} from '../types';
import { WebSocketService, MockWebSocketService } from '../services/websocket';
import { NotificationService, MockNotificationService } from '../services/notifications';

/**
 * Configuration for the useRealtime hook
 */
export interface UseRealtimeConfig extends Partial<RealtimeConfig> {
  enableMockMode?: boolean;
  onEvent?: (event: RealtimeEvent) => void;
  onNotification?: (notification: RealtimeNotification) => void;
  onCollaborationChange?: (state: CollaborationState) => void;
  onConflictDetected?: (conflict: ConflictData) => void;
}

/**
 * Return type for the useRealtime hook
 */
export interface UseRealtimeReturn {
  // Connection state
  connectionState: WebSocketState;
  isConnected: boolean;
  stats: RealtimeStats;
  
  // Event management
  subscribe: (subscription: RealtimeSubscription) => string;
  unsubscribe: (subscriptionId: string) => void;
  sendEvent: (event: Omit<RealtimeEvent, 'id' | 'timestamp'>) => void;
  
  // Connection management
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  
  // Notifications
  notifications: RealtimeNotification[];
  unreadCount: number;
  showNotification: (notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'read'>) => string;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  
  // Collaboration
  collaborationState: CollaborationState;
  activeUsers: CollaborationUser[];
  isUserOnline: (userId: string) => boolean;
  getUserActivity: (userId: string) => string | undefined;
  
  // Conflicts
  conflicts: ConflictData[];
  resolveConflict: (conflictId: string, resolution: any) => void;
  
  // Settings
  updateSettings: (settings: Partial<RealtimeConfig>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

/**
 * Custom hook for managing real-time updates and notifications
 */
export const useRealtime = (config: UseRealtimeConfig = {}): UseRealtimeReturn => {
  const {
    enableRealtime = true,
    enableNotifications = true,
    enableCollaboration = true,
    enableConflictResolution = true,
    enableMockMode = true,
    onEvent,
    onNotification,
    onCollaborationChange,
    onConflictDetected,
  } = config;

  // Services
  const wsServiceRef = useRef<WebSocketService | MockWebSocketService | null>(null);
  const notificationServiceRef = useRef<NotificationService | null>(null);

  // State
  const [connectionState, setConnectionState] = useState<WebSocketState>('disconnected');
  const [stats, setStats] = useState<RealtimeStats>({
    totalEvents: 0,
    eventsByType: new Map(),
    activeConnections: 0,
    lastEventTime: new Date(),
    averageLatency: 0,
    errorCount: 0,
    reconnectCount: 0,
  });
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    activeUsers: new Map(),
    editingTickets: new Map(),
    lastActivity: new Map(),
  });
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);

  // Initialize services
  useEffect(() => {
    if (enableRealtime) {
      // Initialize WebSocket service
      wsServiceRef.current = enableMockMode 
        ? new MockWebSocketService()
        : new WebSocketService();

      // Initialize notification service
      notificationServiceRef.current = enableMockMode
        ? new MockNotificationService()
        : new NotificationService();

      // Set up event handlers
      setupEventHandlers();

      // Auto-connect
      connect();

      return () => {
        wsServiceRef.current?.destroy();
        notificationServiceRef.current = null;
      };
    }
  }, [enableRealtime, enableMockMode]);

  // Update stats periodically
  useEffect(() => {
    if (!wsServiceRef.current) return;

    const interval = setInterval(() => {
      const newStats = wsServiceRef.current?.getStats();
      if (newStats) {
        setStats(newStats);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update notifications periodically
  useEffect(() => {
    if (!notificationServiceRef.current) return;

    const interval = setInterval(() => {
      const allNotifications = notificationServiceRef.current?.getAll() || [];
      setNotifications(allNotifications);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  /**
   * Set up event handlers
   */
  const setupEventHandlers = useCallback(() => {
    if (!wsServiceRef.current) return;

    // Handle all real-time events
    const eventTypes: RealtimeEventType[] = [
      'ticket_created',
      'ticket_updated',
      'ticket_deleted',
      'ticket_moved',
      'ticket_assigned',
      'ticket_commented',
      'board_updated',
      'sprint_updated',
      'user_joined',
      'user_left',
      'collaboration_start',
      'collaboration_end',
      'conflict_detected',
      'notification',
    ];

    eventTypes.forEach(eventType => {
      wsServiceRef.current?.subscribe({
        id: `handler-${eventType}`,
        eventTypes: [eventType],
        callback: (event: RealtimeEvent) => {
          handleRealtimeEvent(event);
        },
        active: true,
      });
    });
  }, []);

  /**
   * Handle real-time events
   */
  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    onEvent?.(event);

    // Handle specific event types
    switch (event.type) {
      case 'ticket_updated':
        handleTicketUpdate(event);
        break;
      case 'ticket_assigned':
        handleTicketAssignment(event);
        break;
      case 'user_joined':
      case 'user_left':
        handleUserPresence(event);
        break;
      case 'collaboration_start':
      case 'collaboration_end':
        handleCollaboration(event);
        break;
      case 'conflict_detected':
        handleConflict(event);
        break;
      case 'notification':
        handleNotificationEvent(event);
        break;
    }
  }, [onEvent]);

  /**
   * Handle ticket update events
   */
  const handleTicketUpdate = useCallback((event: RealtimeEvent) => {
    if (enableNotifications && notificationServiceRef.current) {
      const { ticketId, changes, userId } = event.data;
      // Ensure changes is an array
      const changesArray = Array.isArray(changes) ? changes : (changes ? [String(changes)] : ['updated']);
      notificationServiceRef.current.ticketUpdate(
        ticketId,
        event.ticketId || 'Unknown',
        changesArray,
        userId || 'Unknown User'
      );
    }
  }, [enableNotifications]);

  /**
   * Handle ticket assignment events
   */
  const handleTicketAssignment = useCallback((event: RealtimeEvent) => {
    if (enableNotifications && notificationServiceRef.current) {
      const { assigneeName } = event.data;
      notificationServiceRef.current.assignment(
        event.ticketId || 'unknown',
        event.ticketId || 'Unknown',
        assigneeName || 'Unknown User'
      );
    }
  }, [enableNotifications]);

  /**
   * Handle user presence events
   */
  const handleUserPresence = useCallback((event: RealtimeEvent) => {
    if (!enableCollaboration) return;

    setCollaborationState(prev => {
      const newState = { ...prev };
      const user: CollaborationUser = {
        id: event.userId,
        name: event.userName,
        email: event.data.email || '',
        status: event.type === 'user_joined' ? 'online' : 'offline',
        lastSeen: new Date(),
        color: event.data.color || '#007bff',
      };

      if (event.type === 'user_joined') {
        newState.activeUsers.set(event.userId, user);
      } else {
        newState.activeUsers.delete(event.userId);
      }

      onCollaborationChange?.(newState);
      return newState;
    });
  }, [enableCollaboration, onCollaborationChange]);

  /**
   * Handle collaboration events
   */
  const handleCollaboration = useCallback((event: RealtimeEvent) => {
    if (!enableCollaboration) return;

    setCollaborationState(prev => {
      const newState = { ...prev };
      const { ticketId } = event.data;

      if (event.type === 'collaboration_start') {
        const currentEditors = newState.editingTickets.get(ticketId) || [];
        if (!currentEditors.includes(event.userId)) {
          newState.editingTickets.set(ticketId, [...currentEditors, event.userId]);
        }
      } else {
        const currentEditors = newState.editingTickets.get(ticketId) || [];
        newState.editingTickets.set(ticketId, currentEditors.filter(id => id !== event.userId));
      }

      onCollaborationChange?.(newState);
      return newState;
    });
  }, [enableCollaboration, onCollaborationChange]);

  /**
   * Handle conflict events
   */
  const handleConflict = useCallback((event: RealtimeEvent) => {
    if (!enableConflictResolution) return;

    const conflict: ConflictData = {
      id: event.id,
      type: event.data.type,
      ticketId: event.ticketId || '',
      conflictingUsers: event.data.conflictingUsers || [],
      originalData: event.data.originalData,
      conflictingData: event.data.conflictingData,
      timestamp: event.timestamp,
      resolved: false,
    };

    setConflicts(prev => [...prev, conflict]);
    onConflictDetected?.(conflict);
  }, [enableConflictResolution, onConflictDetected]);

  /**
   * Handle notification events
   */
  const handleNotificationEvent = useCallback((event: RealtimeEvent) => {
    if (enableNotifications && notificationServiceRef.current) {
      const notification = notificationServiceRef.current.show({
        type: event.data.type || 'info',
        title: event.data.title || 'Notification',
        message: event.data.message || '',
        persistent: event.data.persistent || false,
        actions: event.data.actions,
        data: event.data,
      });

      onNotification?.(notificationServiceRef.current.getAll().find(n => n.id === notification)!);
    }
  }, [enableNotifications, onNotification]);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(async () => {
    if (wsServiceRef.current) {
      await wsServiceRef.current.connect();
      setConnectionState(wsServiceRef.current.getState());
    }
  }, []);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect();
      setConnectionState('disconnected');
    }
  }, []);

  /**
   * Reconnect to WebSocket
   */
  const reconnect = useCallback(async () => {
    disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await connect();
  }, [connect, disconnect]);

  /**
   * Subscribe to events
   */
  const subscribe = useCallback((subscription: RealtimeSubscription): string => {
    return wsServiceRef.current?.subscribe(subscription) || '';
  }, []);

  /**
   * Unsubscribe from events
   */
  const unsubscribe = useCallback((subscriptionId: string) => {
    wsServiceRef.current?.unsubscribe(subscriptionId);
  }, []);

  /**
   * Send event
   */
  const sendEvent = useCallback((event: Omit<RealtimeEvent, 'id' | 'timestamp'>) => {
    if (wsServiceRef.current) {
      const fullEvent: RealtimeEvent = {
        id: `event-${Date.now()}`,
        timestamp: new Date(),
        ...event,
      };
      wsServiceRef.current.send(fullEvent);
    }
  }, []);

  /**
   * Show notification
   */
  const showNotification = useCallback((notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'read'>): string => {
    return notificationServiceRef.current?.show(notification) || '';
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((notificationId: string) => {
    notificationServiceRef.current?.markAsRead(notificationId);
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    notificationServiceRef.current?.markAllAsRead();
  }, []);

  /**
   * Remove notification
   */
  const removeNotification = useCallback((notificationId: string) => {
    notificationServiceRef.current?.remove(notificationId);
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    notificationServiceRef.current?.removeAll();
  }, []);

  /**
   * Check if user is online
   */
  const isUserOnline = useCallback((userId: string): boolean => {
    const user = collaborationState.activeUsers.get(userId);
    return user?.status === 'online' || false;
  }, [collaborationState.activeUsers]);

  /**
   * Get user activity
   */
  const getUserActivity = useCallback((userId: string): string | undefined => {
    const user = collaborationState.activeUsers.get(userId);
    return user?.currentActivity;
  }, [collaborationState.activeUsers]);

  /**
   * Resolve conflict
   */
  const resolveConflict = useCallback((conflictId: string, resolution: any) => {
    setConflicts(prev => prev.map(conflict => 
      conflict.id === conflictId 
        ? { ...conflict, resolved: true, ...resolution }
        : conflict
    ));
  }, []);

  /**
   * Update settings
   */
  const updateSettings = useCallback((settings: Partial<RealtimeConfig>) => {
    // Update WebSocket service settings if needed
    console.log('Updating realtime settings:', settings);
  }, []);

  /**
   * Update notification settings
   */
  const updateNotificationSettings = useCallback((settings: Partial<NotificationSettings>) => {
    notificationServiceRef.current?.updateSettings(settings);
  }, []);

  // Computed values
  const isConnected = connectionState === 'connected';
  const unreadCount = notifications.filter(n => !n.read).length;
  const activeUsers = Array.from(collaborationState.activeUsers.values());

  return {
    // Connection state
    connectionState,
    isConnected,
    stats,
    
    // Event management
    subscribe,
    unsubscribe,
    sendEvent,
    
    // Connection management
    connect,
    disconnect,
    reconnect,
    
    // Notifications
    notifications,
    unreadCount,
    showNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    
    // Collaboration
    collaborationState,
    activeUsers,
    isUserOnline,
    getUserActivity,
    
    // Conflicts
    conflicts,
    resolveConflict,
    
    // Settings
    updateSettings,
    updateNotificationSettings,
  };
};
