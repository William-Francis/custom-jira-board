/**
 * Performance Monitoring Component
 * Displays real-time performance metrics and optimization suggestions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  PerformanceMonitor,
  PerformanceMetrics,
} from '../../utils/performance';
import './performance-monitor.css';

/**
 * Performance Monitor Props
 */
export interface PerformanceMonitorProps {
  monitor: PerformanceMonitor;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  showDetailedMetrics?: boolean;
  enableAlerts?: boolean;
}

/**
 * Performance Monitor Component
 */
export const PerformanceMonitorComponent: React.FC<PerformanceMonitorProps> = ({
  monitor,
  isOpen,
  onClose,
  className = '',
  showDetailedMetrics = false,
  enableAlerts = true,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [summary, setSummary] = useState(() => {
    try {
      return (
        monitor?.getPerformanceSummary() || {
          averageRenderTime: 0,
          peakMemoryUsage: 0,
          totalNetworkRequests: 0,
          averageCacheHitRate: 0,
          performanceScore: 100,
        }
      );
    } catch (error) {
      return {
        averageRenderTime: 0,
        peakMemoryUsage: 0,
        totalNetworkRequests: 0,
        averageCacheHitRate: 0,
        performanceScore: 100,
      };
    }
  });
  const [isRecording, setIsRecording] = useState(false);

  // Update metrics periodically
  useEffect(() => {
    if (!isOpen || !monitor) return;

    const interval = setInterval(() => {
      try {
        const currentMetrics = monitor.getCurrentMetrics();
        const performanceSummary = monitor.getPerformanceSummary();

        if (currentMetrics) {
          setMetrics(prev => [...prev.slice(-50), currentMetrics]); // Keep last 50 metrics
        }
        setSummary(performanceSummary);
      } catch (error) {
        console.warn('Error updating performance metrics:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, monitor]);

  // Handle start/stop recording
  const handleToggleRecording = useCallback(() => {
    if (!monitor) return;

    if (isRecording) {
      monitor.stop();
      setIsRecording(false);
    } else {
      monitor.start();
      setIsRecording(true);
    }
  }, [isRecording, monitor]);

  // Handle clear metrics
  const handleClearMetrics = useCallback(() => {
    if (!monitor) return;
    monitor.clearMetrics();
    setMetrics([]);
  }, [monitor]);

  // Format memory usage
  const formatMemory = useCallback((bytes: number): string => {
    return `${bytes.toFixed(2)} MB`;
  }, []);

  // Format time
  const formatTime = useCallback((ms: number): string => {
    return `${ms.toFixed(2)} ms`;
  }, []);

  // Get performance score color
  const getScoreColor = useCallback((score: number): string => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--color-warning)';
    return 'var(--color-error)';
  }, []);

  // Get performance score label
  const getScoreLabel = useCallback((score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  }, []);

  if (!isOpen) return null;

  // Show loading state if monitor is not ready
  if (!monitor) {
    return (
      <div className='performance-monitor'>
        <div className='performance-monitor__overlay' onClick={onClose} />
        <div className='performance-monitor__content'>
          <div className='performance-monitor__header'>
            <h3 className='performance-monitor__title'>Performance Monitor</h3>
            <button
              type='button'
              className='performance-monitor__action'
              onClick={onClose}
              title='Close monitor'
            >
              ✕
            </button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div>Loading performance monitor...</div>
          </div>
        </div>
      </div>
    );
  }

  const monitorClasses = ['performance-monitor', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={monitorClasses}>
      <div className='performance-monitor__overlay' onClick={onClose} />

      <div className='performance-monitor__content'>
        {/* Header */}
        <div className='performance-monitor__header'>
          <h3 className='performance-monitor__title'>Performance Monitor</h3>
          <div className='performance-monitor__actions'>
            <button
              type='button'
              className={`performance-monitor__action ${
                isRecording ? 'performance-monitor__action--recording' : ''
              }`}
              onClick={handleToggleRecording}
              title={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? '⏹️' : '⏺️'}
            </button>
            <button
              type='button'
              className='performance-monitor__action'
              onClick={handleClearMetrics}
              title='Clear metrics'
            >
              🗑️
            </button>
            <button
              type='button'
              className='performance-monitor__action'
              onClick={onClose}
              title='Close monitor'
            >
              ✕
            </button>
          </div>
        </div>

        {/* Performance Score */}
        <div className='performance-monitor__score'>
          <div className='performance-monitor__score-circle'>
            <div
              className='performance-monitor__score-fill'
              style={{
                background: `conic-gradient(${getScoreColor(summary.performanceScore)} ${summary.performanceScore * 3.6}deg, var(--bg-tertiary) 0deg)`,
              }}
            />
            <div className='performance-monitor__score-text'>
              <span className='performance-monitor__score-value'>
                {Math.round(summary.performanceScore)}
              </span>
              <span className='performance-monitor__score-label'>
                {getScoreLabel(summary.performanceScore)}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className='performance-monitor__metrics'>
          <div className='performance-monitor__metric'>
            <div className='performance-monitor__metric-label'>
              Average Render Time
            </div>
            <div className='performance-monitor__metric-value'>
              {formatTime(summary.averageRenderTime)}
            </div>
          </div>

          <div className='performance-monitor__metric'>
            <div className='performance-monitor__metric-label'>
              Peak Memory Usage
            </div>
            <div className='performance-monitor__metric-value'>
              {formatMemory(summary.peakMemoryUsage)}
            </div>
          </div>

          <div className='performance-monitor__metric'>
            <div className='performance-monitor__metric-label'>
              Network Requests
            </div>
            <div className='performance-monitor__metric-value'>
              {summary.totalNetworkRequests}
            </div>
          </div>

          <div className='performance-monitor__metric'>
            <div className='performance-monitor__metric-label'>
              Cache Hit Rate
            </div>
            <div className='performance-monitor__metric-value'>
              {(summary.averageCacheHitRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        {showDetailedMetrics && metrics.length > 0 && (
          <div className='performance-monitor__detailed'>
            <h4 className='performance-monitor__detailed-title'>
              Recent Metrics ({metrics.length})
            </h4>
            <div className='performance-monitor__detailed-list'>
              {metrics.slice(-10).map((metric, index) => (
                <div key={index} className='performance-monitor__detailed-item'>
                  <div className='performance-monitor__detailed-time'>
                    {metric.timestamp.toLocaleTimeString()}
                  </div>
                  <div className='performance-monitor__detailed-values'>
                    <span>Render: {formatTime(metric.renderTime)}</span>
                    <span>Memory: {formatMemory(metric.memoryUsage)}</span>
                    <span>
                      Cache: {(metric.cacheHitRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimization Suggestions */}
        {enableAlerts && (
          <div className='performance-monitor__suggestions'>
            <h4 className='performance-monitor__suggestions-title'>
              Optimization Suggestions
            </h4>
            <div className='performance-monitor__suggestions-list'>
              {summary.averageRenderTime > 50 && (
                <div className='performance-monitor__suggestion performance-monitor__suggestion--warning'>
                  ⚠️ Consider using React.memo() for expensive components
                </div>
              )}
              {summary.peakMemoryUsage > 50 && (
                <div className='performance-monitor__suggestion performance-monitor__suggestion--warning'>
                  ⚠️ High memory usage detected. Check for memory leaks
                </div>
              )}
              {summary.averageCacheHitRate < 0.8 && (
                <div className='performance-monitor__suggestion performance-monitor__suggestion--info'>
                  💡 Improve cache hit rate by optimizing cache keys
                </div>
              )}
              {summary.performanceScore >= 80 && (
                <div className='performance-monitor__suggestion performance-monitor__suggestion--success'>
                  ✅ Performance is excellent! Keep up the good work
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className='performance-monitor__footer'>
          <div className='performance-monitor__status'>
            {isRecording ? (
              <span className='performance-monitor__status--recording'>
                🔴 Recording
              </span>
            ) : (
              <span className='performance-monitor__status--stopped'>
                ⚫ Stopped
              </span>
            )}
          </div>
          <div className='performance-monitor__timestamp'>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitorComponent;
