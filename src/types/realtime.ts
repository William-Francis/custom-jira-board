/**
 * Real-time updates and notifications types
 */

/**
 * WebSocket connection states
 */
export type WebSocketState = 
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

/**
 * Real-time event types
 */
export type RealtimeEventType = 
  | 'ticket_created'
  | 'ticket_updated'
  | 'ticket_deleted'
  | 'ticket_moved'
  | 'ticket_assigned'
  | 'ticket_commented'
  | 'board_updated'
  | 'sprint_updated'
  | 'user_joined'
  | 'user_left'
  | 'collaboration_start'
  | 'collaboration_end'
  | 'conflict_detected'
  | 'notification';

/**
 * Real-time event data
 */
export interface RealtimeEvent {
  id: string;
  type: RealtimeEventType;
  timestamp: Date;
  userId: string;
  userName: string;
  data: any;
  boardId?: string;
  ticketId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  timeout: number;
  enableHeartbeat: boolean;
  enableReconnect: boolean;
}

/**
 * Notification types
 */
export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'ticket_update'
  | 'assignment'
  | 'mention'
  | 'deadline'
  | 'collaboration';

/**
 * Notification data
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent: boolean;
  actions?: NotificationAction[];
  data?: any;
  userId?: string;
  ticketId?: string;
  boardId?: string;
}

/**
 * Notification action
 */
export interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

/**
 * Collaboration state
 */
export interface CollaborationState {
  activeUsers: Map<string, CollaborationUser>;
  editingTickets: Map<string, string[]>; // ticketId -> userIds
  lastActivity: Map<string, Date>; // userId -> lastActivity
}

/**
 * Collaboration user
 */
export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  currentActivity?: string;
  lastSeen: Date;
  color: string;
}

/**
 * Real-time update configuration
 */
export interface RealtimeConfig {
  enableRealtime: boolean;
  enableNotifications: boolean;
  enableCollaboration: boolean;
  enableConflictResolution: boolean;
  notificationTimeout: number;
  collaborationTimeout: number;
  conflictResolutionTimeout: number;
  maxNotifications: number;
  enableSound: boolean;
  enableDesktopNotifications: boolean;
}

/**
 * Conflict resolution data
 */
export interface ConflictData {
  id: string;
  type: 'edit' | 'move' | 'delete' | 'assign';
  ticketId: string;
  conflictingUsers: string[];
  originalData: any;
  conflictingData: any;
  timestamp: Date;
  resolved: boolean;
}

/**
 * Real-time subscription
 */
export interface RealtimeSubscription {
  id: string;
  eventTypes: RealtimeEventType[];
  boardId?: string;
  ticketId?: string;
  userId?: string;
  callback: (event: RealtimeEvent) => void;
  active: boolean;
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  enableNotifications: boolean;
  enableDesktopNotifications: boolean;
  enableSound: boolean;
  enableEmail: boolean;
  notificationTypes: NotificationType[];
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  frequency: 'immediate' | 'batched' | 'digest';
}

/**
 * Real-time statistics
 */
export interface RealtimeStats {
  totalEvents: number;
  eventsByType: Map<RealtimeEventType, number>;
  activeConnections: number;
  lastEventTime: Date;
  averageLatency: number;
  errorCount: number;
  reconnectCount: number;
}
