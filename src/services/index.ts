/**
 * Services Export
 * Central export point for all service layer modules
 */

// API Service
export { apiService, ApiService, handleApiResponse, createErrorResponse } from './api';

// Ticket Service
export { ticketService, MockTicketService, ApiTicketService } from './ticketService';
export type { TicketService } from './ticketService';

// Board Service
export { boardService, MockBoardService, ApiBoardService } from './boardService';
export type { BoardService } from './boardService';

// Mock Data
export {
  mockUsers,
  mockSprint,
  mockBoardConfig,
  mockTickets,
  generateMockTickets,
  simulateApiDelay,
  simulateApiError,
  mockApiResponses,
} from './mockData';

// Real-time services
export { WebSocketService, MockWebSocketService, createWebSocketService } from './websocket';
export { NotificationService, MockNotificationService, createNotificationService } from './notifications';
