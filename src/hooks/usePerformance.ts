/**
 * Custom hook for performance monitoring
 * Provides React integration for performance tracking
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import React from 'react';
import { 
  PerformanceMonitor, 
  PerformanceMetrics, 
  PerformanceConfig,
  VirtualScrollManager,
  VirtualScrollConfig,
  VirtualScrollState,
  CacheManager 
} from '../utils/performance';

/**
 * Performance monitoring hook configuration
 */
export interface UsePerformanceConfig extends Partial<PerformanceConfig> {
  enableAutoStart?: boolean;
  enableComponentTracking?: boolean;
  enableRenderTracking?: boolean;
  onPerformanceAlert?: (metric: PerformanceMetrics) => void;
}

/**
 * Performance monitoring hook return type
 */
export interface UsePerformanceReturn {
  monitor: PerformanceMonitor;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  getCurrentMetrics: () => PerformanceMetrics | null;
  getPerformanceSummary: () => ReturnType<PerformanceMonitor['getPerformanceSummary']>;
  recordRender: (componentName: string, renderTime: number) => void;
  recordComponentLifecycle: (componentName: string, action: 'mount' | 'unmount') => void;
  clearMetrics: () => void;
}

/**
 * Custom hook for performance monitoring
 */
export const usePerformance = (config: UsePerformanceConfig = {}): UsePerformanceReturn => {
  const {
    enableAutoStart = true,
    enableComponentTracking = true,
    enableRenderTracking = true,
    onPerformanceAlert,
    ...monitorConfig
  } = config;

  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Initialize performance monitor synchronously
  if (!monitorRef.current) {
    monitorRef.current = new PerformanceMonitor({
      enableMonitoring: true,
      enableMemoryTracking: true,
      enableRenderTracking,
      enableNetworkTracking: true,
      enableCacheTracking: true,
      sampleRate: 1.0,
      maxMetricsHistory: 1000,
      alertThresholds: {
        renderTime: 100,
        memoryUsage: 100,
        bundleSize: 1000,
      },
      ...monitorConfig,
    });
  }

  // Initialize performance monitor
  useEffect(() => {
    if (enableAutoStart && monitorRef.current) {
      monitorRef.current.start();
      setIsRecording(true);
    }

    return () => {
      monitorRef.current?.stop();
    };
  }, [enableAutoStart]);

  // Start recording
  const startRecording = useCallback(() => {
    monitorRef.current?.start();
    setIsRecording(true);
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    monitorRef.current?.stop();
    setIsRecording(false);
  }, []);

  // Get current metrics
  const getCurrentMetrics = useCallback((): PerformanceMetrics | null => {
    return monitorRef.current?.getCurrentMetrics() || null;
  }, []);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    return monitorRef.current?.getPerformanceSummary() || {
      averageRenderTime: 0,
      peakMemoryUsage: 0,
      totalNetworkRequests: 0,
      averageCacheHitRate: 0,
      performanceScore: 100,
    };
  }, []);

  // Record render performance
  const recordRender = useCallback((componentName: string, renderTime: number) => {
    if (enableRenderTracking) {
      monitorRef.current?.recordRender(componentName, renderTime);
    }
  }, [enableRenderTracking]);

  // Record component lifecycle
  const recordComponentLifecycle = useCallback((componentName: string, action: 'mount' | 'unmount') => {
    if (enableComponentTracking) {
      monitorRef.current?.recordComponentLifecycle(componentName, action);
    }
  }, [enableComponentTracking]);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    monitorRef.current?.clearMetrics();
  }, []);

  return {
    monitor: monitorRef.current!,
    isRecording,
    startRecording,
    stopRecording,
    getCurrentMetrics,
    getPerformanceSummary,
    recordRender,
    recordComponentLifecycle,
    clearMetrics,
  };
};

/**
 * Virtual scrolling hook configuration
 */
export interface UseVirtualScrollConfig extends VirtualScrollConfig {
  onStateChange?: (state: VirtualScrollState) => void;
}

/**
 * Virtual scrolling hook return type
 */
export interface UseVirtualScrollReturn {
  manager: VirtualScrollManager;
  state: VirtualScrollState;
  setItems: (items: any[]) => void;
  handleScroll: (scrollTop: number, scrollLeft?: number) => void;
  scrollToItem: (index: number) => void;
  getVisibleItems: () => { items: any[]; startIndex: number; endIndex: number };
}

/**
 * Custom hook for virtual scrolling
 */
export const useVirtualScroll = (config: UseVirtualScrollConfig): UseVirtualScrollReturn => {
  const {
    onStateChange,
    ...managerConfig
  } = config;

  const [state, setState] = useState<VirtualScrollState>({
    scrollTop: 0,
    scrollLeft: 0,
    visibleStartIndex: 0,
    visibleEndIndex: 0,
    totalHeight: 0,
    totalWidth: 0,
  });

  const managerRef = useRef<VirtualScrollManager | null>(null);

  // Initialize virtual scroll manager
  useEffect(() => {
    managerRef.current = new VirtualScrollManager(managerConfig, (newState) => {
      setState(newState);
      onStateChange?.(newState);
    });

    return () => {
      managerRef.current = null;
    };
  }, [managerConfig, onStateChange]);

  // Set items
  const setItems = useCallback((items: any[]) => {
    managerRef.current?.setItems(items);
  }, []);

  // Handle scroll
  const handleScroll = useCallback((scrollTop: number, scrollLeft: number = 0) => {
    managerRef.current?.handleScroll(scrollTop, scrollLeft);
  }, []);

  // Scroll to item
  const scrollToItem = useCallback((index: number) => {
    managerRef.current?.scrollToItem(index);
  }, []);

  // Get visible items
  const getVisibleItems = useCallback(() => {
    return managerRef.current?.getVisibleItems() || { items: [], startIndex: 0, endIndex: 0 };
  }, []);

  return {
    manager: managerRef.current!,
    state,
    setItems,
    handleScroll,
    scrollToItem,
    getVisibleItems,
  };
};

/**
 * Cache management hook configuration
 */
export interface UseCacheConfig {
  maxSize?: number;
  defaultTTL?: number;
  enableStats?: boolean;
}

/**
 * Cache management hook return type
 */
export interface UseCacheReturn {
  cache: CacheManager;
  set: (key: string, data: any, ttl?: number) => void;
  get: (key: string) => any | null;
  has: (key: string) => boolean;
  delete: (key: string) => boolean;
  clear: () => void;
  getStats: () => ReturnType<CacheManager['getStats']>;
}

/**
 * Custom hook for cache management
 */
export const useCache = (config: UseCacheConfig = {}): UseCacheReturn => {
  const {
    maxSize = 1000,
    defaultTTL = 300000, // 5 minutes
  } = config;

  const cacheRef = useRef<CacheManager | null>(null);

  // Initialize cache manager
  useEffect(() => {
    cacheRef.current = new CacheManager(maxSize, defaultTTL);
  }, [maxSize, defaultTTL]);

  // Set cache entry
  const set = useCallback((key: string, data: any, ttl?: number) => {
    cacheRef.current?.set(key, data, ttl);
  }, []);

  // Get cache entry
  const get = useCallback((key: string) => {
    return cacheRef.current?.get(key) || null;
  }, []);

  // Check if key exists
  const has = useCallback((key: string) => {
    return cacheRef.current?.has(key) || false;
  }, []);

  // Delete cache entry
  const deleteEntry = useCallback((key: string) => {
    return cacheRef.current?.delete(key) || false;
  }, []);

  // Clear cache
  const clear = useCallback(() => {
    cacheRef.current?.clear();
  }, []);

  // Get cache stats
  const getStats = useCallback(() => {
    return cacheRef.current?.getStats() || {
      size: 0,
      maxSize: maxSize,
      hitRate: 0,
      memoryUsage: 0,
    };
  }, [maxSize]);

  return {
    cache: cacheRef.current!,
    set,
    get,
    has,
    delete: deleteEntry,
    clear,
    getStats,
  };
};

/**
 * Performance optimization hook
 */
export interface UsePerformanceOptimizationReturn {
  debounce: <T extends (...args: any[]) => any>(func: T, delay: number) => T;
  throttle: <T extends (...args: any[]) => any>(func: T, delay: number) => T;
  memoize: <T extends (...args: any[]) => any>(func: T) => T;
  useMemoizedCallback: <T extends (...args: any[]) => any>(callback: T, deps: React.DependencyList) => T;
}

/**
 * Custom hook for performance optimizations
 */
export const usePerformanceOptimization = (): UsePerformanceOptimizationReturn => {
  // Debounce function
  const debounce = useCallback(<T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  }, []);

  // Throttle function
  const throttle = useCallback(<T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let lastCall = 0;
    return ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    }) as T;
  }, []);

  // Memoize function
  const memoize = useCallback(<T extends (...args: any[]) => any>(func: T): T => {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }, []);

  // Memoized callback
  const useMemoizedCallback = useCallback(<T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList
  ): T => {
    return React.useCallback(callback, deps) as T;
  }, []);

  return {
    debounce,
    throttle,
    memoize,
    useMemoizedCallback,
  };
};
