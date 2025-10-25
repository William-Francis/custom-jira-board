/**
 * Lazy Loading Component
 * Provides lazy loading functionality for components and images
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
  lazy,
} from 'react';
import { LoadingSpinner } from '../ui';
import './lazy-loading.css';

/**
 * Lazy Loading Configuration
 */
export interface LazyLoadingConfig {
  rootMargin?: string;
  threshold?: number;
  enableIntersectionObserver?: boolean;
  fallbackDelay?: number;
  enablePreloading?: boolean;
  preloadDistance?: number;
}

/**
 * Lazy Loading Props
 */
export interface LazyLoadingProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  config?: LazyLoadingConfig;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Lazy Loading Component
 */
export const LazyLoading: React.FC<LazyLoadingProps> = ({
  children,
  fallback = <LoadingSpinner size='sm' />,
  config = {},
  className = '',
  onLoad,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    rootMargin = '50px',
    threshold = 0.1,
    enableIntersectionObserver = true,
    fallbackDelay = 0,
  } = config;

  // Initialize intersection observer
  useEffect(() => {
    if (!enableIntersectionObserver || !containerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(containerRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enableIntersectionObserver, rootMargin, threshold]);

  // Handle load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Load content when visible
  useEffect(() => {
    if (isVisible && !isLoaded && !hasError) {
      const timer = setTimeout(() => {
        handleLoad();
      }, fallbackDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, isLoaded, hasError, fallbackDelay, handleLoad]);

  const containerClasses = [
    'lazy-loading',
    isLoaded && 'lazy-loading--loaded',
    isVisible && 'lazy-loading--visible',
    hasError && 'lazy-loading--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={containerRef} className={containerClasses}>
      {isLoaded ? (
        <div className='lazy-loading__content'>{children}</div>
      ) : hasError ? (
        <div className='lazy-loading__error'>
          <div className='lazy-loading__error-icon'>⚠️</div>
          <div className='lazy-loading__error-message'>
            Failed to load content
          </div>
          <button
            type='button'
            className='lazy-loading__retry'
            onClick={() => {
              setHasError(false);
              setIsLoaded(false);
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className='lazy-loading__fallback'>{fallback}</div>
      )}
    </div>
  );
};

/**
 * Lazy Image Component
 */
export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  placeholder?: string;
  config?: LazyLoadingConfig;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  onLoad,
  onError,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjRmNWY3Ii8+PC9zdmc+',
  config = {},
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    setHasError(true);
    onError?.(new Error(`Failed to load image: ${src}`));
  }, [src, onError]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      handleImageLoad();
    };
    img.onerror = handleImageError;
    img.src = src;
  }, [src, handleImageLoad, handleImageError]);

  const imageClasses = [
    'lazy-image',
    isLoaded && 'lazy-image--loaded',
    hasError && 'lazy-image--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <LazyLoading
      config={config}
      fallback={
        <div className='lazy-image__placeholder'>
          <div className='lazy-image__spinner'>
            <LoadingSpinner size='sm' />
          </div>
        </div>
      }
    >
      <img
        src={imageSrc}
        alt={alt}
        className={imageClasses}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </LazyLoading>
  );
};

/**
 * Lazy Component Wrapper
 */
export interface LazyComponentProps {
  component: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  config?: LazyLoadingConfig;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  component,
  fallback = <LoadingSpinner size='sm' />,
  config = {},
  className = '',
  onLoad,
  onError,
}) => {
  const LazyComponent = lazy(component);

  return (
    <LazyLoading
      config={config}
      fallback={fallback}
      className={className}
      onLoad={onLoad}
      onError={onError}
    >
      <Suspense fallback={fallback}>
        <LazyComponent />
      </Suspense>
    </LazyLoading>
  );
};

/**
 * Preload Hook
 */
export const usePreload = (urls: string[]) => {
  const [preloadedUrls, setPreloadedUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadPromises = urls.map(url => {
      return new Promise<string>((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.onload = () => resolve(url);
        link.onerror = () => reject(new Error(`Failed to preload: ${url}`));
        document.head.appendChild(link);
      });
    });

    Promise.allSettled(preloadPromises).then(results => {
      const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<string>).value);

      setPreloadedUrls(new Set(successful));
    });
  }, [urls]);

  return preloadedUrls;
};

export default LazyLoading;
