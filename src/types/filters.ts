/**
 * Filter and search types for advanced ticket filtering
 */

import { TicketStatus, TicketPriority } from './ticket';

/**
 * Filter criteria for tickets
 */
export interface TicketFilters {
  // Text-based filters
  search?: string;
  title?: string;
  description?: string;
  
  // Status and priority filters
  status?: TicketStatus | TicketStatus[];
  priority?: TicketPriority | TicketPriority[];
  
  // User-based filters
  assignee?: string | string[]; // User IDs
  reporter?: string | string[]; // User IDs
  
  // Label and component filters
  labels?: string | string[];
  components?: string | string[];
  
  // Date-based filters
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
  
  // Story points filter
  storyPointsMin?: number;
  storyPointsMax?: number;
  
  // Sprint filter
  sprint?: string | string[]; // Sprint IDs
  
  // Epic filter
  epic?: string | string[];
  
  // Resolution filter
  resolution?: string | string[];
}

/**
 * Sort options for tickets
 */
export interface TicketSortOptions {
  field: 'created' | 'updated' | 'title' | 'priority' | 'status' | 'assignee' | 'storyPoints';
  direction: 'asc' | 'desc';
}

/**
 * Filter preset configurations
 */
export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: TicketFilters;
  sort?: TicketSortOptions;
  isDefault?: boolean;
}

/**
 * Advanced search configuration
 */
export interface SearchConfig {
  query: string;
  fields: ('title' | 'description' | 'labels' | 'key')[];
  caseSensitive?: boolean;
  exactMatch?: boolean;
  useRegex?: boolean;
}

/**
 * Filter state management
 */
export interface FilterState {
  activeFilters: TicketFilters;
  activeSort?: TicketSortOptions;
  activePreset?: string;
  searchConfig?: SearchConfig;
  isFiltered: boolean;
  resultCount: number;
  totalCount: number;
}

/**
 * Filter action types
 */
export type FilterAction = 
  | { type: 'SET_FILTERS'; payload: TicketFilters }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SORT'; payload: TicketSortOptions }
  | { type: 'SET_SEARCH'; payload: SearchConfig }
  | { type: 'APPLY_PRESET'; payload: string }
  | { type: 'UPDATE_RESULT_COUNT'; payload: { resultCount: number; totalCount: number } };

/**
 * Quick filter options
 */
export interface QuickFilter {
  id: string;
  label: string;
  icon?: string;
  filters: Partial<TicketFilters>;
  color?: string;
}

/**
 * Filter group for organizing filters
 */
export interface FilterGroup {
  id: string;
  name: string;
  filters: QuickFilter[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}
