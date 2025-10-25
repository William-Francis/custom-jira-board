import React, { useEffect, useRef } from 'react';
import { BaseComponentProps } from '../../types';
import './modal.css';

/**
 * Modal size variants
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Modal component props
 */
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/**
 * Modal component with accessibility features and keyboard navigation
 */
export const Modal: React.FC<ModalProps> = ({
  children,
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'data-testid': testId,
  ...props
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';

      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Handle close button click
  const handleCloseClick = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const modalClasses = ['modal', `modal--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className='modal-overlay'
      onClick={handleOverlayClick}
      role='dialog'
      aria-modal='true'
      aria-labelledby={ariaLabelledBy || (title ? 'modal-title' : undefined)}
      aria-describedby={ariaDescribedBy}
      data-testid={testId}
      {...props}
    >
      <div
        ref={modalRef}
        className={modalClasses}
        tabIndex={-1}
        role='document'
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className='modal__header'>
            {title && (
              <h2 id='modal-title' className='modal__title'>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type='button'
                className='modal__close'
                onClick={handleCloseClick}
                aria-label='Close modal'
                data-testid='modal-close-button'
              >
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  aria-hidden='true'
                >
                  <path
                    d='M18 6L6 18M6 6L18 18'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className='modal__content'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
