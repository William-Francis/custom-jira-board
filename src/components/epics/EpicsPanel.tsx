/**
 * Epics Panel Component
 * Displays all epics and their associated tickets for the sprint
 */

import React from 'react';
import { Ticket } from '../../types';
import './epics-panel.css';

export interface EpicsPanelProps {
  tickets: Ticket[];
  isOpen: boolean;
  onClose: () => void;
}

export const EpicsPanel: React.FC<EpicsPanelProps> = ({
  tickets,
  isOpen,
  onClose,
}) => {
  // Group tickets by epic
  const groupTicketsByEpic = () => {
    const epicMap: Record<string, { tickets: Ticket[]; epicName: string }> = {};

    tickets.forEach(ticket => {
      const epicKey = ticket.epic || 'No Epic';
      if (!epicMap[epicKey]) {
        epicMap[epicKey] = {
          tickets: [],
          epicName: ticket.epicName || epicKey,
        };
      }
      epicMap[epicKey].tickets.push(ticket);
    });

    return epicMap;
  };

  const getEpicStats = (epicTickets: Ticket[]) => {
    const total = epicTickets.length;
    const done = epicTickets.filter(t => t.status === 'DONE').length;
    const inProgress = epicTickets.filter(
      t =>
        t.status === 'IN_PROGRESS' ||
        t.status === 'IN_REVIEW' ||
        t.status === 'TESTING'
    ).length;
    const todo = epicTickets.filter(
      t => t.status === 'TODO' || t.status === 'BACKLOG'
    ).length;

    return { total, done, inProgress, todo };
  };

  if (!isOpen) return null;

  const epicMap = groupTicketsByEpic();
  const epicKeys = Object.keys(epicMap).sort();

  return (
    <div className='epics-panel-overlay' onClick={onClose}>
      <div className='epics-panel' onClick={e => e.stopPropagation()}>
        <div className='epics-panel__header'>
          <h2>Sprint Epics</h2>
          <button
            className='epics-panel__close'
            onClick={onClose}
            aria-label='Close epics panel'
          >
            ×
          </button>
        </div>

        <div className='epics-panel__content'>
          {epicKeys.length === 0 ? (
            <div className='epics-panel__empty'>
              <p>No epics found in this sprint</p>
            </div>
          ) : (
            epicKeys.map(epicKey => {
              const { tickets: epicTickets, epicName } = epicMap[epicKey];
              const stats = getEpicStats(epicTickets);
              const progressPercentage =
                stats.total > 0 ? (stats.done / stats.total) * 100 : 0;

              return (
                <div key={epicKey} className='epic-card'>
                  <div className='epic-card__header'>
                    <div>
                      <h3 className='epic-card__title'>{epicName}</h3>
                      {epicKey !== 'No Epic' && (
                        <p className='epic-card__key'>{epicKey}</p>
                      )}
                    </div>
                    <div className='epic-card__stats'>
                      <span className='epic-card__stat'>
                        📊 {stats.total} total
                      </span>
                      <span className='epic-card__stat'>
                        ✅ {stats.done} done
                      </span>
                      <span className='epic-card__stat'>
                        🔄 {stats.inProgress} in progress
                      </span>
                      <span className='epic-card__stat'>
                        📋 {stats.todo} todo
                      </span>
                    </div>
                  </div>

                  <div className='epic-card__progress'>
                    <div className='epic-card__progress-bar'>
                      <div
                        className='epic-card__progress-fill'
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span className='epic-card__progress-text'>
                      {Math.round(progressPercentage)}% complete
                    </span>
                  </div>

                  <div className='epic-card__tickets'>
                    {epicTickets.map(ticket => (
                      <div key={ticket.id} className='epic-ticket'>
                        <div className='epic-ticket__key'>{ticket.key}</div>
                        <div className='epic-ticket__title'>{ticket.title}</div>
                        <div className='epic-ticket__status'>
                          <span
                            className={`status-badge status-badge--${ticket.status.toLowerCase()}`}
                          >
                            {ticket.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
