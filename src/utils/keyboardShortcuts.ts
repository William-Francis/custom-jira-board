/**
 * Keyboard shortcuts utilities and manager
 * Provides comprehensive keyboard shortcut functionality
 */

import {
  KeyboardShortcut,
  ShortcutContext,
  ShortcutManagerConfig,
  ShortcutHelp,
  ShortcutCategory,
} from '../types';

/**
 * Keyboard shortcut manager class
 */
export class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private contexts: Map<string, ShortcutContext> = new Map();
  private activeContext: string = 'global';
  private config: ShortcutManagerConfig;
  private eventListeners: Map<string, (event: KeyboardEvent) => void> = new Map();
  private isEnabled: boolean = true;

  constructor(config: Partial<ShortcutManagerConfig> = {}) {
    this.config = {
      enableShortcuts: true,
      showHelpOnF1: true,
      enableGlobalShortcuts: true,
      enableContextualShortcuts: true,
      debugMode: false,
      ...config,
    };

    this.initializeDefaultShortcuts();
    this.setupGlobalEventListeners();
  }

  /**
   * Register a keyboard shortcut
   */
  registerShortcut(shortcut: KeyboardShortcut): void {
    const key = this.normalizeKey(shortcut.key);
    const shortcutWithKey = { ...shortcut, key };

    // Check for conflicts
    if (this.shortcuts.has(key)) {
      this.handleShortcutConflict(shortcutWithKey);
    }

    this.shortcuts.set(key, shortcutWithKey);
    this.log(`Registered shortcut: ${key} - ${shortcut.description}`);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregisterShortcut(key: string): void {
    const normalizedKey = this.normalizeKey(key);
    if (this.shortcuts.has(normalizedKey)) {
      this.shortcuts.delete(normalizedKey);
      this.log(`Unregistered shortcut: ${normalizedKey}`);
    }
  }

  /**
   * Register multiple shortcuts
   */
  registerShortcuts(shortcuts: KeyboardShortcut[]): void {
    shortcuts.forEach(shortcut => this.registerShortcut(shortcut));
  }

  /**
   * Set active context
   */
  setActiveContext(contextId: string): void {
    this.activeContext = contextId;
    this.log(`Active context changed to: ${contextId}`);
  }

  /**
   * Get active context
   */
  getActiveContext(): string {
    return this.activeContext;
  }

  /**
   * Enable/disable shortcuts
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.log(`Shortcuts ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if shortcuts are enabled
   */
  isShortcutsEnabled(): boolean {
    return this.isEnabled && this.config.enableShortcuts;
  }

  /**
   * Get all shortcuts for a category
   */
  getShortcutsByCategory(category: ShortcutCategory): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter(
      shortcut => shortcut.category === category
    );
  }

  /**
   * Get shortcuts for current context
   */
  getContextualShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter(
      shortcut => !shortcut.context || shortcut.context === this.activeContext
    );
  }

  /**
   * Get help information for shortcuts
   */
  getShortcutHelp(): ShortcutHelp[] {
    const categories: ShortcutCategory[] = ['general', 'ticket', 'board', 'filter', 'bulk', 'navigation'];
    
    return categories.map(category => ({
      category,
      shortcuts: this.getShortcutsByCategory(category).map(shortcut => ({
        key: shortcut.key,
        description: shortcut.description,
        context: shortcut.context,
      })),
    }));
  }

  /**
   * Execute a shortcut by key
   */
  executeShortcut(key: string): boolean {
    const normalizedKey = this.normalizeKey(key);
    const shortcut = this.shortcuts.get(normalizedKey);

    if (!shortcut) {
      return false;
    }

    if (!this.canExecuteShortcut(shortcut)) {
      return false;
    }

    try {
      shortcut.action();
      this.config.onShortcutExecuted?.(shortcut);
      this.log(`Executed shortcut: ${normalizedKey} - ${shortcut.description}`);
      return true;
    } catch (error) {
      console.error(`Error executing shortcut ${normalizedKey}:`, error);
      return false;
    }
  }

  /**
   * Handle keyboard event
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.isShortcutsEnabled()) {
      return false;
    }

    const key = this.getEventKey(event);
    const shortcut = this.shortcuts.get(key);

    if (!shortcut) {
      return false;
    }

    if (!this.canExecuteShortcut(shortcut)) {
      return false;
    }

    if (shortcut.preventDefault !== false) {
      event.preventDefault();
    }

    if (shortcut.stopPropagation) {
      event.stopPropagation();
    }

    return this.executeShortcut(key);
  }

  /**
   * Cleanup and destroy manager
   */
  destroy(): void {
    this.eventListeners.forEach((listener) => {
      document.removeEventListener('keydown', listener);
    });
    this.eventListeners.clear();
    this.shortcuts.clear();
    this.contexts.clear();
  }

  /**
   * Initialize default shortcuts
   */
  private initializeDefaultShortcuts(): void {
    const defaultShortcuts: KeyboardShortcut[] = [
      // General shortcuts
      {
        id: 'help',
        key: 'F1',
        description: 'Show keyboard shortcuts help',
        category: 'general',
        type: 'help',
        action: () => this.showHelp(),
        context: 'global',
      },
      {
        id: 'escape',
        key: 'Escape',
        description: 'Close modals, cancel operations',
        category: 'general',
        type: 'operation',
        action: () => this.handleEscape(),
        context: 'global',
      },

      // Navigation shortcuts
      {
        id: 'focus-search',
        key: 'ctrl+k',
        description: 'Focus search input',
        category: 'navigation',
        type: 'navigation',
        action: () => this.focusSearch(),
        modifier: 'ctrl',
        context: 'global',
      },
      {
        id: 'focus-filters',
        key: 'ctrl+f',
        description: 'Focus filters panel',
        category: 'navigation',
        type: 'navigation',
        action: () => this.focusFilters(),
        modifier: 'ctrl',
        context: 'global',
      },
      {
        id: 'focus-board',
        key: 'ctrl+b',
        description: 'Focus board view',
        category: 'navigation',
        type: 'navigation',
        action: () => this.focusBoard(),
        modifier: 'ctrl',
        context: 'global',
      },

      // Ticket shortcuts
      {
        id: 'create-ticket',
        key: 'ctrl+n',
        description: 'Create new ticket',
        category: 'ticket',
        type: 'operation',
        action: () => this.createTicket(),
        modifier: 'ctrl',
        context: 'global',
      },
      {
        id: 'edit-ticket',
        key: 'e',
        description: 'Edit selected ticket',
        category: 'ticket',
        type: 'operation',
        action: () => this.editSelectedTicket(),
        context: 'ticket-focused',
      },
      {
        id: 'delete-ticket',
        key: 'Delete',
        description: 'Delete selected ticket',
        category: 'ticket',
        type: 'operation',
        action: () => this.deleteSelectedTicket(),
        context: 'ticket-focused',
      },

      // Board shortcuts
      {
        id: 'refresh-board',
        key: 'ctrl+r',
        description: 'Refresh board data',
        category: 'board',
        type: 'operation',
        action: () => this.refreshBoard(),
        modifier: 'ctrl',
        context: 'global',
      },
      {
        id: 'toggle-fullscreen',
        key: 'F11',
        description: 'Toggle fullscreen mode',
        category: 'board',
        type: 'view',
        action: () => this.toggleFullscreen(),
        context: 'global',
      },

      // Filter shortcuts
      {
        id: 'clear-filters',
        key: 'ctrl+shift+f',
        description: 'Clear all filters',
        category: 'filter',
        type: 'filter',
        action: () => this.clearFilters(),
        modifier: 'ctrl',
        context: 'global',
      },
      {
        id: 'toggle-filter-panel',
        key: 'ctrl+shift+p',
        description: 'Toggle filter panel',
        category: 'filter',
        type: 'filter',
        action: () => this.toggleFilterPanel(),
        modifier: 'ctrl',
        context: 'global',
      },

      // Bulk operation shortcuts
      {
        id: 'select-all',
        key: 'ctrl+a',
        description: 'Select all tickets',
        category: 'bulk',
        type: 'selection',
        action: () => this.selectAllTickets(),
        modifier: 'ctrl',
        context: 'global',
      },
      {
        id: 'deselect-all',
        key: 'ctrl+shift+a',
        description: 'Deselect all tickets',
        category: 'bulk',
        type: 'selection',
        action: () => this.deselectAllTickets(),
        modifier: 'ctrl',
        context: 'global',
      },
      {
        id: 'toggle-bulk-panel',
        key: 'ctrl+shift+b',
        description: 'Toggle bulk operations panel',
        category: 'bulk',
        type: 'operation',
        action: () => this.toggleBulkPanel(),
        modifier: 'ctrl',
        context: 'global',
      },
    ];

    this.registerShortcuts(defaultShortcuts);
  }

  /**
   * Setup global event listeners
   */
  private setupGlobalEventListeners(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    };

    document.addEventListener('keydown', handleKeyDown);
    this.eventListeners.set('global', handleKeyDown);
  }

  /**
   * Normalize key for consistent matching
   */
  private normalizeKey(key: string): string {
    return key.toLowerCase().replace(/\s+/g, '');
  }

  /**
   * Get event key string
   */
  private getEventKey(event: KeyboardEvent): string {
    const modifiers: string[] = [];
    
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.altKey) modifiers.push('alt');
    if (event.shiftKey) modifiers.push('shift');
    if (event.metaKey) modifiers.push('meta');

    const key = event.key.toLowerCase();
    const modifierString = modifiers.length > 0 ? `${modifiers.join('+')}+` : '';
    
    return `${modifierString}${key}`;
  }

  /**
   * Check if shortcut can be executed
   */
  private canExecuteShortcut(shortcut: KeyboardShortcut): boolean {
    if (!shortcut.enabled !== false) {
      return false;
    }

    if (shortcut.context && shortcut.context !== this.activeContext) {
      return false;
    }

    // Check if we're in an input field (unless shortcut allows it)
    const activeElement = document.activeElement;
    const isInputField = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      (activeElement as HTMLElement).contentEditable === 'true'
    );

    if (isInputField && !shortcut.context?.includes('input')) {
      return false;
    }

    return true;
  }

  /**
   * Handle shortcut conflicts
   */
  private handleShortcutConflict(newShortcut: KeyboardShortcut): void {
    const existingShortcut = this.shortcuts.get(newShortcut.key);
    if (existingShortcut) {
      this.log(`Shortcut conflict: ${newShortcut.key} - ${existingShortcut.description} vs ${newShortcut.description}`);
      // For now, override the existing shortcut
      // In a more sophisticated implementation, you might want to handle this differently
    }
  }

  /**
   * Log messages (if debug mode is enabled)
   */
  private log(message: string): void {
    if (this.config.debugMode) {
      console.log(`[KeyboardShortcutManager] ${message}`);
    }
  }

  // Default action implementations (these would be overridden by the actual app)
  private showHelp(): void {
    console.log('Show keyboard shortcuts help');
  }

  private handleEscape(): void {
    console.log('Handle escape key');
  }

  private focusSearch(): void {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
    searchInput?.focus();
  }

  private focusFilters(): void {
    const filterButton = document.querySelector('[data-testid="filter-toggle"], .filter-panel__toggle') as HTMLElement;
    filterButton?.click();
  }

  private focusBoard(): void {
    const boardElement = document.querySelector('[data-testid="board"], .board') as HTMLElement;
    boardElement?.focus();
  }

  private createTicket(): void {
    console.log('Create new ticket');
  }

  private editSelectedTicket(): void {
    console.log('Edit selected ticket');
  }

  private deleteSelectedTicket(): void {
    console.log('Delete selected ticket');
  }

  private refreshBoard(): void {
    console.log('Refresh board data');
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  private clearFilters(): void {
    console.log('Clear all filters');
  }

  private toggleFilterPanel(): void {
    console.log('Toggle filter panel');
  }

  private selectAllTickets(): void {
    console.log('Select all tickets');
  }

  private deselectAllTickets(): void {
    console.log('Deselect all tickets');
  }

  private toggleBulkPanel(): void {
    console.log('Toggle bulk operations panel');
  }
}

/**
 * Default keyboard shortcuts for Jira Board
 */
export const DEFAULT_JIRA_SHORTCUTS: KeyboardShortcut[] = [
  // General
  {
    id: 'help',
    key: 'F1',
    description: 'Show keyboard shortcuts help',
    category: 'general',
    type: 'help',
    action: () => {},
  },
  {
    id: 'escape',
    key: 'Escape',
    description: 'Close modals, cancel operations',
    category: 'general',
    type: 'operation',
    action: () => {},
  },

  // Navigation
  {
    id: 'focus-search',
    key: 'ctrl+k',
    description: 'Focus search input',
    category: 'navigation',
    type: 'navigation',
    action: () => {},
    modifier: 'ctrl',
  },
  {
    id: 'focus-filters',
    key: 'ctrl+f',
    description: 'Focus filters panel',
    category: 'navigation',
    type: 'navigation',
    action: () => {},
    modifier: 'ctrl',
  },

  // Ticket operations
  {
    id: 'create-ticket',
    key: 'ctrl+n',
    description: 'Create new ticket',
    category: 'ticket',
    type: 'operation',
    action: () => {},
    modifier: 'ctrl',
  },
  {
    id: 'edit-ticket',
    key: 'e',
    description: 'Edit selected ticket',
    category: 'ticket',
    type: 'operation',
    action: () => {},
  },

  // Board operations
  {
    id: 'refresh-board',
    key: 'ctrl+r',
    description: 'Refresh board data',
    category: 'board',
    type: 'operation',
    action: () => {},
    modifier: 'ctrl',
  },

  // Bulk operations
  {
    id: 'select-all',
    key: 'ctrl+a',
    description: 'Select all tickets',
    category: 'bulk',
    type: 'selection',
    action: () => {},
    modifier: 'ctrl',
  },
  {
    id: 'deselect-all',
    key: 'ctrl+shift+a',
    description: 'Deselect all tickets',
    category: 'bulk',
    type: 'selection',
    action: () => {},
    modifier: 'ctrl',
  },
];

/**
 * Create keyboard shortcut manager instance
 */
export function createShortcutManager(config?: Partial<ShortcutManagerConfig>): KeyboardShortcutManager {
  return new KeyboardShortcutManager(config);
}
