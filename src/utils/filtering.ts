/**
 * Advanced filtering and search utilities
 * Provides comprehensive ticket filtering capabilities
 */

import { Ticket, TicketFilters, TicketSortOptions, SearchConfig, FilterPreset, FilterGroup } from '../types';

/**
 * Filter utilities for ticket operations
 */
export class TicketFilterUtils {
  /**
   * Apply filters to a list of tickets
   */
  static filterTickets(tickets: Ticket[], filters: TicketFilters): Ticket[] {
    if (!filters || Object.keys(filters).length === 0) {
      return tickets;
    }

    return tickets.filter(ticket => {
      // Text-based filters
      if (filters.search && !this.matchesSearch(ticket, filters.search)) {
        return false;
      }

      if (filters.title && !this.matchesText(ticket.title, filters.title)) {
        return false;
      }

      if (filters.description && ticket.description && !this.matchesText(ticket.description, filters.description)) {
        return false;
      }

      // Status filter
      if (filters.status) {
        const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
        if (!statusArray.includes(ticket.status)) {
          return false;
        }
      }

      // Priority filter
      if (filters.priority) {
        const priorityArray = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
        if (!priorityArray.includes(ticket.priority)) {
          return false;
        }
      }

      // Assignee filter
      if (filters.assignee) {
        const assigneeArray = Array.isArray(filters.assignee) ? filters.assignee : [filters.assignee];
        if (!ticket.assignee || !assigneeArray.includes(ticket.assignee.id)) {
          return false;
        }
      }

      // Reporter filter
      if (filters.reporter) {
        const reporterArray = Array.isArray(filters.reporter) ? filters.reporter : [filters.reporter];
        if (!reporterArray.includes(ticket.reporter.id)) {
          return false;
        }
      }

      // Labels filter
      if (filters.labels) {
        const labelsArray = Array.isArray(filters.labels) ? filters.labels : [filters.labels];
        if (!ticket.labels || !labelsArray.some(label => ticket.labels!.includes(label))) {
          return false;
        }
      }

      // Date filters
      if (filters.createdAfter && ticket.created < filters.createdAfter) {
        return false;
      }

      if (filters.createdBefore && ticket.created > filters.createdBefore) {
        return false;
      }

      if (filters.updatedAfter && ticket.updated < filters.updatedAfter) {
        return false;
      }

      if (filters.updatedBefore && ticket.updated > filters.updatedBefore) {
        return false;
      }

      // Story points filter
      if (filters.storyPointsMin !== undefined && (!ticket.storyPoints || ticket.storyPoints < filters.storyPointsMin)) {
        return false;
      }

      if (filters.storyPointsMax !== undefined && (!ticket.storyPoints || ticket.storyPoints > filters.storyPointsMax)) {
        return false;
      }

      // Sprint filter
      if (filters.sprint) {
        const sprintArray = Array.isArray(filters.sprint) ? filters.sprint : [filters.sprint];
        if (!ticket.sprint || !sprintArray.includes(ticket.sprint.id)) {
          return false;
        }
      }

      // Epic filter
      if (filters.epic) {
        const epicArray = Array.isArray(filters.epic) ? filters.epic : [filters.epic];
        if (!ticket.epic || !epicArray.includes(ticket.epic)) {
          return false;
        }
      }

      // Resolution filter
      if (filters.resolution) {
        const resolutionArray = Array.isArray(filters.resolution) ? filters.resolution : [filters.resolution];
        if (!ticket.resolution || !resolutionArray.includes(ticket.resolution)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort tickets based on sort options
   */
  static sortTickets(tickets: Ticket[], sortOptions: TicketSortOptions): Ticket[] {
    return [...tickets].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortOptions.field) {
        case 'created':
          aValue = a.created.getTime();
          bValue = b.created.getTime();
          break;
        case 'updated':
          aValue = a.updated.getTime();
          bValue = b.updated.getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { 'LOWEST': 1, 'LOW': 2, 'MEDIUM': 3, 'HIGH': 4, 'HIGHEST': 5 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'status':
          const statusOrder = { 'TODO': 1, 'IN_PROGRESS': 2, 'IN_REVIEW': 3, 'DONE': 4 };
          aValue = statusOrder[a.status as keyof typeof statusOrder];
          bValue = statusOrder[b.status as keyof typeof statusOrder];
          break;
        case 'assignee':
          aValue = a.assignee?.displayName || '';
          bValue = b.assignee?.displayName || '';
          break;
        case 'storyPoints':
          aValue = a.storyPoints || 0;
          bValue = b.storyPoints || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortOptions.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOptions.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Apply advanced search configuration
   */
  static searchTickets(tickets: Ticket[], searchConfig: SearchConfig): Ticket[] {
    if (!searchConfig.query.trim()) {
      return tickets;
    }

    const query = searchConfig.caseSensitive 
      ? searchConfig.query 
      : searchConfig.query.toLowerCase();

    return tickets.filter(ticket => {
      return searchConfig.fields.some(field => {
        let fieldValue: string;

        switch (field) {
          case 'title':
            fieldValue = ticket.title;
            break;
          case 'description':
            fieldValue = ticket.description || '';
            break;
          case 'labels':
            fieldValue = ticket.labels?.join(' ') || '';
            break;
          case 'key':
            fieldValue = ticket.key;
            break;
          default:
            return false;
        }

        if (!searchConfig.caseSensitive) {
          fieldValue = fieldValue.toLowerCase();
        }

        if (searchConfig.exactMatch) {
          return fieldValue === query;
        }

        if (searchConfig.useRegex) {
          try {
            const regex = new RegExp(query, searchConfig.caseSensitive ? 'g' : 'gi');
            return regex.test(fieldValue);
          } catch {
            // Fallback to simple contains if regex is invalid
            return fieldValue.includes(query);
          }
        }

        return fieldValue.includes(query);
      });
    });
  }

  /**
   * Get filter summary for display
   */
  static getFilterSummary(filters: TicketFilters): string[] {
    const summary: string[] = [];

    if (filters.search) {
      summary.push(`Search: "${filters.search}"`);
    }

    if (filters.status) {
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
      summary.push(`Status: ${statusArray.join(', ')}`);
    }

    if (filters.priority) {
      const priorityArray = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
      summary.push(`Priority: ${priorityArray.join(', ')}`);
    }

    if (filters.assignee) {
      const assigneeArray = Array.isArray(filters.assignee) ? filters.assignee : [filters.assignee];
      summary.push(`Assignee: ${assigneeArray.length} selected`);
    }

    if (filters.labels) {
      const labelsArray = Array.isArray(filters.labels) ? filters.labels : [filters.labels];
      summary.push(`Labels: ${labelsArray.join(', ')}`);
    }

    if (filters.createdAfter || filters.createdBefore) {
      summary.push('Date range filtered');
    }

    if (filters.storyPointsMin !== undefined || filters.storyPointsMax !== undefined) {
      summary.push('Story points filtered');
    }

    return summary;
  }

  /**
   * Check if filters are active
   */
  static hasActiveFilters(filters: TicketFilters): boolean {
    return Object.keys(filters).length > 0 && Object.values(filters).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (value instanceof Date) {
        return true;
      }
      return value !== undefined && value !== null && value !== '';
    });
  }

  /**
   * Clear all filters
   */
  static clearFilters(): TicketFilters {
    return {};
  }

  /**
   * Helper method to match text
   */
  private static matchesText(text: string, searchTerm: string): boolean {
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  }

  /**
   * Helper method to match search query
   */
  private static matchesSearch(ticket: Ticket, searchTerm: string): boolean {
    const searchLower = searchTerm.toLowerCase();
    
    return (
      ticket.title.toLowerCase().includes(searchLower) ||
      (ticket.description && ticket.description.toLowerCase().includes(searchLower)) ||
      ticket.key.toLowerCase().includes(searchLower) ||
      (ticket.labels && ticket.labels.some(label => label.toLowerCase().includes(searchLower))) ||
      (ticket.assignee && ticket.assignee.displayName.toLowerCase().includes(searchLower)) ||
      ticket.reporter.displayName.toLowerCase().includes(searchLower)
    );
  }
}

/**
 * Default filter presets
 */
export const DEFAULT_FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'my-tickets',
    name: 'My Tickets',
    description: 'Tickets assigned to me',
    filters: {},
    sort: undefined,
    isDefault: true,
  },
  {
    id: 'high-priority',
    name: 'High Priority',
    description: 'High and highest priority tickets',
    filters: {
      priority: ['HIGH', 'HIGHEST'],
    },
    sort: undefined,
  },
  {
    id: 'recent-updates',
    name: 'Recently Updated',
    description: 'Tickets updated in the last 7 days',
    filters: {
      updatedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    sort: undefined,
  },
  {
    id: 'unassigned',
    name: 'Unassigned',
    description: 'Tickets without an assignee',
    filters: {},
    sort: undefined,
  },
];

/**
 * Quick filter groups
 */
export const QUICK_FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'status',
    name: 'Status',
    filters: [
      { id: 'todo', label: 'To Do', filters: { status: 'TODO' }, color: '#6b778c' },
      { id: 'in-progress', label: 'In Progress', filters: { status: 'IN_PROGRESS' }, color: '#0052cc' },
      { id: 'in-review', label: 'In Review', filters: { status: 'IN_REVIEW' }, color: '#ff991f' },
      { id: 'done', label: 'Done', filters: { status: 'DONE' }, color: '#00875a' },
    ],
    defaultExpanded: true,
  },
  {
    id: 'priority',
    name: 'Priority',
    filters: [
      { id: 'highest', label: 'Highest', filters: { priority: 'HIGHEST' }, color: '#de350b' },
      { id: 'high', label: 'High', filters: { priority: 'HIGH' }, color: '#ff5630' },
      { id: 'medium', label: 'Medium', filters: { priority: 'MEDIUM' }, color: '#ffab00' },
      { id: 'low', label: 'Low', filters: { priority: 'LOW' }, color: '#36b37e' },
      { id: 'lowest', label: 'Lowest', filters: { priority: 'LOWEST' }, color: '#006644' },
    ],
    defaultExpanded: false,
  },
];
