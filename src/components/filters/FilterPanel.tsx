/**
 * Advanced Filter Panel Component
 * Provides comprehensive filtering and search capabilities
 */

import React, { useState, useCallback } from 'react';
import {
  TicketFilters,
  TicketSortOptions,
  SearchConfig,
  FilterPreset,
  FilterGroup,
} from '../../types';
import './filter-panel.css';

/**
 * Filter Panel Props
 */
export interface FilterPanelProps {
  // Filter state
  activeFilters: TicketFilters;
  activeSort?: TicketSortOptions;
  searchConfig?: SearchConfig;
  isFiltered: boolean;
  resultCount: number;
  totalCount: number;

  // Available options
  presets: FilterPreset[];
  quickFilterGroups: FilterGroup[];
  availableLabels: string[];
  availableAssignees: Array<{ id: string; name: string; displayName: string }>;

  // Actions
  onFiltersChange: (filters: TicketFilters) => void;
  onSortChange: (sort: TicketSortOptions) => void;
  onSearchChange: (search: SearchConfig) => void;
  onPresetApply: (presetId: string) => void;
  onPresetSave: (name: string, description?: string) => void;
  onQuickFilterToggle: (
    filterId: string,
    filters: Partial<TicketFilters>
  ) => void;
  onClearAll: () => void;

  // UI props
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Filter Panel Component
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  activeFilters,
  activeSort,
  searchConfig,
  isFiltered,
  resultCount,
  totalCount,
  presets,
  quickFilterGroups,
  availableLabels,
  availableAssignees,
  onFiltersChange,
  onSortChange,
  onSearchChange,
  onPresetApply,
  onPresetSave,
  onQuickFilterToggle,
  onClearAll,
  isOpen,
  onToggle,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<
    'filters' | 'search' | 'sort' | 'presets'
  >('filters');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');

  /**
   * Handle search input change
   */
  const handleSearchChange = useCallback(
    (query: string) => {
      if (query.trim()) {
        onSearchChange({
          query: query.trim(),
          fields: ['title', 'description', 'labels', 'key'],
          caseSensitive: false,
          exactMatch: false,
          useRegex: false,
        });
      } else {
        onSearchChange(undefined as any);
      }
    },
    [onSearchChange]
  );

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback(
    (key: keyof TicketFilters, value: any) => {
      const newFilters = { ...activeFilters, [key]: value };
      onFiltersChange(newFilters);
    },
    [activeFilters, onFiltersChange]
  );

  /**
   * Handle sort field change
   */
  const handleSortFieldChange = useCallback(
    (field: TicketSortOptions['field']) => {
      const newSort: TicketSortOptions = {
        field,
        direction:
          activeSort?.field === field && activeSort.direction === 'asc'
            ? 'desc'
            : 'asc',
      };
      onSortChange(newSort);
    },
    [activeSort, onSortChange]
  );

  /**
   * Handle preset save
   */
  const handlePresetSave = useCallback(() => {
    if (newPresetName.trim()) {
      onPresetSave(
        newPresetName.trim(),
        newPresetDescription.trim() || undefined
      );
      setNewPresetName('');
      setNewPresetDescription('');
    }
  }, [newPresetName, newPresetDescription, onPresetSave]);

  const panelClasses = [
    'filter-panel',
    isOpen && 'filter-panel--open',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={panelClasses}>
      {/* Filter Panel Header */}
      <div className='filter-panel__header'>
        <div className='filter-panel__title'>
          <h3>Filters & Search</h3>
          <div className='filter-panel__count'>
            {resultCount} of {totalCount} tickets
          </div>
        </div>

        <div className='filter-panel__actions'>
          {isFiltered && (
            <button
              type='button'
              className='filter-panel__clear'
              onClick={onClearAll}
              title='Clear all filters'
            >
              Clear All
            </button>
          )}

          <button
            type='button'
            className='filter-panel__toggle'
            onClick={onToggle}
            title={isOpen ? 'Close filters' : 'Open filters'}
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d={isOpen ? 'M18 6L6 18M6 6l12 12' : 'M3 6h18M3 12h18M3 18h18'}
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Panel Content */}
      {isOpen && (
        <div className='filter-panel__content'>
          {/* Tab Navigation */}
          <div className='filter-panel__tabs'>
            <button
              type='button'
              className={`filter-panel__tab ${activeTab === 'filters' ? 'filter-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('filters')}
            >
              Filters
            </button>
            <button
              type='button'
              className={`filter-panel__tab ${activeTab === 'search' ? 'filter-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              Search
            </button>
            <button
              type='button'
              className={`filter-panel__tab ${activeTab === 'sort' ? 'filter-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('sort')}
            >
              Sort
            </button>
            <button
              type='button'
              className={`filter-panel__tab ${activeTab === 'presets' ? 'filter-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('presets')}
            >
              Presets
            </button>
          </div>

          {/* Tab Content */}
          <div className='filter-panel__tab-content'>
            {/* Filters Tab */}
            {activeTab === 'filters' && (
              <div className='filter-panel__filters'>
                {/* Quick Filters */}
                <div className='filter-panel__quick-filters'>
                  {quickFilterGroups.map(group => (
                    <div key={group.id} className='filter-panel__filter-group'>
                      <h4 className='filter-panel__group-title'>
                        {group.name}
                      </h4>
                      <div className='filter-panel__filter-buttons'>
                        {group.filters.map(filter => (
                          <button
                            key={filter.id}
                            type='button'
                            className={`filter-panel__filter-button ${
                              // Check if this filter is active
                              Object.entries(filter.filters).every(
                                ([key, value]) => {
                                  const currentValue =
                                    activeFilters[key as keyof TicketFilters];
                                  if (Array.isArray(value)) {
                                    return (
                                      Array.isArray(currentValue) &&
                                      value.every(v =>
                                        (currentValue as any[]).includes(v)
                                      )
                                    );
                                  }
                                  return currentValue === value;
                                }
                              )
                                ? 'filter-panel__filter-button--active'
                                : ''
                            }`}
                            onClick={() =>
                              onQuickFilterToggle(filter.id, filter.filters)
                            }
                            style={
                              {
                                '--filter-color': filter.color,
                              } as React.CSSProperties
                            }
                          >
                            {filter.icon && (
                              <span className='filter-panel__filter-icon'>
                                {filter.icon}
                              </span>
                            )}
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Advanced Filters */}
                <div className='filter-panel__advanced'>
                  <button
                    type='button'
                    className='filter-panel__advanced-toggle'
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                      className={`filter-panel__advanced-icon ${showAdvanced ? 'filter-panel__advanced-icon--expanded' : ''}`}
                    >
                      <path
                        d='M9 18l6-6-6-6'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    Advanced Filters
                  </button>

                  {showAdvanced && (
                    <div className='filter-panel__advanced-content'>
                      {/* Assignee Filter */}
                      <div className='filter-panel__field'>
                        <label className='filter-panel__label'>Assignee</label>
                        <select
                          className='filter-panel__select'
                          value={
                            Array.isArray(activeFilters.assignee)
                              ? activeFilters.assignee[0]
                              : activeFilters.assignee || ''
                          }
                          onChange={e =>
                            handleFilterChange(
                              'assignee',
                              e.target.value || undefined
                            )
                          }
                        >
                          <option value=''>All assignees</option>
                          {availableAssignees.map(assignee => (
                            <option key={assignee.id} value={assignee.id}>
                              {assignee.displayName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Labels Filter */}
                      <div className='filter-panel__field'>
                        <label className='filter-panel__label'>Labels</label>
                        <div className='filter-panel__checkbox-group'>
                          {availableLabels.map(label => (
                            <label
                              key={label}
                              className='filter-panel__checkbox'
                            >
                              <input
                                type='checkbox'
                                checked={
                                  activeFilters.labels?.includes(label) || false
                                }
                                onChange={e => {
                                  const currentLabels = Array.isArray(
                                    activeFilters.labels
                                  )
                                    ? activeFilters.labels
                                    : [];
                                  const newLabels = e.target.checked
                                    ? [...currentLabels, label]
                                    : currentLabels.filter(l => l !== label);
                                  handleFilterChange(
                                    'labels',
                                    newLabels.length > 0 ? newLabels : undefined
                                  );
                                }}
                              />
                              <span className='filter-panel__checkbox-label'>
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Story Points Range */}
                      <div className='filter-panel__field'>
                        <label className='filter-panel__label'>
                          Story Points
                        </label>
                        <div className='filter-panel__range'>
                          <input
                            type='number'
                            className='filter-panel__input'
                            placeholder='Min'
                            value={activeFilters.storyPointsMin || ''}
                            onChange={e =>
                              handleFilterChange(
                                'storyPointsMin',
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                          <span className='filter-panel__range-separator'>
                            to
                          </span>
                          <input
                            type='number'
                            className='filter-panel__input'
                            placeholder='Max'
                            value={activeFilters.storyPointsMax || ''}
                            onChange={e =>
                              handleFilterChange(
                                'storyPointsMax',
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className='filter-panel__search'>
                <div className='filter-panel__field'>
                  <label className='filter-panel__label'>Search Query</label>
                  <input
                    type='text'
                    className='filter-panel__input'
                    placeholder='Search tickets...'
                    value={searchConfig?.query || ''}
                    onChange={e => handleSearchChange(e.target.value)}
                  />
                </div>

                <div className='filter-panel__field'>
                  <label className='filter-panel__label'>Search Fields</label>
                  <div className='filter-panel__checkbox-group'>
                    {[
                      { key: 'title', label: 'Title' },
                      { key: 'description', label: 'Description' },
                      { key: 'labels', label: 'Labels' },
                      { key: 'key', label: 'Key' },
                    ].map(field => (
                      <label key={field.key} className='filter-panel__checkbox'>
                        <input
                          type='checkbox'
                          checked={
                            searchConfig?.fields.includes(field.key as any) ||
                            false
                          }
                          onChange={e => {
                            const currentFields = searchConfig?.fields || [];
                            const newFields = e.target.checked
                              ? [...currentFields, field.key as any]
                              : currentFields.filter(f => f !== field.key);
                            onSearchChange({
                              ...searchConfig,
                              query: searchConfig?.query || '',
                              fields: newFields,
                            } as SearchConfig);
                          }}
                        />
                        <span className='filter-panel__checkbox-label'>
                          {field.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className='filter-panel__field'>
                  <label className='filter-panel__checkbox'>
                    <input
                      type='checkbox'
                      checked={searchConfig?.caseSensitive || false}
                      onChange={e =>
                        onSearchChange({
                          ...searchConfig,
                          query: searchConfig?.query || '',
                          fields: searchConfig?.fields || ['title'],
                          caseSensitive: e.target.checked,
                        } as SearchConfig)
                      }
                    />
                    <span className='filter-panel__checkbox-label'>
                      Case sensitive
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Sort Tab */}
            {activeTab === 'sort' && (
              <div className='filter-panel__sort'>
                <div className='filter-panel__field'>
                  <label className='filter-panel__label'>Sort by</label>
                  <select
                    className='filter-panel__select'
                    value={activeSort?.field || ''}
                    onChange={e =>
                      handleSortFieldChange(
                        e.target.value as TicketSortOptions['field']
                      )
                    }
                  >
                    <option value=''>No sorting</option>
                    <option value='created'>Created Date</option>
                    <option value='updated'>Updated Date</option>
                    <option value='title'>Title</option>
                    <option value='priority'>Priority</option>
                    <option value='status'>Status</option>
                    <option value='assignee'>Assignee</option>
                    <option value='storyPoints'>Story Points</option>
                  </select>
                </div>

                {activeSort && (
                  <div className='filter-panel__field'>
                    <label className='filter-panel__label'>Direction</label>
                    <div className='filter-panel__radio-group'>
                      <label className='filter-panel__radio'>
                        <input
                          type='radio'
                          name='sort-direction'
                          checked={activeSort.direction === 'asc'}
                          onChange={() =>
                            onSortChange({ ...activeSort, direction: 'asc' })
                          }
                        />
                        <span className='filter-panel__radio-label'>
                          Ascending
                        </span>
                      </label>
                      <label className='filter-panel__radio'>
                        <input
                          type='radio'
                          name='sort-direction'
                          checked={activeSort.direction === 'desc'}
                          onChange={() =>
                            onSortChange({ ...activeSort, direction: 'desc' })
                          }
                        />
                        <span className='filter-panel__radio-label'>
                          Descending
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Presets Tab */}
            {activeTab === 'presets' && (
              <div className='filter-panel__presets'>
                <div className='filter-panel__preset-list'>
                  {presets.map(preset => (
                    <button
                      key={preset.id}
                      type='button'
                      className='filter-panel__preset-button'
                      onClick={() => onPresetApply(preset.id)}
                    >
                      <div className='filter-panel__preset-name'>
                        {preset.name}
                      </div>
                      {preset.description && (
                        <div className='filter-panel__preset-description'>
                          {preset.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className='filter-panel__preset-save'>
                  <h4>Save Current Filters</h4>
                  <div className='filter-panel__field'>
                    <input
                      type='text'
                      className='filter-panel__input'
                      placeholder='Preset name'
                      value={newPresetName}
                      onChange={e => setNewPresetName(e.target.value)}
                    />
                  </div>
                  <div className='filter-panel__field'>
                    <input
                      type='text'
                      className='filter-panel__input'
                      placeholder='Description (optional)'
                      value={newPresetDescription}
                      onChange={e => setNewPresetDescription(e.target.value)}
                    />
                  </div>
                  <button
                    type='button'
                    className='filter-panel__preset-save-button'
                    onClick={handlePresetSave}
                    disabled={!newPresetName.trim()}
                  >
                    Save Preset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
