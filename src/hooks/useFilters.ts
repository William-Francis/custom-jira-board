/**
 * Custom hook for managing ticket filters and search
 * Provides comprehensive filtering state management
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Ticket, TicketFilters, TicketSortOptions, SearchConfig, FilterState, FilterPreset } from '../types';
import { TicketFilterUtils, DEFAULT_FILTER_PRESETS } from '../utils/filtering';

/**
 * Configuration for the useFilters hook
 */
export interface UseFiltersConfig {
  tickets: Ticket[];
  initialFilters?: TicketFilters;
  initialSort?: TicketSortOptions;
  presets?: FilterPreset[];
  onFiltersChange?: (filters: TicketFilters) => void;
  onSortChange?: (sort: TicketSortOptions) => void;
  onSearchChange?: (search: SearchConfig) => void;
}

/**
 * Return type for the useFilters hook
 */
export interface UseFiltersReturn {
  // Filter state
  filterState: FilterState;
  
  // Filtered and sorted tickets
  filteredTickets: Ticket[];
  
  // Filter actions
  setFilters: (filters: TicketFilters) => void;
  updateFilters: (updates: Partial<TicketFilters>) => void;
  clearFilters: () => void;
  
  // Sort actions
  setSort: (sort: TicketSortOptions) => void;
  toggleSort: (field: TicketSortOptions['field']) => void;
  
  // Search actions
  setSearch: (search: SearchConfig) => void;
  clearSearch: () => void;
  
  // Preset actions
  applyPreset: (presetId: string) => void;
  saveAsPreset: (name: string, description?: string) => void;
  
  // Quick filter actions
  toggleQuickFilter: (filterId: string, filters: Partial<TicketFilters>) => void;
  
  // Utility functions
  getFilterSummary: () => string[];
  hasActiveFilters: () => boolean;
  resetToDefault: () => void;
}

/**
 * Custom hook for managing ticket filters
 */
export const useFilters = (config: UseFiltersConfig): UseFiltersReturn => {
  const {
    tickets,
    initialFilters = {},
    initialSort,
    presets = DEFAULT_FILTER_PRESETS,
    onFiltersChange,
    onSortChange,
    onSearchChange,
  } = config;

  // State management
  const [activeFilters, setActiveFilters] = useState<TicketFilters>(initialFilters);
  const [activeSort, setActiveSort] = useState<TicketSortOptions | undefined>(initialSort);
  const [activePreset, setActivePreset] = useState<string | undefined>();
  const [searchConfig, setSearchConfig] = useState<SearchConfig | undefined>();
  const [customPresets, setCustomPresets] = useState<FilterPreset[]>([]);

  // Memoized filtered tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Apply search first
    if (searchConfig) {
      result = TicketFilterUtils.searchTickets(result, searchConfig);
    }

    // Apply filters
    if (TicketFilterUtils.hasActiveFilters(activeFilters)) {
      result = TicketFilterUtils.filterTickets(result, activeFilters);
    }

    // Apply sorting
    if (activeSort) {
      result = TicketFilterUtils.sortTickets(result, activeSort);
    }

    return result;
  }, [tickets, activeFilters, activeSort, searchConfig]);

  // Filter state
  const filterState: FilterState = useMemo(() => ({
    activeFilters,
    activeSort,
    activePreset,
    searchConfig,
    isFiltered: TicketFilterUtils.hasActiveFilters(activeFilters) || !!searchConfig,
    resultCount: filteredTickets.length,
    totalCount: tickets.length,
  }), [activeFilters, activeSort, activePreset, searchConfig, filteredTickets.length, tickets.length]);

  // Filter actions
  const setFilters = useCallback((filters: TicketFilters) => {
    setActiveFilters(filters);
    setActivePreset(undefined);
    onFiltersChange?.(filters);
  }, [onFiltersChange]);

  const updateFilters = useCallback((updates: Partial<TicketFilters>) => {
    const newFilters = { ...activeFilters, ...updates };
    setActiveFilters(newFilters);
    setActivePreset(undefined);
    onFiltersChange?.(newFilters);
  }, [activeFilters, onFiltersChange]);

  const clearFilters = useCallback(() => {
    const clearedFilters = TicketFilterUtils.clearFilters();
    setActiveFilters(clearedFilters);
    setActivePreset(undefined);
    onFiltersChange?.(clearedFilters);
  }, [onFiltersChange]);

  // Sort actions
  const setSort = useCallback((sort: TicketSortOptions) => {
    setActiveSort(sort);
    onSortChange?.(sort);
  }, [onSortChange]);

  const toggleSort = useCallback((field: TicketSortOptions['field']) => {
    const newSort: TicketSortOptions = {
      field,
      direction: activeSort?.field === field && activeSort.direction === 'asc' ? 'desc' : 'asc',
    };
    setActiveSort(newSort);
    onSortChange?.(newSort);
  }, [activeSort, onSortChange]);

  // Search actions
  const setSearch = useCallback((search: SearchConfig) => {
    setSearchConfig(search);
    onSearchChange?.(search);
  }, [onSearchChange]);

  const clearSearch = useCallback(() => {
    setSearchConfig(undefined);
    onSearchChange?.(undefined as any);
  }, [onSearchChange]);

  // Preset actions
  const applyPreset = useCallback((presetId: string) => {
    const allPresets = [...presets, ...customPresets];
    const preset = allPresets.find(p => p.id === presetId);
    
    if (preset) {
      setActiveFilters(preset.filters);
      if (preset.sort) {
        setActiveSort(preset.sort);
      }
      setActivePreset(presetId);
      onFiltersChange?.(preset.filters);
      if (preset.sort) {
        onSortChange?.(preset.sort);
      }
    }
  }, [presets, customPresets, onFiltersChange, onSortChange]);

  const saveAsPreset = useCallback((name: string, description?: string) => {
    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name,
      description,
      filters: activeFilters,
      sort: activeSort,
    };
    
    setCustomPresets(prev => [...prev, newPreset]);
  }, [activeFilters, activeSort]);

  // Quick filter actions
  const toggleQuickFilter = useCallback((_filterId: string, filters: Partial<TicketFilters>) => {
    // Check if this filter is already active
    const isActive = Object.entries(filters).every(([key, value]) => {
      const currentValue = activeFilters[key as keyof TicketFilters];
      
      if (Array.isArray(value)) {
        return Array.isArray(currentValue) && 
               value.every(v => (currentValue as any[]).includes(v));
      }
      
      return currentValue === value;
    });

    if (isActive) {
      // Remove the filter
      const newFilters = { ...activeFilters };
      Object.keys(filters).forEach(key => {
        delete newFilters[key as keyof TicketFilters];
      });
      setActiveFilters(newFilters);
      onFiltersChange?.(newFilters);
    } else {
      // Add the filter
      updateFilters(filters);
    }
  }, [activeFilters, updateFilters, onFiltersChange]);

  // Utility functions
  const getFilterSummary = useCallback(() => {
    return TicketFilterUtils.getFilterSummary(activeFilters);
  }, [activeFilters]);

  const hasActiveFilters = useCallback(() => {
    return TicketFilterUtils.hasActiveFilters(activeFilters) || !!searchConfig;
  }, [activeFilters, searchConfig]);

  const resetToDefault = useCallback(() => {
    const defaultPreset = presets.find(p => p.isDefault);
    if (defaultPreset) {
      applyPreset(defaultPreset.id);
    } else {
      clearFilters();
      setActiveSort(undefined);
      clearSearch();
    }
  }, [presets, applyPreset, clearFilters, clearSearch]);

  // Auto-save filters to localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('jira-board-filters');
    if (savedFilters && !TicketFilterUtils.hasActiveFilters(initialFilters)) {
      try {
        const parsed = JSON.parse(savedFilters);
        setActiveFilters(parsed.filters || {});
        setActiveSort(parsed.sort);
        setSearchConfig(parsed.search);
      } catch {
        // Ignore invalid saved data
      }
    }
  }, [initialFilters]);

  useEffect(() => {
    const filterData = {
      filters: activeFilters,
      sort: activeSort,
      search: searchConfig,
    };
    localStorage.setItem('jira-board-filters', JSON.stringify(filterData));
  }, [activeFilters, activeSort, searchConfig]);

  return {
    filterState,
    filteredTickets,
    setFilters,
    updateFilters,
    clearFilters,
    setSort,
    toggleSort,
    setSearch,
    clearSearch,
    applyPreset,
    saveAsPreset,
    toggleQuickFilter,
    getFilterSummary,
    hasActiveFilters,
    resetToDefault,
  };
};
