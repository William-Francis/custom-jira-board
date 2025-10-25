/**
 * Keyboard Shortcuts Help Component
 * Displays a comprehensive help modal for keyboard shortcuts
 */

import React, { useState, useCallback } from 'react';
import { ShortcutHelp, ShortcutCategory } from '../../types';
import './keyboard-shortcuts-help.css';

/**
 * Keyboard Shortcuts Help Props
 */
export interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: ShortcutHelp[];
  className?: string;
}

/**
 * Keyboard Shortcuts Help Component
 */
export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose,
  shortcuts,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ShortcutCategory>('general');

  /**
   * Handle category selection
   */
  const handleCategorySelect = useCallback((category: ShortcutCategory) => {
    setSelectedCategory(category);
  }, []);

  /**
   * Handle escape key
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  /**
   * Handle overlay click
   */
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  const categories: ShortcutCategory[] = ['general', 'ticket', 'board', 'filter', 'bulk', 'navigation'];
  const selectedShortcuts = shortcuts.find(s => s.category === selectedCategory);

  const modalClasses = [
    'keyboard-shortcuts-help',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className="keyboard-shortcuts-help__overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={modalClasses}>
        {/* Header */}
        <div className="keyboard-shortcuts-help__header">
          <h2 className="keyboard-shortcuts-help__title">
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            className="keyboard-shortcuts-help__close"
            onClick={onClose}
            aria-label="Close help"
          >
            <svg
              width="20"
              height="20"
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

        {/* Content */}
        <div className="keyboard-shortcuts-help__content">
          {/* Category Navigation */}
          <div className="keyboard-shortcuts-help__categories">
            {categories.map(category => (
              <button
                key={category}
                type="button"
                className={`keyboard-shortcuts-help__category ${
                  selectedCategory === category ? 'keyboard-shortcuts-help__category--active' : ''
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Shortcuts List */}
          <div className="keyboard-shortcuts-help__shortcuts">
            {selectedShortcuts && selectedShortcuts.shortcuts.length > 0 ? (
              <div className="keyboard-shortcuts-help__shortcuts-list">
                {selectedShortcuts.shortcuts.map((shortcut, index) => (
                  <div key={index} className="keyboard-shortcuts-help__shortcut">
                    <div className="keyboard-shortcuts-help__shortcut-key">
                      <kbd className="keyboard-shortcuts-help__kbd">
                        {shortcut.key}
                      </kbd>
                    </div>
                    <div className="keyboard-shortcuts-help__shortcut-description">
                      {shortcut.description}
                    </div>
                    {shortcut.context && (
                      <div className="keyboard-shortcuts-help__shortcut-context">
                        {shortcut.context}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="keyboard-shortcuts-help__empty">
                <p>No shortcuts available for this category.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="keyboard-shortcuts-help__footer">
          <div className="keyboard-shortcuts-help__tip">
            💡 Press <kbd>Esc</kbd> to close this help
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
