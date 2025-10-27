/**
 * Add Ticket Modal Component
 * Form for creating new tickets in a specific status column
 */

import React, { useState } from 'react';
import { Modal } from '../ui';
import { TicketStatus } from '../../types';
import './add-ticket-modal.css';

export interface AddTicketModalProps {
  isOpen: boolean;
  status: TicketStatus;
  onClose: () => void;
  onSubmit: (ticket: {
    title: string;
    description?: string;
    epic?: string;
  }) => void;
}

export const AddTicketModal: React.FC<AddTicketModalProps> = ({
  isOpen,
  status,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [epic, setEpic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a ticket title');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        epic: epic.trim() || undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setEpic('');
      onClose();
    } catch (error) {
      console.error('Failed to create ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle('');
      setDescription('');
      setEpic('');
      onClose();
    }
  };

  const statusNames: Record<TicketStatus, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done',
    BACKLOG: 'Backlog',
    REVIEW: 'Review',
    TESTING: 'Testing',
    BLOCKED: 'Blocked',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Add New Ticket - ${statusNames[status]}`}
      size='md'
    >
      <form onSubmit={handleSubmit} className='add-ticket-form'>
        <div className='add-ticket-form__field'>
          <label htmlFor='ticket-title' className='add-ticket-form__label'>
            Title <span className='required'>*</span>
          </label>
          <input
            id='ticket-title'
            type='text'
            className='add-ticket-form__input'
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder='Enter ticket title'
            required
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        <div className='add-ticket-form__field'>
          <label
            htmlFor='ticket-description'
            className='add-ticket-form__label'
          >
            Description
          </label>
          <textarea
            id='ticket-description'
            className='add-ticket-form__textarea'
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder='Enter ticket description'
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        <div className='add-ticket-form__field'>
          <label htmlFor='ticket-epic' className='add-ticket-form__label'>
            Epic Key (Optional)
          </label>
          <input
            id='ticket-epic'
            type='text'
            className='add-ticket-form__input'
            value={epic}
            onChange={e => setEpic(e.target.value)}
            placeholder='e.g., FW-1'
            disabled={isSubmitting}
          />
        </div>

        <div className='add-ticket-form__actions'>
          <button
            type='button'
            className='add-ticket-form__button add-ticket-form__button--cancel'
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type='submit'
            className='add-ticket-form__button add-ticket-form__button--submit'
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
