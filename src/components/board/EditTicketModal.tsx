/**
 * Edit Ticket Modal Component
 * Form for editing existing tickets
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui';
import { Ticket } from '../../types';
import './add-ticket-modal.css';

export interface EditTicketModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onSubmit: (ticket: {
    title: string;
    description?: string;
    epic?: string;
  }) => void;
}

export const EditTicketModal: React.FC<EditTicketModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [epic, setEpic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when ticket changes
  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title || '');
      setDescription(ticket.description || '');
      setEpic(ticket.epic || '');
    }
  }, [ticket]);

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
      onClose();
    } catch (error) {
      console.error('Failed to update ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!ticket) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Edit Ticket - ${ticket.key}`}
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
            {isSubmitting ? 'Updating...' : 'Update Ticket'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
