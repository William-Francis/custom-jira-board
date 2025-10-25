import React from 'react';
import { BaseComponentProps } from '../../types';
import './loading-spinner.css';

/**
 * Loading spinner size variants
 */
export type LoadingSpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Loading spinner variant types
 */
export type LoadingSpinnerVariant = 'primary' | 'secondary' | 'white';

/**
 * LoadingSpinner component props
 */
export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: LoadingSpinnerSize;
  variant?: LoadingSpinnerVariant;
  text?: string;
  'aria-label'?: string;
}

/**
 * LoadingSpinner component with accessibility features
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  text,
  className = '',
  'aria-label': ariaLabel,
  'data-testid': testId,
  ...props
}) => {
  const spinnerClasses = [
    'loading-spinner',
    `loading-spinner--${size}`,
    `loading-spinner--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const label = ariaLabel || text || 'Loading...';

  return (
    <div
      className={spinnerClasses}
      role='status'
      aria-label={label}
      data-testid={testId}
      {...props}
    >
      <div className='loading-spinner__circle' aria-hidden='true'>
        <svg
          className='loading-spinner__svg'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <circle
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeDasharray='31.416'
            strokeDashoffset='31.416'
            opacity='0.3'
          />
          <circle
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeDasharray='31.416'
            strokeDashoffset='31.416'
          >
            <animate
              attributeName='stroke-dasharray'
              dur='2s'
              values='0 31.416;15.708 15.708;0 31.416'
              repeatCount='indefinite'
            />
            <animate
              attributeName='stroke-dashoffset'
              dur='2s'
              values='0;-15.708;-31.416'
              repeatCount='indefinite'
            />
          </circle>
        </svg>
      </div>
      {text && <span className='loading-spinner__text'>{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
