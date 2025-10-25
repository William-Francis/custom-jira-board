/**
 * Utility functions for data validation and transformation
 */

import { Ticket, TicketStatus, TicketPriority, ValidationError } from '../types';

/**
 * Validate ticket data
 */
export const validateTicket = (ticket: Partial<Ticket>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!ticket.title || ticket.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Title is required',
    });
  }

  if (ticket.title && ticket.title.length > 255) {
    errors.push({
      field: 'title',
      message: 'Title must be less than 255 characters',
    });
  }

  if (ticket.description && ticket.description.length > 1000) {
    errors.push({
      field: 'description',
      message: 'Description must be less than 1000 characters',
    });
  }

  if (ticket.storyPoints && (ticket.storyPoints < 1 || ticket.storyPoints > 100)) {
    errors.push({
      field: 'storyPoints',
      message: 'Story points must be between 1 and 100',
    });
  }

  return errors;
};

/**
 * Transform ticket data for API
 */
export const transformTicketForApi = (ticket: Partial<Ticket>): Partial<Ticket> => {
  return {
    ...ticket,
    title: ticket.title?.trim(),
    description: ticket.description?.trim(),
    labels: ticket.labels?.map(label => label.trim()).filter(Boolean),
  };
};

/**
 * Format ticket key
 */
export const formatTicketKey = (projectKey: string, ticketNumber: number): string => {
  return `${projectKey}-${String(ticketNumber).padStart(3, '0')}`;
};

/**
 * Parse ticket key
 */
export const parseTicketKey = (key: string): { projectKey: string; ticketNumber: number } | null => {
  const match = key.match(/^([A-Z]+)-(\d+)$/);
  if (!match) return null;

  return {
    projectKey: match[1],
    ticketNumber: parseInt(match[2], 10),
  };
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority: TicketPriority): string => {
  const colors = {
    LOWEST: '#6b778c',
    LOW: '#36b37e',
    MEDIUM: '#ffab00',
    HIGH: '#ff5630',
    HIGHEST: '#de350b',
  };
  return colors[priority];
};

/**
 * Get status color
 */
export const getStatusColor = (status: TicketStatus): string => {
  const colors = {
    TODO: '#6b778c',
    IN_PROGRESS: '#0052cc',
    IN_REVIEW: '#ffab00',
    DONE: '#36b37e',
  };
  return colors[status];
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * Format relative time
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return formatDate(date);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generate unique ID
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * Check if two objects are equal
 */
export const isEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!isEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return false;
};

/**
 * Sanitize HTML string
 */
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Escape HTML string
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};
