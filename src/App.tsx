import React, { useState, useEffect } from 'react';
import {
  ErrorBoundary,
  Board,
  KeyboardShortcutsHelp,
  KeyboardShortcutIndicator,
  NotificationPanel,
  NotificationBell,
  PerformanceMonitorComponent,
  Modal,
  EpicsPanel,
} from './components';
import {
  useErrorHandler,
  useKeyboardShortcuts,
  useRealtime,
  usePerformance,
} from './hooks';
import { initializeEnvConfig, envConfig } from './config/env';
import { Sprint } from './types';
import { boardService } from './services';

const App: React.FC = () => {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isPerformanceMonitorOpen, setIsPerformanceMonitorOpen] =
    useState(false);
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isTicketDetailsOpen, setIsTicketDetailsOpen] = useState(false);
  const [isEpicsViewOpen, setIsEpicsViewOpen] = useState(false);
  const [sprintTickets, setSprintTickets] = useState<any[]>([]);

  // Initialize environment configuration
  useEffect(() => {
    initializeEnvConfig();
  }, []);

  // Fetch active sprint details
  useEffect(() => {
    const fetchSprint = async () => {
      try {
        if (envConfig.jiraBoardId) {
          const activeSprint = await boardService.getActiveSprint(
            envConfig.jiraBoardId
          );
          setSprint(activeSprint);
        }
      } catch (error) {
        console.log('Could not fetch sprint details:', error);
      }
    };
    fetchSprint();
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

  const handleTicketEdit = (ticket: any) => {
    console.log('Edit ticket:', ticket);
  };

  const handleTicketDelete = (ticketId: string) => {
    console.log('Delete ticket:', ticketId);
  };

  const handleTicketView = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsTicketDetailsOpen(true);
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

  const handleTicketsChange = (tickets: any[]) => {
    setSprintTickets(tickets);
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
              onClick={() => setIsEpicsViewOpen(true)}
              title='View Sprint Epics'
            >
              📚
            </button>
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
            <div>
              <h2>
                {sprint ? `${sprint.name} - Active Sprint` : 'Jira Board'}
                {sprint?.goal && (
                  <span
                    style={{
                      fontSize: '0.8em',
                      color: '#666',
                      display: 'block',
                      marginTop: '0.5em',
                    }}
                  >
                    Goal: {sprint.goal}
                  </span>
                )}
              </h2>
              <p>
                {sprint
                  ? `Viewing ${sprint.name} sprint with live updates from Jira. Drag tickets between columns to update their status.`
                  : 'Successfully implemented live Jira integration with drag-and-drop functionality.'}
              </p>

              {/* Board Component */}

              <Board
                boardId={envConfig.jiraBoardId || 'board-1'}
                onTicketEdit={handleTicketEdit}
                onTicketDelete={handleTicketDelete}
                onTicketView={handleTicketView}
                onTicketAdd={handleTicketAdd}
                onTicketsChange={handleTicketsChange}
                showAddButtons={true}
                autoRefresh={false}
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

        {/* Epics Panel */}
        <EpicsPanel
          tickets={sprintTickets}
          isOpen={isEpicsViewOpen}
          onClose={() => setIsEpicsViewOpen(false)}
        />

        {/* Ticket Details Modal */}
        {selectedTicket && (
          <Modal
            isOpen={isTicketDetailsOpen}
            onClose={() => setIsTicketDetailsOpen(false)}
            title={`${selectedTicket.key}: ${selectedTicket.title}`}
            size='lg'
          >
            <div style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3
                  style={{
                    fontSize: '0.9em',
                    color: '#666',
                    marginBottom: '0.5rem',
                  }}
                >
                  Description
                </h3>
                <p style={{ margin: 0 }}>
                  {selectedTicket.description || 'No description provided'}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: '0.85em',
                      color: '#666',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Status
                  </h4>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.9em',
                      background: '#e8f5e9',
                      color: '#2e7d32',
                    }}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: '0.85em',
                      color: '#666',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Priority
                  </h4>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.9em',
                      background: '#fff3e0',
                      color: '#e65100',
                    }}
                  >
                    {selectedTicket.priority}
                  </span>
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: '0.85em',
                      color: '#666',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Issue Type
                  </h4>
                  <p style={{ margin: 0 }}>
                    {selectedTicket.issueType || 'Task'}
                  </p>
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: '0.85em',
                      color: '#666',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Created
                  </h4>
                  <p style={{ margin: 0 }}>
                    {selectedTicket.createdAt
                      ? new Date(selectedTicket.createdAt).toLocaleDateString()
                      : 'Unknown'}
                  </p>
                </div>
              </div>

              {selectedTicket.assignee && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4
                    style={{
                      fontSize: '0.85em',
                      color: '#666',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Assignee
                  </h4>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {selectedTicket.assignee.avatarUrl && (
                      <img
                        src={selectedTicket.assignee.avatarUrl}
                        alt={selectedTicket.assignee.name}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                        }}
                      />
                    )}
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>
                        {selectedTicket.assignee.name}
                      </p>
                      <p
                        style={{ margin: 0, fontSize: '0.85em', color: '#666' }}
                      >
                        {selectedTicket.assignee.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTicket.labels && selectedTicket.labels.length > 0 && (
                <div>
                  <h4
                    style={{
                      fontSize: '0.85em',
                      color: '#666',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Labels
                  </h4>
                  <div
                    style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
                  >
                    {selectedTicket.labels.map(
                      (label: string, index: number) => (
                        <span
                          key={index}
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.85em',
                            background: '#e3f2fd',
                            color: '#1976d2',
                          }}
                        >
                          {label}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              <div
                style={{
                  marginTop: '1.5rem',
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  onClick={() => setIsTicketDetailsOpen(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
