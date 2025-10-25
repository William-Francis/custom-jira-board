/**
 * Ticket service for managing ticket-related operations
 * Provides both mock and API implementations
 */

import { Ticket, TicketStatus, TicketPriority } from '../types';
import { mockTickets, simulateApiDelay } from './mockData';
import { shouldUseMockApi } from '../config';

/**
 * Ticket service interface
 */
export interface TicketService {
  getTickets: (boardId: string, params?: Record<string, string | number | boolean>) => Promise<Ticket[]>;
  getTicket: (ticketId: string) => Promise<Ticket>;
  createTicket: (ticket: Partial<Ticket>) => Promise<Ticket>;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => Promise<Ticket>;
  deleteTicket: (ticketId: string) => Promise<void>;
  moveTicket: (ticketId: string, newStatus: TicketStatus) => Promise<Ticket>;
  assignTicket: (ticketId: string, assigneeId: string) => Promise<Ticket>;
  updateTicketPriority: (ticketId: string, priority: TicketPriority) => Promise<Ticket>;
}

/**
 * Mock ticket service implementation
 */
class MockTicketService implements TicketService {
  private tickets: Ticket[] = [...mockTickets];

  /**
   * Get all tickets for a board
   */
  async getTickets(_boardId: string, params?: Record<string, string | number | boolean>): Promise<Ticket[]> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.05)) {
    //   throw new Error('Failed to fetch tickets');
    // }

    let filteredTickets = [...this.tickets];

    // Apply filters if provided
    if (params) {
      if (params.status) {
        filteredTickets = filteredTickets.filter(t => t.status === params.status);
      }
      if (params.assignee) {
        filteredTickets = filteredTickets.filter(t => t.assignee?.id === params.assignee);
      }
      if (params.priority) {
        filteredTickets = filteredTickets.filter(t => t.priority === params.priority);
      }
      if (params.labels) {
        const labels = Array.isArray(params.labels) ? params.labels : [params.labels];
        filteredTickets = filteredTickets.filter(t => 
          t.labels?.some(label => labels.includes(label))
        );
      }
    }

    return filteredTickets;
  }

  /**
   * Get a specific ticket by ID
   */
  async getTicket(ticketId: string): Promise<Ticket> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.05)) {
    //   throw new Error('Failed to fetch ticket');
    // }

    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    return ticket;
  }

  /**
   * Create a new ticket
   */
  async createTicket(ticketData: Partial<Ticket>): Promise<Ticket> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.1)) {
    //   throw new Error('Failed to create ticket');
    // }

    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      key: `TICKET-${Date.now()}`,
      title: ticketData.title || 'New Ticket',
      description: ticketData.description || '',
      status: ticketData.status || 'TODO',
      priority: ticketData.priority || 'MEDIUM',
      storyPoints: ticketData.storyPoints,
      assignee: ticketData.assignee,
      reporter: ticketData.reporter || { id: 'user-1', name: 'System', email: 'system@company.com', displayName: 'System' },
      labels: ticketData.labels || [],
      created: new Date(),
      updated: new Date(),
    };

    this.tickets.push(newTicket);
    return newTicket;
  }

  /**
   * Update an existing ticket
   */
  async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.1)) {
    //   throw new Error('Failed to update ticket');
    // }

    const ticketIndex = this.tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    const updatedTicket = {
      ...this.tickets[ticketIndex],
      ...updates,
      updated: new Date(),
    };

    this.tickets[ticketIndex] = updatedTicket;
    return updatedTicket;
  }

  /**
   * Delete a ticket
   */
  async deleteTicket(ticketId: string): Promise<void> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.1)) {
    //   throw new Error('Failed to delete ticket');
    // }

    const ticketIndex = this.tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    this.tickets.splice(ticketIndex, 1);
  }

  /**
   * Move a ticket to a new status
   */
  async moveTicket(ticketId: string, newStatus: TicketStatus): Promise<Ticket> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.1)) {
    //   throw new Error('Failed to move ticket');
    // }

    const ticketIndex = this.tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    const updatedTicket = {
      ...this.tickets[ticketIndex],
      status: newStatus,
      updated: new Date(),
    };

    this.tickets[ticketIndex] = updatedTicket;
    return updatedTicket;
  }

  /**
   * Assign a ticket to a user
   */
  async assignTicket(ticketId: string, assigneeId: string): Promise<Ticket> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.1)) {
    //   throw new Error('Failed to assign ticket');
    // }

    const ticketIndex = this.tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    const updatedTicket = {
      ...this.tickets[ticketIndex],
      assignee: { id: assigneeId, name: '', email: '', displayName: '' },
      updated: new Date(),
    };

    this.tickets[ticketIndex] = updatedTicket;
    return updatedTicket;
  }

  /**
   * Update ticket priority
   */
  async updateTicketPriority(ticketId: string, priority: TicketPriority): Promise<Ticket> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.1)) {
    //   throw new Error('Failed to update ticket priority');
    // }

    const ticketIndex = this.tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    const updatedTicket = {
      ...this.tickets[ticketIndex],
      priority,
      updated: new Date(),
    };

    this.tickets[ticketIndex] = updatedTicket;
    return updatedTicket;
  }
}

/**
 * API ticket service implementation
 */
class ApiTicketService implements TicketService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api';
  }

  async getTickets(boardId: string, params?: Record<string, string | number | boolean>): Promise<Ticket[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
    }
    
    const response = await fetch(`${this.baseUrl}/boards/${boardId}/tickets?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tickets: ${response.statusText}`);
    }
    return response.json();
  }

  async getTicket(ticketId: string): Promise<Ticket> {
    const response = await fetch(`${this.baseUrl}/tickets/${ticketId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ticket: ${response.statusText}`);
    }
    return response.json();
  }

  async createTicket(ticket: Partial<Ticket>): Promise<Ticket> {
    const response = await fetch(`${this.baseUrl}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticket),
    });
    if (!response.ok) {
      throw new Error(`Failed to create ticket: ${response.statusText}`);
    }
    return response.json();
  }

  async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket> {
    const response = await fetch(`${this.baseUrl}/tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update ticket: ${response.statusText}`);
    }
    return response.json();
  }

  async deleteTicket(ticketId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tickets/${ticketId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete ticket: ${response.statusText}`);
    }
  }

  async moveTicket(ticketId: string, newStatus: TicketStatus): Promise<Ticket> {
    const response = await fetch(`${this.baseUrl}/tickets/${ticketId}/move`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) {
      throw new Error(`Failed to move ticket: ${response.statusText}`);
    }
    return response.json();
  }

  async assignTicket(ticketId: string, assigneeId: string): Promise<Ticket> {
    const response = await fetch(`${this.baseUrl}/tickets/${ticketId}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assigneeId }),
    });
    if (!response.ok) {
      throw new Error(`Failed to assign ticket: ${response.statusText}`);
    }
    return response.json();
  }

  async updateTicketPriority(ticketId: string, priority: TicketPriority): Promise<Ticket> {
    const response = await fetch(`${this.baseUrl}/tickets/${ticketId}/priority`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priority }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update ticket priority: ${response.statusText}`);
    }
    return response.json();
  }
}

/**
 * Create ticket service instance
 * Use mock service in development, API service in production
 */
export const ticketService: TicketService = shouldUseMockApi()
  ? new MockTicketService()
  : new ApiTicketService();

/**
 * Export service classes for testing
 */
export { MockTicketService, ApiTicketService };