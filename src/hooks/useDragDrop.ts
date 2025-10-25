/**
 * Enhanced Drag and Drop Hook
 * Provides advanced drag-and-drop functionality with visual feedback
 */

import { useCallback, useRef, useState } from 'react';
import { Ticket as TicketType, TicketStatus } from '../types';
import { dragDropUtils } from '../contexts';

/**
 * Drag and Drop Hook Configuration
 */
export interface UseDragDropConfig {
  onDragStart?: (ticket: TicketType) => void;
  onDragEnd?: (ticket: TicketType) => void;
  onDrop?: (ticket: TicketType, targetStatus: TicketStatus, targetTicketId?: string, position?: 'above' | 'below') => void;
  onDragOver?: (ticket: TicketType, targetStatus: TicketStatus) => void;
  onDragLeave?: (ticket: TicketType) => void;
  enableVisualFeedback?: boolean;
  dragThreshold?: number;
}

/**
 * Drag and Drop Hook Return Type
 */
export interface UseDragDropReturn {
  isDragging: boolean;
  draggedTicket: TicketType | null;
  dragOverElement: string | null;
  dragPosition: 'above' | 'below' | null;
  startDrag: (ticket: TicketType, event: React.DragEvent) => void;
  endDrag: (event: React.DragEvent) => void;
  handleDragOver: (event: React.DragEvent, targetStatus: TicketStatus) => void;
  handleDragLeave: (event: React.DragEvent) => void;
  handleDrop: (event: React.DragEvent, targetStatus: TicketStatus) => void;
  isDragOver: (elementId: string) => boolean;
  getDragPosition: (elementId: string) => 'above' | 'below' | null;
}

/**
 * Enhanced Drag and Drop Hook
 */
export const useDragDrop = (config: UseDragDropConfig = {}): UseDragDropReturn => {
  const {
    onDragStart,
    onDragEnd,
    onDrop,
    onDragOver,
    onDragLeave,
    enableVisualFeedback = true,
    // dragThreshold = 5,
  } = config;

  const [isDragging, setIsDragging] = useState(false);
  const [draggedTicket, setDraggedTicket] = useState<TicketType | null>(null);
  const [dragOverElement, setDragOverElement] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<'above' | 'below' | null>(null);

  const dragStartTime = useRef<number>(0);
  const dragPreview = useRef<HTMLElement | null>(null);
  const lastDragOverElement = useRef<string | null>(null);

  /**
   * Start drag operation
   */
  const startDrag = useCallback((ticket: TicketType, event: React.DragEvent) => {
    dragStartTime.current = Date.now();
    setIsDragging(true);
    setDraggedTicket(ticket);

    // Set drag effect
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', ticket.id);

    // Create custom drag preview
    if (enableVisualFeedback) {
      const element = event.currentTarget as HTMLElement;
      dragPreview.current = dragDropUtils.createDragPreview(element);
      event.dataTransfer.setDragImage(dragPreview.current, 0, 0);
    }

    onDragStart?.(ticket);
  }, [onDragStart, enableVisualFeedback]);

  /**
   * End drag operation
   */
  const endDrag = useCallback((_event: React.DragEvent) => {
    // const dragDuration = Date.now() - dragStartTime.current;
    
    // Clean up drag preview
    if (dragPreview.current) {
      dragDropUtils.removeDragPreview(dragPreview.current);
      dragPreview.current = null;
    }

    // Reset state
    setIsDragging(false);
    setDraggedTicket(null);
    setDragOverElement(null);
    setDragPosition(null);
    lastDragOverElement.current = null;

    onDragEnd?.(draggedTicket!);
  }, [onDragEnd, draggedTicket]);

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback((_event: React.DragEvent, targetStatus: TicketStatus) => {
    // event.preventDefault();
    // event.dataTransfer.dropEffect = 'move';

    // const targetElement = event.currentTarget as HTMLElement;
    // const elementId = targetElement.id || targetElement.getAttribute('data-element-id') || 'unknown';
    
    // // Calculate drop position
    // const position = dragDropUtils.calculateDropPosition(event, targetElement);
    
    // // Update drag over state
    // if (lastDragOverElement.current !== elementId) {
    //   setDragOverElement(elementId);
    //   setDragPosition(position);
    //   lastDragOverElement.current = elementId;
    // }

    onDragOver?.(draggedTicket!, targetStatus);
  }, [onDragOver, draggedTicket]);

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    const targetElement = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement;
    
    // Only clear if actually leaving the element
    if (!targetElement.contains(relatedTarget)) {
      setDragOverElement(null);
      setDragPosition(null);
      lastDragOverElement.current = null;
      
      onDragLeave?.(draggedTicket!);
    }
  }, [onDragLeave, draggedTicket]);

  /**
   * Handle drop
   */
  const handleDrop = useCallback((event: React.DragEvent, targetStatus: TicketStatus) => {
    event.preventDefault();
    
    // const dragDuration = Date.now() - dragStartTime.current;
    
    // Only process drop if drag was significant enough
    // if (dragDuration > 100 && draggedTicket) {
    if (draggedTicket) {
      const targetElement = event.currentTarget as HTMLElement;
      const elementId = targetElement.id || targetElement.getAttribute('data-element-id');
      const position = dragDropUtils.calculateDropPosition(event, targetElement);
      
      onDrop?.(draggedTicket, targetStatus, elementId || undefined, position);
    }
  }, [onDrop, draggedTicket]);

  /**
   * Check if element is being dragged over
   */
  const isDragOver = useCallback((elementId: string) => {
    return dragOverElement === elementId;
  }, [dragOverElement]);

  /**
   * Get drag position relative to element
   */
  const getDragPosition = useCallback((elementId: string) => {
    if (dragOverElement === elementId) {
      return dragPosition;
    }
    return null;
  }, [dragOverElement, dragPosition]);

  return {
    isDragging,
    draggedTicket,
    dragOverElement,
    dragPosition,
    startDrag,
    endDrag,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragOver,
    getDragPosition,
  };
};

export default useDragDrop;
