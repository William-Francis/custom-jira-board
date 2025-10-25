/**
 * Board-related type definitions
 */

import { TicketStatus, ColumnConfig, Ticket } from './ticket';

/**
 * Board state interface
 */
export interface BoardState {
  id: string;
  name: string;
  columns: ColumnConfig[];
  tickets: Record<string, Ticket[]>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date;
}

/**
 * Board action types for state management
 */
export type BoardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TICKETS'; payload: Record<string, Ticket[]> }
  | { type: 'MOVE_TICKET'; payload: { ticketId: string; fromColumn: string; toColumn: string } }
  | { type: 'UPDATE_TICKET'; payload: Ticket }
  | { type: 'ADD_TICKET'; payload: Ticket }
  | { type: 'REMOVE_TICKET'; payload: string };

/**
 * Board context interface
 */
export interface BoardContextType {
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
  moveTicket: (ticketId: string, fromColumn: string, toColumn: string) => Promise<void>;
  updateTicket: (ticket: Ticket) => Promise<void>;
  refreshBoard: () => Promise<void>;
}

/**
 * Board component props
 */
export interface BoardProps {
  boardId: string;
  sprintId?: string;
  onTicketUpdate?: (ticket: Ticket) => void;
  className?: string;
}

/**
 * Column component props
 */
export interface ColumnProps {
  id: string;
  title: string;
  tickets: Ticket[];
  status: TicketStatus;
  onTicketMove: (ticketId: string, newStatus: TicketStatus) => void;
  isDropTarget?: boolean;
  wipLimit?: number;
  className?: string;
}

/**
 * Ticket component props
 */
export interface TicketProps {
  ticket: Ticket;
  onDragStart: (ticket: Ticket) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
  className?: string;
}

/**
 * Board header props
 */
export interface BoardHeaderProps {
  title: string;
  ticketCount: number;
  onRefresh: () => void;
  onSettings: () => void;
  className?: string;
}

/**
 * Board layout props
 */
export interface BoardLayoutProps {
  children: React.ReactNode;
  className?: string;
}
