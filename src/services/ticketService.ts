/**
 * Ticket service for managing ticket-related operations
 * Provides both mock and API implementations
 */

import { Ticket, TicketStatus, TicketPriority } from '../types';
import { mockTickets, simulateApiDelay } from './mockData';
import { shouldUseMockApi } from '../config';
import { jiraClient } from './jiraClient';

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
 * API ticket service implementation (Jira integration)
 */
class ApiTicketService implements TicketService {
  private async transformJiraIssueToTicket(jiraIssue: any): Promise<Ticket> {
    // Safely extract fields with fallbacks
    const fields = jiraIssue.fields || {};
    
    return {
      id: jiraIssue.id || jiraIssue.key || `unknown-${Date.now()}`,
      key: jiraIssue.key || 'UNKNOWN',
      title: fields.summary || 'Untitled',
      description: fields.description || '',
      status: this.mapJiraStatusToTicketStatus(fields.status?.name),
      priority: this.mapJiraPriorityToTicketPriority(fields.priority?.name),
      assignee: fields.assignee ? {
        id: fields.assignee.accountId || 'unknown',
        name: fields.assignee.displayName || 'Unknown',
        email: fields.assignee.emailAddress || '',
        avatarUrl: fields.assignee.avatarUrls?.['48x48'],
      } : undefined,
      reporter: fields.reporter ? {
        id: fields.reporter.accountId || 'unknown',
        name: fields.reporter.displayName || 'Unknown',
      } : undefined,
      labels: Array.isArray(fields.labels) ? fields.labels : [],
      createdAt: fields.created || new Date().toISOString(),
      updatedAt: fields.updated || new Date().toISOString(),
      issueType: fields.issuetype?.name || 'Task',
      epic: fields.epicLink || (fields.parent?.fields?.issuetype?.name === 'Epic' ? fields.parent?.key : undefined),
      epicName: fields.parent?.fields?.issuetype?.name === 'Epic' ? fields.parent?.fields?.summary : undefined,
    };
  }

  private mapJiraStatusToTicketStatus(jiraStatus?: string): TicketStatus {
    const statusMap: Record<string, TicketStatus> = {
      'To Do': 'TODO',
      'In Progress': 'IN_PROGRESS',
      'Done': 'DONE',
      'Backlog': 'BACKLOG',
      'Review': 'REVIEW',
      'In Review': 'REVIEW',
      'Testing': 'TESTING',
      'Blocked': 'BLOCKED',
    };
    return (jiraStatus && statusMap[jiraStatus]) || 'TODO';
  }

  private mapJiraPriorityToTicketPriority(jiraPriority?: string): TicketPriority {
    const priorityMap: Record<string, TicketPriority> = {
      'Highest': 'CRITICAL',
      'High': 'HIGH',
      'Medium': 'MEDIUM',
      'Low': 'LOW',
      'Lowest': 'LOWEST',
    };
    return (jiraPriority && priorityMap[jiraPriority]) || 'MEDIUM';
  }

  constructor() {
    // Using Jira client
  }

  async getTickets(boardId: string, params?: Record<string, string | number | boolean>): Promise<Ticket[]> {
    try {
      // Fetch issues from Jira board
      const jiraIssues = await jiraClient.getBoardIssues(boardId, params as Record<string, string | number>);
      
      // Transform Jira issues to tickets
      return Promise.all(jiraIssues.map(issue => this.transformJiraIssueToTicket(issue)));
    } catch (error) {
      console.error('Failed to fetch tickets from Jira:', error);
      throw error;
    }
  }

  async getTicket(ticketId: string): Promise<Ticket> {
    try {
      const jiraIssue = await jiraClient.getIssue(ticketId);
      return this.transformJiraIssueToTicket(jiraIssue);
    } catch (error) {
      console.error('Failed to fetch ticket from Jira:', error);
      throw error;
    }
  }

  async createTicket(ticket: Partial<Ticket>): Promise<Ticket> {
    console.warn('Create ticket not yet implemented for Jira API');
    throw new Error('Creating tickets is not yet implemented in this Jira integration');
  }

  async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket> {
    console.warn('Update ticket not yet implemented for Jira API');
    throw new Error('Updating tickets is not yet implemented in this Jira integration');
  }

  async deleteTicket(ticketId: string): Promise<void> {
    console.warn('Delete ticket not yet implemented for Jira API');
    throw new Error('Deleting tickets is not yet implemented in this Jira integration');
  }

  async moveTicket(ticketId: string, newStatus: TicketStatus): Promise<Ticket> {
    try {
      // Get the ticket first to get its key
      const ticket = await this.getTicket(ticketId);
      const issueKey = ticket.key;
      
      // Map TicketStatus to Jira status names
      const statusMap: Record<TicketStatus, string> = {
        'TODO': 'To Do',
        'IN_PROGRESS': 'In Progress',
        'DONE': 'Done',
        'BACKLOG': 'Backlog',
        'REVIEW': 'Review',
        'TESTING': 'Testing',
        'BLOCKED': 'Blocked',
      };
      
      const jiraStatusName = statusMap[newStatus];
      
      // Use the Jira client to transition the issue
      await jiraClient.updateIssueStatus(issueKey, jiraStatusName);
      
      // Refresh the ticket to get the updated status
      return await this.getTicket(ticketId);
    } catch (error) {
      console.error('Failed to move ticket:', error);
      throw error;
    }
  }

  async assignTicket(ticketId: string, assigneeId: string): Promise<Ticket> {
    console.warn('Assign ticket not yet implemented for Jira API');
    throw new Error('Assigning tickets is not yet implemented in this Jira integration');
  }

  async updateTicketPriority(ticketId: string, priority: TicketPriority): Promise<Ticket> {
    console.warn('Update priority not yet implemented for Jira API');
    throw new Error('Updating ticket priority is not yet implemented in this Jira integration');
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