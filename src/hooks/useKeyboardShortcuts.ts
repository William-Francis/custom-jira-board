/**
 * Custom hook for managing keyboard shortcuts
 * Provides React integration for keyboard shortcut functionality
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  KeyboardShortcut,
  ShortcutManagerConfig,
  ShortcutHelp,
  ShortcutCategory,
} from '../types';
import { KeyboardShortcutManager, createShortcutManager } from '../utils/keyboardShortcuts';

/**
 * Configuration for the useKeyboardShortcuts hook
 */
export interface UseKeyboardShortcutsConfig extends Partial<ShortcutManagerConfig> {
  shortcuts?: KeyboardShortcut[];
  onShortcutExecuted?: (shortcut: KeyboardShortcut) => void;
  onShortcutBlocked?: (shortcut: KeyboardShortcut, reason: string) => void;
  enableOnMount?: boolean;
  context?: string;
}

/**
 * Return type for the useKeyboardShortcuts hook
 */
export interface UseKeyboardShortcutsReturn {
  // Manager instance
  manager: KeyboardShortcutManager;
  
  // Shortcut management
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string) => void;
  registerShortcuts: (shortcuts: KeyboardShortcut[]) => void;
  
  // Context management
  setActiveContext: (contextId: string) => void;
  getActiveContext: () => string;
  
  // State management
  setEnabled: (enabled: boolean) => void;
  isEnabled: boolean;
  
  // Help and information
  getShortcutHelp: () => ShortcutHelp[];
  getShortcutsByCategory: (category: ShortcutCategory) => KeyboardShortcut[];
  getContextualShortcuts: () => KeyboardShortcut[];
  
  // Execution
  executeShortcut: (key: string) => boolean;
  
  // UI state
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

/**
 * Custom hook for managing keyboard shortcuts
 */
export const useKeyboardShortcuts = (
  config: UseKeyboardShortcutsConfig = {}
): UseKeyboardShortcutsReturn => {
  const {
    shortcuts = [],
    onShortcutExecuted,
    onShortcutBlocked,
    enableOnMount = true,
    context = 'global',
    ...managerConfig
  } = config;

  // Manager instance
  const managerRef = useRef<KeyboardShortcutManager | null>(null);
  const [isEnabled, setIsEnabled] = useState(enableOnMount);
  const [showHelp, setShowHelp] = useState(false);

  // Initialize manager
  useEffect(() => {
    const manager = createShortcutManager({
      ...managerConfig,
      onShortcutExecuted,
      onShortcutBlocked,
    });

    managerRef.current = manager;

    // Register initial shortcuts
    if (shortcuts.length > 0) {
      manager.registerShortcuts(shortcuts);
    }

    // Set initial context
    if (context !== 'global') {
      manager.setActiveContext(context);
    }

    return () => {
      manager.destroy();
    };
  }, []);

  // Update enabled state
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.setEnabled(isEnabled);
    }
  }, [isEnabled]);

  // Register shortcuts when they change
  useEffect(() => {
    if (managerRef.current && shortcuts.length > 0) {
      managerRef.current.registerShortcuts(shortcuts);
    }
  }, [shortcuts]);

  // Register shortcut
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    if (managerRef.current) {
      managerRef.current.registerShortcut(shortcut);
    }
  }, []);

  // Unregister shortcut
  const unregisterShortcut = useCallback((key: string) => {
    if (managerRef.current) {
      managerRef.current.unregisterShortcut(key);
    }
  }, []);

  // Register multiple shortcuts
  const registerShortcuts = useCallback((shortcuts: KeyboardShortcut[]) => {
    if (managerRef.current) {
      managerRef.current.registerShortcuts(shortcuts);
    }
  }, []);

  // Set active context
  const setActiveContext = useCallback((contextId: string) => {
    if (managerRef.current) {
      managerRef.current.setActiveContext(contextId);
    }
  }, []);

  // Get active context
  const getActiveContext = useCallback(() => {
    return managerRef.current?.getActiveContext() || 'global';
  }, []);

  // Execute shortcut
  const executeShortcut = useCallback((key: string) => {
    return managerRef.current?.executeShortcut(key) || false;
  }, []);

  // Get shortcut help
  const getShortcutHelp = useCallback(() => {
    return managerRef.current?.getShortcutHelp() || [];
  }, []);

  // Get shortcuts by category
  const getShortcutsByCategory = useCallback((category: ShortcutCategory) => {
    return managerRef.current?.getShortcutsByCategory(category) || [];
  }, []);

  // Get contextual shortcuts
  const getContextualShortcuts = useCallback(() => {
    return managerRef.current?.getContextualShortcuts() || [];
  }, []);

  // Handle help shortcut
  useEffect(() => {
    const handleHelpShortcut = () => {
      setShowHelp(true);
    };

    const helpShortcut: KeyboardShortcut = {
      id: 'help',
      key: 'F1',
      description: 'Show keyboard shortcuts help',
      category: 'general',
      type: 'help',
      action: handleHelpShortcut,
      context: 'global',
    };

    registerShortcut(helpShortcut);

    return () => {
      unregisterShortcut('F1');
    };
  }, [registerShortcut, unregisterShortcut]);

  // Handle escape key
  useEffect(() => {
    const handleEscapeShortcut = () => {
      setShowHelp(false);
    };

    const escapeShortcut: KeyboardShortcut = {
      id: 'escape',
      key: 'Escape',
      description: 'Close help, cancel operations',
      category: 'general',
      type: 'operation',
      action: handleEscapeShortcut,
      context: 'global',
    };

    registerShortcut(escapeShortcut);

    return () => {
      unregisterShortcut('Escape');
    };
  }, [registerShortcut, unregisterShortcut]);

  return {
    manager: managerRef.current!,
    registerShortcut,
    unregisterShortcut,
    registerShortcuts,
    setActiveContext,
    getActiveContext,
    setEnabled: setIsEnabled,
    isEnabled,
    getShortcutHelp,
    getShortcutsByCategory,
    getContextualShortcuts,
    executeShortcut,
    showHelp,
    setShowHelp,
  };
};

/**
 * Hook for specific keyboard shortcut actions
 */
export const useKeyboardActions = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    element?.focus();
  }, []);

  const clickElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    element?.click();
  }, []);

  const scrollToElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  return {
    toggleFullscreen,
    focusElement,
    clickElement,
    scrollToElement,
    isFullscreen,
  };
};

/**
 * Hook for keyboard shortcut help
 */
export const useShortcutHelp = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ShortcutCategory>('general');

  const showHelp = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideHelp = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggleHelp = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const selectCategory = useCallback((category: ShortcutCategory) => {
    setSelectedCategory(category);
  }, []);

  return {
    isVisible,
    selectedCategory,
    showHelp,
    hideHelp,
    toggleHelp,
    selectCategory,
  };
};
