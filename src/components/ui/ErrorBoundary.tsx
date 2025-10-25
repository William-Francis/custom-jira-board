import { Component, ErrorInfo, ReactNode } from 'react';
import { BaseComponentProps } from '../../types';
import './error-boundary.css';

/**
 * Error boundary state interface
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary props interface
 */
interface ErrorBoundaryProps extends BaseComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

/**
 * Error boundary component for catching and handling React errors
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange && resetKeys) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  render() {
    const { hasError, error } = this.state;
    const {
      children,
      fallback,
      className = '',
      'data-testid': testId,
    } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div
          className={`error-boundary ${className}`}
          role='alert'
          aria-live='polite'
          data-testid={testId}
        >
          <div className='error-boundary__content'>
            <div className='error-boundary__icon' aria-hidden='true'>
              <svg
                width='48'
                height='48'
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
                />
                <path
                  d='M15 9L9 15M9 9L15 15'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>

            <h2 className='error-boundary__title'>Something went wrong</h2>

            <p className='error-boundary__message'>
              We're sorry, but something unexpected happened. Please try
              refreshing the page or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && error && (
              <details className='error-boundary__details'>
                <summary className='error-boundary__summary'>
                  Error Details (Development Only)
                </summary>
                <pre className='error-boundary__error-text'>
                  {error.toString()}
                </pre>
              </details>
            )}

            <div className='error-boundary__actions'>
              <button
                type='button'
                className='error-boundary__retry-btn'
                onClick={this.handleRetry}
                aria-label='Try again'
              >
                Try Again
              </button>

              <button
                type='button'
                className='error-boundary__refresh-btn'
                onClick={() => window.location.reload()}
                aria-label='Refresh page'
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
