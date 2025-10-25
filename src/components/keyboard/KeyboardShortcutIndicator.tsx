/**
 * Keyboard Shortcut Indicator Component
 * Shows visual indicators for available keyboard shortcuts
 */

import React, { useState, useEffect } from 'react';
import { KeyboardShortcut } from '../../types';
import './keyboard-shortcut-indicator.css';

/**
 * Keyboard Shortcut Indicator Props
 */
export interface KeyboardShortcutIndicatorProps {
  shortcuts: KeyboardShortcut[];
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

/**
 * Keyboard Shortcut Indicator Component
 */
export const KeyboardShortcutIndicator: React.FC<KeyboardShortcutIndicatorProps> = ({
  shortcuts,
  visible = true,
  position = 'bottom-right',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filteredShortcuts, setFilteredShortcuts] = useState<KeyboardShortcut[]>([]);

  // Filter shortcuts based on context and visibility
  useEffect(() => {
    const filtered = shortcuts.filter(shortcut => 
      shortcut.enabled !== false && 
      shortcut.type !== 'help' &&
      shortcut.context !== 'global'
    );
    setFilteredShortcuts(filtered);
  }, [shortcuts]);

  if (!visible || filteredShortcuts.length === 0) {
    return null;
  }

  const indicatorClasses = [
    'keyboard-shortcut-indicator',
    `keyboard-shortcut-indicator--${position}`,
    isExpanded && 'keyboard-shortcut-indicator--expanded',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={indicatorClasses}>
      {/* Toggle Button */}
      <button
        type="button"
        className="keyboard-shortcut-indicator__toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Hide shortcuts' : 'Show shortcuts'}
        title={isExpanded ? 'Hide shortcuts' : 'Show shortcuts'}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="keyboard-shortcut-indicator__count">
          {filteredShortcuts.length}
        </span>
      </button>

      {/* Shortcuts List */}
      {isExpanded && (
        <div className="keyboard-shortcut-indicator__list">
          <div className="keyboard-shortcut-indicator__header">
            <h4>Available Shortcuts</h4>
            <button
              type="button"
              className="keyboard-shortcut-indicator__close"
              onClick={() => setIsExpanded(false)}
              aria-label="Close shortcuts"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          
          <div className="keyboard-shortcut-indicator__shortcuts">
            {filteredShortcuts.map((shortcut, index) => (
              <div key={index} className="keyboard-shortcut-indicator__shortcut">
                <kbd className="keyboard-shortcut-indicator__key">
                  {shortcut.key}
                </kbd>
                <span className="keyboard-shortcut-indicator__description">
                  {shortcut.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyboardShortcutIndicator;
