import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ErrorBoundary,
  Board,
  KeyboardShortcutsHelp,
  KeyboardShortcutIndicator,
  NotificationPanel,
  NotificationBell,
  VirtualizedTicketList,
  PerformanceMonitorComponent,
} from './components';
import {
  useErrorHandler,
  useKeyboardShortcuts,
  useRealtime,
  usePerformance,
} from './hooks';
import { initializeEnvConfig } from './config/env';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isPerformanceMonitorOpen, setIsPerformanceMonitorOpen] =
    useState(false);

  // Initialize environment configuration
  useEffect(() => {
    initializeEnvConfig();
  }, []);

  // Initialize error handler
  const errorHandler = useErrorHandler({
    onError: (error: any) => console.log('Error occurred:', error),
    onCriticalError: (error: any) => console.error('Critical error:', error),
  });

  // Initialize keyboard shortcuts
  const keyboardShortcuts = useKeyboardShortcuts({
    enableShortcuts: true,
    showHelpOnF1: true,
    enableGlobalShortcuts: true,
    enableContextualShortcuts: true,
    debugMode: false,
    onShortcutExecuted: shortcut => {
      console.log(
        `Shortcut executed: ${shortcut.key} - ${shortcut.description}`
      );
    },
    onShortcutBlocked: (shortcut, reason) => {
      console.log(`Shortcut blocked: ${shortcut.key} - ${reason}`);
    },
  });

  // Initialize real-time updates and notifications
  const realtime = useRealtime({
    enableRealtime: true,
    enableNotifications: true,
    enableCollaboration: true,
    enableConflictResolution: true,
    enableMockMode: true,
    onEvent: event => {
      console.log('Real-time event received:', event);
    },
    onNotification: notification => {
      console.log('Notification received:', notification);
    },
    onCollaborationChange: state => {
      console.log('Collaboration state changed:', state);
    },
    onConflictDetected: conflict => {
      console.log('Conflict detected:', conflict);
    },
  });

  // Initialize performance monitoring
  const performance = usePerformance({
    enableAutoStart: true,
    enableComponentTracking: true,
    enableRenderTracking: true,
    onPerformanceAlert: metric => {
      console.warn('Performance alert:', metric);
    },
  });

  const handleButtonClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsModalOpen(true);
    }, 2000);
  };

  const handleTicketEdit = (ticket: any) => {
    console.log('Edit ticket:', ticket);
  };

  const handleTicketDelete = (ticketId: string) => {
    console.log('Delete ticket:', ticketId);
  };

  const handleTicketView = (ticket: any) => {
    console.log('View ticket:', ticket);
  };

  const handleTicketAdd = (status: any) => {
    console.log('Add ticket to status:', status);
  };

  const handleNotificationToggle = () => {
    setIsNotificationPanelOpen(!isNotificationPanelOpen);
  };

  const handleNotificationAction = (action: any) => {
    console.log('Notification action clicked:', action);
  };

  const handlePerformanceMonitorToggle = () => {
    setIsPerformanceMonitorOpen(!isPerformanceMonitorOpen);
  };

  return (
    <ErrorBoundary>
      <div className='app'>
        <header className='app-header'>
          <div className='app-header__content'>
            <h1>Jira Board Replica</h1>
            <p>Active Sprint Board with Enhanced Features</p>
          </div>
          <div className='app-header__actions'>
            <button
              type='button'
              className='app-header__action'
              onClick={handlePerformanceMonitorToggle}
              title='Open Performance Monitor'
            >
              📊
            </button>
            <NotificationBell
              unreadCount={realtime.unreadCount}
              isOpen={isNotificationPanelOpen}
              onToggle={handleNotificationToggle}
            />
          </div>
        </header>
        <main className='app-main'>
          <div className='demo-section'>
            <h2>
              Phase 5.5 Complete: Performance Optimizations and Virtualization
            </h2>
            <p>
              Successfully implemented comprehensive performance optimizations,
              virtual scrolling, and advanced caching strategies for optimal
              user experience.
            </p>

            <div className='demo-controls'>
              <Button
                variant='primary'
                onClick={handleButtonClick}
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Test Components'}
              </Button>

              <Button
                variant='secondary'
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
              >
                Open Modal
              </Button>
            </div>

            {/* Board Component */}
            <div className='board-container'>
              <Board
                boardId='board-1'
                onTicketEdit={handleTicketEdit}
                onTicketDelete={handleTicketDelete}
                onTicketView={handleTicketView}
                onTicketAdd={handleTicketAdd}
                showAddButtons={true}
                autoRefresh={false}
              />
            </div>

            {/* Virtualized Ticket List Demo */}
            <div className='virtualized-demo'>
              <h3>Virtualized Ticket List (Performance Demo)</h3>
              <p>
                This demonstrates virtual scrolling for handling large datasets
                efficiently. Only visible items are rendered, improving
                performance significantly.
              </p>
              <VirtualizedTicketList
                tickets={[]} // This would be populated with actual tickets
                onTicketClick={handleTicketView}
                onTicketEdit={handleTicketEdit}
                onTicketDelete={handleTicketDelete}
                itemHeight={120}
                containerHeight={400}
                overscan={5}
                showVirtualizationInfo={true}
                enableSmoothScrolling={true}
              />
            </div>

            {/* Error Display */}
            {errorHandler.hasErrors && (
              <div className='error-display'>
                <h3>Errors ({errorHandler.errors.length})</h3>
                {errorHandler.errors.slice(0, 3).map((error: any) => (
                  <div key={error.id} className='error-item'>
                    <span
                      className={`error-severity severity-${error.severity}`}
                    >
                      {error.severity}
                    </span>
                    <span className='error-message'>{error.message}</span>
                    <button
                      onClick={() => errorHandler.removeError(error.id)}
                      className='error-remove'
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title='Phase 5.5 Complete: Performance Optimizations and Virtualization'
            size='md'
          >
            <p>
              Successfully implemented comprehensive performance optimizations,
              virtual scrolling, and advanced caching strategies for optimal
              user experience.
            </p>
            <p>Features implemented:</p>
            <ul>
              <li>✅ Performance monitoring and metrics tracking</li>
              <li>✅ Virtual scrolling for large datasets</li>
              <li>✅ Advanced caching strategies</li>
              <li>✅ Lazy loading components and images</li>
              <li>✅ Memory usage optimization</li>
              <li>✅ Bundle size optimization</li>
              <li>✅ Real-time performance alerts</li>
              <li>✅ Performance optimization suggestions</li>
            </ul>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'flex-end',
              }}
            >
              <Button variant='secondary' onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </Modal>
        </main>

        {/* Keyboard Shortcuts Help */}
        <KeyboardShortcutsHelp
          isOpen={keyboardShortcuts.showHelp}
          onClose={() => keyboardShortcuts.setShowHelp(false)}
          shortcuts={keyboardShortcuts.getShortcutHelp()}
        />

        {/* Keyboard Shortcuts Indicator */}
        <KeyboardShortcutIndicator
          shortcuts={keyboardShortcuts.getContextualShortcuts()}
          visible={keyboardShortcuts.isEnabled}
          position='bottom-right'
        />

        {/* Notification Panel */}
        <NotificationPanel
          notifications={realtime.notifications}
          unreadCount={realtime.unreadCount}
          isOpen={isNotificationPanelOpen}
          onToggle={handleNotificationToggle}
          onMarkAsRead={realtime.markAsRead}
          onMarkAllAsRead={realtime.markAllAsRead}
          onRemove={realtime.removeNotification}
          onClearAll={realtime.clearAllNotifications}
          onActionClick={handleNotificationAction}
        />

        {/* Performance Monitor */}
        <PerformanceMonitorComponent
          monitor={performance.monitor}
          isOpen={isPerformanceMonitorOpen}
          onClose={() => setIsPerformanceMonitorOpen(false)}
          showDetailedMetrics={true}
          enableAlerts={true}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
