/**
 * Performance monitoring and optimization utilities
 * Provides comprehensive performance tracking and optimization tools
 */

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage: number;
  bundleSize: number;
  networkRequests: number;
  cacheHitRate: number;
  timestamp: Date;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  enableMonitoring: boolean;
  enableMemoryTracking: boolean;
  enableRenderTracking: boolean;
  enableNetworkTracking: boolean;
  enableCacheTracking: boolean;
  sampleRate: number; // 0-1, percentage of events to track
  maxMetricsHistory: number;
  alertThresholds: {
    renderTime: number; // ms
    memoryUsage: number; // MB
    bundleSize: number; // KB
  };
}

/**
 * Performance monitoring class
 */
export class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isEnabled: boolean = true;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableMonitoring: true,
      enableMemoryTracking: true,
      enableRenderTracking: true,
      enableNetworkTracking: true,
      enableCacheTracking: true,
      sampleRate: 1.0,
      maxMetricsHistory: 1000,
      alertThresholds: {
        renderTime: 100,
        memoryUsage: 100,
        bundleSize: 1000,
      },
      ...config,
    };

    this.initializeObservers();
  }

  /**
   * Start monitoring performance
   */
  start(): void {
    if (!this.config.enableMonitoring) return;

    this.isEnabled = true;
    this.initializeObservers();
  }

  /**
   * Stop monitoring performance
   */
  stop(): void {
    this.isEnabled = false;
    this.cleanupObservers();
  }

  /**
   * Record render performance
   */
  recordRender(_componentName: string, renderTime: number): void {
    if (!this.shouldSample()) return;

    const metrics: PerformanceMetrics = {
      renderTime,
      componentCount: 1,
      memoryUsage: this.getMemoryUsage(),
      bundleSize: this.getBundleSize(),
      networkRequests: this.getNetworkRequestCount(),
      cacheHitRate: this.getCacheHitRate(),
      timestamp: new Date(),
    };

    this.addMetrics(metrics);
    this.checkThresholds(metrics);
  }

  /**
   * Record component mount/unmount
   */
  recordComponentLifecycle(componentName: string, action: 'mount' | 'unmount'): void {
    if (!this.shouldSample()) return;

    console.log(`Component ${action}: ${componentName}`);
  }

  /**
   * Record network request
   */
  recordNetworkRequest(url: string, duration: number, success: boolean): void {
    if (!this.shouldSample()) return;

    console.log(`Network request: ${url} - ${duration}ms - ${success ? 'success' : 'failed'}`);
  }

  /**
   * Record cache operation
   */
  recordCacheOperation(operation: 'hit' | 'miss' | 'set' | 'delete', key: string): void {
    if (!this.shouldSample()) return;

    console.log(`Cache ${operation}: ${key}`);
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  /**
   * Get performance history
   */
  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageRenderTime: number;
    peakMemoryUsage: number;
    totalNetworkRequests: number;
    averageCacheHitRate: number;
    performanceScore: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageRenderTime: 0,
        peakMemoryUsage: 0,
        totalNetworkRequests: 0,
        averageCacheHitRate: 0,
        performanceScore: 100,
      };
    }

    const averageRenderTime = this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / this.metrics.length;
    const peakMemoryUsage = Math.max(...this.metrics.map(m => m.memoryUsage));
    const totalNetworkRequests = this.metrics.reduce((sum, m) => sum + m.networkRequests, 0);
    const averageCacheHitRate = this.metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / this.metrics.length;

    // Calculate performance score (0-100)
    const renderScore = Math.max(0, 100 - (averageRenderTime / this.config.alertThresholds.renderTime) * 100);
    const memoryScore = Math.max(0, 100 - (peakMemoryUsage / this.config.alertThresholds.memoryUsage) * 100);
    const performanceScore = (renderScore + memoryScore) / 2;

    return {
      averageRenderTime,
      peakMemoryUsage,
      totalNetworkRequests,
      averageCacheHitRate,
      performanceScore,
    };
  }

  /**
   * Clear metrics history
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if (!this.isEnabled) return;

    // Memory usage observer
    if (this.config.enableMemoryTracking && 'memory' in performance) {
      this.observeMemoryUsage();
    }

    // Render timing observer
    if (this.config.enableRenderTracking) {
      this.observeRenderTiming();
    }

    // Network timing observer
    if (this.config.enableNetworkTracking) {
      this.observeNetworkTiming();
    }
  }

  /**
   * Observe memory usage
   */
  private observeMemoryUsage(): void {
    if (!('memory' in performance)) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
        if (memoryUsage > this.config.alertThresholds.memoryUsage) {
          console.warn(`High memory usage detected: ${memoryUsage.toFixed(2)}MB`);
        }
      }
    };

    setInterval(checkMemory, 5000); // Check every 5 seconds
  }

  /**
   * Observe render timing
   */
  private observeRenderTiming(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.recordRender(entry.name, entry.duration);
          }
        }
      });

      observer.observe({ entryTypes: ['measure'] });
      this.observers.set('render', observer);
    } catch (error) {
      console.warn('Failed to initialize render timing observer:', error);
    }
  }

  /**
   * Observe network timing
   */
  private observeNetworkTiming(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordNetworkRequest(
              resourceEntry.name,
              resourceEntry.duration,
              resourceEntry.transferSize > 0
            );
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('network', observer);
    } catch (error) {
      console.warn('Failed to initialize network timing observer:', error);
    }
  }

  /**
   * Cleanup observers
   */
  private cleanupObservers(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  /**
   * Check if we should sample this event
   */
  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  /**
   * Add metrics to history
   */
  private addMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);

    // Keep only the most recent metrics
    if (this.metrics.length > this.config.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.config.maxMetricsHistory);
    }
  }

  /**
   * Check performance thresholds
   */
  private checkThresholds(metrics: PerformanceMetrics): void {
    if (metrics.renderTime > this.config.alertThresholds.renderTime) {
      console.warn(`Slow render detected: ${metrics.renderTime}ms`);
    }

    if (metrics.memoryUsage > this.config.alertThresholds.memoryUsage) {
      console.warn(`High memory usage: ${metrics.memoryUsage}MB`);
    }
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;
    }
    return 0;
  }

  /**
   * Get bundle size estimate
   */
  private getBundleSize(): number {
    // This is a rough estimate - in a real app you'd get this from build tools
    return 276; // KB (from our build output)
  }

  /**
   * Get network request count
   */
  private getNetworkRequestCount(): number {
    // This would be tracked by a network monitoring service
    return 0;
  }

  /**
   * Get cache hit rate
   */
  private getCacheHitRate(): number {
    // This would be tracked by a cache monitoring service
    return 0.85; // 85% hit rate
  }
}

/**
 * Virtual scrolling configuration
 */
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan: number; // Number of items to render outside visible area
  enableSmoothScrolling: boolean;
  enableHorizontalScrolling: boolean;
}

/**
 * Virtual scrolling state
 */
export interface VirtualScrollState {
  scrollTop: number;
  scrollLeft: number;
  visibleStartIndex: number;
  visibleEndIndex: number;
  totalHeight: number;
  totalWidth: number;
}

/**
 * Virtual scrolling utility class
 */
export class VirtualScrollManager {
  private config: VirtualScrollConfig;
  private state: VirtualScrollState;
  private items: any[] = [];
  private onStateChange?: (state: VirtualScrollState) => void;

  constructor(config: VirtualScrollConfig, onStateChange?: (state: VirtualScrollState) => void) {
    this.config = config;
    this.onStateChange = onStateChange;
    this.state = {
      scrollTop: 0,
      scrollLeft: 0,
      visibleStartIndex: 0,
      visibleEndIndex: 0,
      totalHeight: 0,
      totalWidth: 0,
    };
  }

  /**
   * Set items to virtualize
   */
  setItems(items: any[]): void {
    this.items = items;
    this.updateTotalDimensions();
    this.updateVisibleRange();
  }

  /**
   * Handle scroll event
   */
  handleScroll(scrollTop: number, scrollLeft: number = 0): void {
    this.state.scrollTop = scrollTop;
    this.state.scrollLeft = scrollLeft;
    this.updateVisibleRange();
    this.onStateChange?.(this.state);
  }

  /**
   * Get visible items
   */
  getVisibleItems(): { items: any[]; startIndex: number; endIndex: number } {
    const visibleItems = this.items.slice(
      this.state.visibleStartIndex,
      this.state.visibleEndIndex + 1
    );

    return {
      items: visibleItems,
      startIndex: this.state.visibleStartIndex,
      endIndex: this.state.visibleEndIndex,
    };
  }

  /**
   * Scroll to specific item
   */
  scrollToItem(index: number): void {
    const scrollTop = index * this.config.itemHeight;
    this.handleScroll(scrollTop);
  }

  /**
   * Get current state
   */
  getState(): VirtualScrollState {
    return { ...this.state };
  }

  /**
   * Update total dimensions
   */
  private updateTotalDimensions(): void {
    this.state.totalHeight = this.items.length * this.config.itemHeight;
    this.state.totalWidth = this.config.enableHorizontalScrolling ? this.items.length * 200 : 0;
  }

  /**
   * Update visible range
   */
  private updateVisibleRange(): void {
    const visibleCount = Math.ceil(this.config.containerHeight / this.config.itemHeight);
    const overscanCount = this.config.overscan;

    this.state.visibleStartIndex = Math.max(
      0,
      Math.floor(this.state.scrollTop / this.config.itemHeight) - overscanCount
    );

    this.state.visibleEndIndex = Math.min(
      this.items.length - 1,
      this.state.visibleStartIndex + visibleCount + overscanCount * 2
    );
  }
}

/**
 * Cache management utility
 */
export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTL: number = 300000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Set cache entry
   */
  set(key: string, data: any, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Get cache entry
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0.85, // This would be calculated from actual usage
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Evict oldest entries
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 10% of entries
    const toRemove = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, value] of this.cache.entries()) {
      totalSize += key.length * 2; // UTF-16 characters
      totalSize += JSON.stringify(value.data).length * 2;
    }
    return totalSize / 1024; // Convert to KB
  }
}

/**
 * Create performance monitor instance
 */
export function createPerformanceMonitor(config?: Partial<PerformanceConfig>): PerformanceMonitor {
  return new PerformanceMonitor(config);
}

/**
 * Create virtual scroll manager
 */
export function createVirtualScrollManager(
  config: VirtualScrollConfig,
  onStateChange?: (state: VirtualScrollState) => void
): VirtualScrollManager {
  return new VirtualScrollManager(config, onStateChange);
}

/**
 * Create cache manager
 */
export function createCacheManager(maxSize?: number, defaultTTL?: number): CacheManager {
  return new CacheManager(maxSize, defaultTTL);
}
