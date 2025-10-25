/**
 * Drag and Drop Indicator Component
 * Provides visual feedback during drag operations
 */

import React from 'react';
import './drag-indicator.css';

/**
 * Drag Indicator Props
 */
export interface DragIndicatorProps {
  position: 'above' | 'below';
  isVisible: boolean;
  className?: string;
}

/**
 * Drag Overlay Props
 */
export interface DragOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export const DragOverlay: React.FC<DragOverlayProps> = ({
  isVisible,
  message = 'Drop here',
  className = '',
}) => {
  if (!isVisible) return null;

  const overlayClasses = ['drag-overlay', className].filter(Boolean).join(' ');

  return (
    <div className={overlayClasses} role='presentation' aria-hidden='true'>
      <div className='drag-overlay__content'>
        <div className='drag-overlay__icon'>
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M12 5v14M5 12h14'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>
        <div className='drag-overlay__message'>{message}</div>
      </div>
    </div>
  );
};

/**
 * Drag and Drop Indicator Component
 */
export const DragIndicator: React.FC<DragIndicatorProps> = ({
  position,
  isVisible,
  className = '',
}) => {
  if (!isVisible) return null;

  const indicatorClasses = [
    'drag-indicator',
    `drag-indicator--${position}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={indicatorClasses} role='presentation' aria-hidden='true'>
      <div className='drag-indicator__line' />
      <div className='drag-indicator__handle'>
        <svg
          width='12'
          height='12'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M8 6h8M8 12h8M8 18h8'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>
    </div>
  );
};

export default DragIndicator;
