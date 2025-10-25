/**
 * Keyboard shortcuts types and interfaces
 */

/**
 * Keyboard shortcut types
 */
export type ShortcutType = 
  | 'navigation'
  | 'selection'
  | 'operation'
  | 'filter'
  | 'view'
  | 'help';

/**
 * Keyboard shortcut categories
 */
export type ShortcutCategory = 
  | 'general'
  | 'ticket'
  | 'board'
  | 'filter'
  | 'bulk'
  | 'navigation';

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  id: string;
  key: string;
  description: string;
  category: ShortcutCategory;
  type: ShortcutType;
  action: () => void;
  enabled?: boolean;
  requiresModifier?: boolean;
  modifier?: 'ctrl' | 'alt' | 'shift' | 'meta';
  preventDefault?: boolean;
  stopPropagation?: boolean;
  context?: string; // Context where shortcut is active
  helpText?: string;
}

/**
 * Keyboard shortcut context
 */
export interface ShortcutContext {
  id: string;
  name: string;
  shortcuts: KeyboardShortcut[];
  isActive: boolean;
}

/**
 * Keyboard shortcut manager configuration
 */
export interface ShortcutManagerConfig {
  enableShortcuts: boolean;
  showHelpOnF1: boolean;
  enableGlobalShortcuts: boolean;
  enableContextualShortcuts: boolean;
  debugMode: boolean;
  onShortcutExecuted?: (shortcut: KeyboardShortcut) => void;
  onShortcutBlocked?: (shortcut: KeyboardShortcut, reason: string) => void;
}

/**
 * Keyboard shortcut event
 */
export interface ShortcutEvent {
  shortcut: KeyboardShortcut;
  event: KeyboardEvent;
  context: string;
  timestamp: number;
}

/**
 * Keyboard shortcut help display
 */
export interface ShortcutHelp {
  category: ShortcutCategory;
  shortcuts: Array<{
    key: string;
    description: string;
    context?: string;
  }>;
}

/**
 * Keyboard shortcut registration
 */
export interface ShortcutRegistration {
  shortcut: KeyboardShortcut;
  element?: HTMLElement;
  context?: string;
  priority?: number;
}

/**
 * Keyboard shortcut conflict resolution
 */
export interface ShortcutConflict {
  shortcut: KeyboardShortcut;
  conflictingShortcuts: KeyboardShortcut[];
  resolution: 'block' | 'override' | 'context';
}
