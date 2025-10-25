/**
 * Custom hook for managing ticket data and operations
 * Provides a consistent interface for ticket-related state management
 */

import { useState, useEffect, useCallback } from 'react';
import { Ticket, TicketStatus, LoadingState } from '../types';
import { ticketService } from '../services';
import { createUserErrorMessage, isRetryableError } from '../utils';

/**
 * Hook return type
 */
export interface UseTicketsReturn {
  tickets: Ticket[];
  loading: LoadingState;
  updateTicket: (ticket: Ticket) => Promise<void>;
  moveTicket: (ticketId: string, newStatus: TicketStatus) => Promise<void>;
  refreshTickets: () => Promise<void>;
  createTicket: (ticket: Partial<Ticket>) => Promise<Ticket>;
  deleteTicket: (ticketId: string) => Promise<void>;
  searchTickets: (query: string) => Promise<Ticket[]>;
  getTicketsByStatus: (status: TicketStatus) => Promise<Ticket[]>;
}

/**
 * Hook configuration
 */
export interface UseTicketsConfig {
  boardId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  retryOnError?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (message: string) => void;
}

/**
 * Custom hook for ticket management
 */
export const useTickets = (config: UseTicketsConfig): UseTicketsReturn => {
  const { boardId, autoRefresh = false, refreshInterval = 30000, retryOnError = true, onError, onSuccess } = config;
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  /**
   * Fetch tickets from the service
   */
  const fetchTickets = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading({ isLoading: true, error: null });
    }

    try {
      const fetchedTickets = await ticketService.getTickets(boardId);
      setTickets(fetchedTickets);
      setLoading({ isLoading: false, error: null });
      onSuccess?.('Tickets loaded successfully');
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setLoading({ isLoading: false, error: errorMessage });
      onError?.(error as Error);
      
      // Retry on retryable errors
      if (retryOnError && isRetryableError(error as Error)) {
        setTimeout(() => fetchTickets(false), 5000);
      }
    }
  }, [boardId, retryOnError]);

  /**
   * Update a ticket
   */
  const updateTicket = useCallback(async (ticket: Ticket) => {
    setLoading({ isLoading: true, error: null });

    try {
      const updatedTicket = await ticketService.updateTicket(ticket.id, ticket);
      setTickets(prevTickets => 
        prevTickets.map(t => t.id === ticket.id ? updatedTicket : t)
      );
      setLoading({ isLoading: false, error: null });
      onSuccess?.('Ticket updated successfully');
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setLoading({ isLoading: false, error: errorMessage });
      onError?.(error as Error);
      throw error;
    }
  }, [onError, onSuccess]);

  /**
   * Move a ticket to a new status
   */
  const moveTicket = useCallback(async (ticketId: string, newStatus: TicketStatus) => {
    setLoading({ isLoading: true, error: null });

    try {
      const updatedTicket = await ticketService.moveTicket(ticketId, newStatus);
      setTickets(prevTickets => 
        prevTickets.map(t => t.id === ticketId ? updatedTicket : t)
      );
      setLoading({ isLoading: false, error: null });
      onSuccess?.('Ticket moved successfully');
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setLoading({ isLoading: false, error: errorMessage });
      onError?.(error as Error);
      throw error;
    }
  }, [onError, onSuccess]);

  /**
   * Create a new ticket
   */
  const createTicket = useCallback(async (ticketData: Partial<Ticket>): Promise<Ticket> => {
    setLoading({ isLoading: true, error: null });

    try {
      const newTicket = await ticketService.createTicket(ticketData);
      setTickets(prevTickets => [...prevTickets, newTicket]);
      setLoading({ isLoading: false, error: null });
      onSuccess?.('Ticket created successfully');
      return newTicket;
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setLoading({ isLoading: false, error: errorMessage });
      onError?.(error as Error);
      throw error;
    }
  }, [onError, onSuccess]);

  /**
   * Delete a ticket
   */
  const deleteTicket = useCallback(async (ticketId: string) => {
    setLoading({ isLoading: true, error: null });

    try {
      await ticketService.deleteTicket(ticketId);
      setTickets(prevTickets => prevTickets.filter(t => t.id !== ticketId));
      setLoading({ isLoading: false, error: null });
      onSuccess?.('Ticket deleted successfully');
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setLoading({ isLoading: false, error: errorMessage });
      onError?.(error as Error);
      throw error;
    }
  }, [onError, onSuccess]);

  /**
   * Search tickets (using getTickets with query parameter)
   */
  const searchTickets = useCallback(async (query: string): Promise<Ticket[]> => {
    try {
      return await ticketService.getTickets(boardId, { search: query });
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }, [boardId, onError]);

  /**
   * Get tickets by status (using getTickets with status parameter)
   */
  const getTicketsByStatus = useCallback(async (status: TicketStatus): Promise<Ticket[]> => {
    try {
      return await ticketService.getTickets(boardId, { status });
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }, [boardId, onError]);

  /**
   * Refresh tickets manually
   */
  const refreshTickets = useCallback(() => fetchTickets(true), [fetchTickets]);

  /**
   * Initial load and auto-refresh setup
   */
  useEffect(() => {
    fetchTickets();

    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchTickets(false);
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchTickets, autoRefresh, refreshInterval]);

  return {
    tickets,
    loading,
    updateTicket,
    moveTicket,
    refreshTickets,
    createTicket,
    deleteTicket,
    searchTickets,
    getTicketsByStatus,
  };
};
