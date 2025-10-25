/**
 * WebSocket service for real-time communication
 * Provides WebSocket connection management and event handling
 */

import {
  WebSocketConfig,
  WebSocketState,
  RealtimeEvent,
  RealtimeEventType,
  RealtimeSubscription,
  RealtimeStats,
} from '../types';

/**
 * WebSocket service class
 */
export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private state: WebSocketState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private eventHandlers: Map<RealtimeEventType, Set<(event: RealtimeEvent) => void>> = new Map();
  private stats: RealtimeStats;
  private messageQueue: RealtimeEvent[] = [];

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: 'ws://localhost:8080/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      timeout: 10000,
      enableHeartbeat: true,
      enableReconnect: true,
      ...config,
    };

    this.stats = {
      totalEvents: 0,
      eventsByType: new Map(),
      activeConnections: 1,
      lastEventTime: new Date(),
      averageLatency: 0,
      errorCount: 0,
      reconnectCount: 0,
    };

    this.initializeEventHandlers();
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }

    this.setState('connecting');

    try {
      this.ws = new WebSocket(this.config.url);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

      // Set connection timeout
      setTimeout(() => {
        if (this.state === 'connecting') {
          this.handleError(new Error('Connection timeout'));
        }
      }, this.config.timeout);

    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.setState('disconnected');
    this.reconnectAttempts = 0;
  }

  /**
   * Send message to server
   */
  send(event: RealtimeEvent): void {
    if (this.state !== 'connected' || !this.ws) {
      // Queue message for later
      this.messageQueue.push(event);
      return;
    }

    try {
      this.ws.send(JSON.stringify(event));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      this.handleError(error);
    }
  }

  /**
   * Subscribe to specific event types
   */
  subscribe(subscription: RealtimeSubscription): string {
    this.subscriptions.set(subscription.id, subscription);
    
    // Add event handler
    subscription.eventTypes.forEach(eventType => {
      if (!this.eventHandlers.has(eventType)) {
        this.eventHandlers.set(eventType, new Set());
      }
      this.eventHandlers.get(eventType)!.add(subscription.callback);
    });

    return subscription.id;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;

    // Remove event handler
    subscription.eventTypes.forEach(eventType => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(subscription.callback);
        if (handlers.size === 0) {
          this.eventHandlers.delete(eventType);
        }
      }
    });

    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Get current connection state
   */
  getState(): WebSocketState {
    return this.state;
  }

  /**
   * Get connection statistics
   */
  getStats(): RealtimeStats {
    return { ...this.stats };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === 'connected';
  }

  /**
   * Get active subscriptions count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    this.setState('connected');
    this.reconnectAttempts = 0;
    this.stats.reconnectCount++;
    
    // Process queued messages
    this.processMessageQueue();
    
    // Start heartbeat if enabled
    if (this.config.enableHeartbeat) {
      this.startHeartbeat();
    }

    console.log('WebSocket connected');
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data: RealtimeEvent = JSON.parse(event.data);
      
      // Update statistics
      this.updateStats(data);
      
      // Handle heartbeat response
      if (data.type === 'heartbeat' as any) {
        return;
      }

      // Dispatch to subscribers
      this.dispatchEvent(data);

    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      this.stats.errorCount++;
    }
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.setState('disconnected');
    this.clearTimers();
    
    console.log('WebSocket disconnected:', event.code, event.reason);

    // Attempt to reconnect if enabled
    if (this.config.enableReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(error: any): void {
    this.setState('error');
    this.stats.errorCount++;
    
    console.error('WebSocket error:', error);

    // Attempt to reconnect if enabled
    if (this.config.enableReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  /**
   * Set connection state
   */
  private setState(state: WebSocketState): void {
    this.state = state;
    // Emit state change event if needed
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.setState('reconnecting');
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.config.reconnectInterval);

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
  }

  /**
   * Start heartbeat timer
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.state === 'connected' && this.ws) {
        this.send({
          id: `heartbeat-${Date.now()}`,
          type: 'heartbeat' as any,
          timestamp: new Date(),
          userId: 'client',
          userName: 'Client',
          data: { ping: true },
          priority: 'low',
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  /**
   * Dispatch event to subscribers
   */
  private dispatchEvent(event: RealtimeEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  /**
   * Update statistics
   */
  private updateStats(event: RealtimeEvent): void {
    this.stats.totalEvents++;
    this.stats.lastEventTime = event.timestamp;
    
    const count = this.stats.eventsByType.get(event.type) || 0;
    this.stats.eventsByType.set(event.type, count + 1);
  }

  /**
   * Initialize event handlers map
   */
  private initializeEventHandlers(): void {
    // Initialize empty sets for all event types
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
      this.eventHandlers.set(eventType, new Set());
    });
  }

  /**
   * Cleanup and destroy service
   */
  destroy(): void {
    this.disconnect();
    this.subscriptions.clear();
    this.eventHandlers.clear();
    this.messageQueue = [];
  }
}

/**
 * Create WebSocket service instance
 */
export function createWebSocketService(config?: Partial<WebSocketConfig>): WebSocketService {
  return new WebSocketService(config);
}

/**
 * Mock WebSocket service for development
 */
export class MockWebSocketService {
  private mockEvents: RealtimeEvent[] = [];
  private eventInterval: NodeJS.Timeout | null = null;
  private state: WebSocketState = 'disconnected';
  private eventHandlers: Map<RealtimeEventType, Set<(event: RealtimeEvent) => void>> = new Map();

  constructor(_config?: Partial<WebSocketConfig>) {
    this.generateMockEvents();
  }

  /**
   * Simulate connection
   */
  async connect(): Promise<void> {
    setTimeout(() => {
      this.setState('connected' as any);
      this.startMockEvents();
    }, 1000);
  }

  /**
   * Generate mock events for testing
   */
  private generateMockEvents(): void {
    this.mockEvents = [
      {
        id: 'mock-1',
        type: 'ticket_updated',
        timestamp: new Date(),
        userId: 'user-1',
        userName: 'John Doe',
        data: { ticketId: 'ticket-1', changes: { status: 'IN_PROGRESS' } },
        boardId: 'board-1',
        ticketId: 'ticket-1',
        priority: 'medium',
      },
      {
        id: 'mock-2',
        type: 'user_joined',
        timestamp: new Date(),
        userId: 'user-2',
        userName: 'Jane Smith',
        data: { boardId: 'board-1' },
        boardId: 'board-1',
        priority: 'low',
      },
      {
        id: 'mock-3',
        type: 'notification',
        timestamp: new Date(),
        userId: 'user-1',
        userName: 'System',
        data: { message: 'Ticket assigned to you', type: 'assignment' },
        priority: 'high',
      },
    ];
  }

  /**
   * Start sending mock events
   */
  private startMockEvents(): void {
    this.eventInterval = setInterval(() => {
      if (this.mockEvents.length > 0) {
        const event = this.mockEvents[Math.floor(Math.random() * this.mockEvents.length)];
        this.dispatchEvent(event);
      }
    }, 10000); // Send mock event every 10 seconds
  }

  /**
   * Stop mock events
   */
  disconnect(): void {
    this.setState('disconnected' as any);
    if (this.eventInterval) {
      clearInterval(this.eventInterval);
      this.eventInterval = null;
    }
  }

  private setState(state: any): void {
    (this as any).state = state;
  }

  private dispatchEvent(event: RealtimeEvent): void {
    const handlers = (this as any).eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler: any) => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in mock event handler:', error);
        }
      });
    }
  }

  /**
   * Send event
   */
  send(event: RealtimeEvent): void {
    console.log('Mock WebSocket send:', event);
  }

  /**
   * Subscribe to events
   */
  subscribe(subscription: RealtimeSubscription): string {
    subscription.eventTypes.forEach(eventType => {
      if (!this.eventHandlers.has(eventType)) {
        this.eventHandlers.set(eventType, new Set());
      }
      this.eventHandlers.get(eventType)!.add(subscription.callback);
    });
    return subscription.id;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(_subscriptionId: string): void {
    // Mock implementation
  }

  /**
   * Get state
   */
  getState(): WebSocketState {
    return this.state;
  }

  /**
   * Get stats
   */
  getStats(): RealtimeStats {
    return {
      totalEvents: 0,
      eventsByType: new Map(),
      activeConnections: 1,
      lastEventTime: new Date(),
      averageLatency: 0,
      errorCount: 0,
      reconnectCount: 0,
    };
  }

  /**
   * Destroy service
   */
  destroy(): void {
    this.disconnect();
    this.eventHandlers.clear();
  }
}
