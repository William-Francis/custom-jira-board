/**
 * Drag and Drop Context and Provider
 * Provides centralized drag-and-drop state management and utilities
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Ticket as TicketType, TicketStatus } from '../types';

/**
 * Drag and Drop State
 */
interface DragState {
  isDragging: boolean;
  draggedTicket: TicketType | null;
  dragOverColumn: string | null;
  dragOverTicket: string | null;
  dragPosition: 'above' | 'below' | null;
}

/**
 * Drag and Drop Context Type
 */
interface DragDropContextType {
  dragState: DragState;
  startDrag: (ticket: TicketType) => void;
  endDrag: () => void;
  setDragOverColumn: (columnId: string | null) => void;
  setDragOverTicket: (
    ticketId: string | null,
    position?: 'above' | 'below'
  ) => void;
  clearDragOver: () => void;
  isDragOverColumn: (columnId: string) => boolean;
  isDragOverTicket: (ticketId: string) => boolean;
  getDragPosition: (ticketId: string) => 'above' | 'below' | null;
}

/**
 * Drag and Drop Provider Props
 */
export interface DragDropProviderProps {
  children: React.ReactNode;
  onTicketMove?: (
    ticketId: string,
    newStatus: TicketStatus,
    targetTicketId?: string,
    position?: 'above' | 'below'
  ) => void;
}

/**
 * Create Drag and Drop Context
 */
const DragDropContext = createContext<DragDropContextType | undefined>(
  undefined
);

/**
 * Drag and Drop Provider Component
 */
export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  onTicketMove,
}) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTicket: null,
    dragOverColumn: null,
    dragOverTicket: null,
    dragPosition: null,
  });

  const dragStartTime = useRef<number>(0);
  // const dragThreshold = 5; // Minimum pixels to start drag

  /**
   * Start drag operation
   */
  const startDrag = useCallback((ticket: TicketType) => {
    dragStartTime.current = Date.now();
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      draggedTicket: ticket,
    }));
  }, []);

  /**
   * End drag operation
   */
  const endDrag = useCallback(() => {
    const dragDuration = Date.now() - dragStartTime.current;

    setDragState(prev => {
      const { draggedTicket, dragOverColumn, dragOverTicket, dragPosition } =
        prev;

      // Only trigger move if drag was significant enough
      if (draggedTicket && dragOverColumn && dragDuration > 100) {
        const newStatus = dragOverColumn as TicketStatus;

        if (onTicketMove) {
          onTicketMove(
            draggedTicket.id,
            newStatus,
            dragOverTicket || undefined,
            dragPosition || undefined
          );
        }
      }

      return {
        isDragging: false,
        draggedTicket: null,
        dragOverColumn: null,
        dragOverTicket: null,
        dragPosition: null,
      };
    });
  }, [onTicketMove]);

  /**
   * Set drag over column
   */
  const setDragOverColumn = useCallback((columnId: string | null) => {
    setDragState(prev => ({
      ...prev,
      dragOverColumn: columnId,
      dragOverTicket: null, // Clear ticket when hovering over column
      dragPosition: null,
    }));
  }, []);

  /**
   * Set drag over ticket
   */
  const setDragOverTicket = useCallback(
    (ticketId: string | null, position?: 'above' | 'below') => {
      setDragState(prev => ({
        ...prev,
        dragOverTicket: ticketId,
        dragPosition: position || null,
      }));
    },
    []
  );

  /**
   * Clear drag over state
   */
  const clearDragOver = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      dragOverColumn: null,
      dragOverTicket: null,
      dragPosition: null,
    }));
  }, []);

  /**
   * Check if dragging over column
   */
  const isDragOverColumn = useCallback(
    (columnId: string) => {
      return dragState.dragOverColumn === columnId;
    },
    [dragState.dragOverColumn]
  );

  /**
   * Check if dragging over ticket
   */
  const isDragOverTicket = useCallback(
    (ticketId: string) => {
      return dragState.dragOverTicket === ticketId;
    },
    [dragState.dragOverTicket]
  );

  /**
   * Get drag position relative to ticket
   */
  const getDragPosition = useCallback(
    (ticketId: string) => {
      if (dragState.dragOverTicket === ticketId) {
        return dragState.dragPosition;
      }
      return null;
    },
    [dragState.dragOverTicket, dragState.dragPosition]
  );

  const contextValue: DragDropContextType = {
    dragState,
    startDrag,
    endDrag,
    setDragOverColumn,
    setDragOverTicket,
    clearDragOver,
    isDragOverColumn,
    isDragOverTicket,
    getDragPosition,
  };

  return (
    <DragDropContext.Provider value={contextValue}>
      {children}
    </DragDropContext.Provider>
  );
};

/**
 * Hook to use drag and drop context
 */
export const useDragDrop = (): DragDropContextType => {
  const context = useContext(DragDropContext);
  if (context === undefined) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

/**
 * Drag and Drop Utilities
 */
export const dragDropUtils = {
  /**
   * Calculate drop position based on mouse position
   */
  calculateDropPosition: (
    event: React.DragEvent,
    element: HTMLElement
  ): 'above' | 'below' => {
    const rect = element.getBoundingClientRect();
    const middle = rect.top + rect.height / 2;
    return event.clientY < middle ? 'above' : 'below';
  },

  /**
   * Check if element is valid drop target
   */
  isValidDropTarget: (element: HTMLElement): boolean => {
    return element.hasAttribute('data-drop-target');
  },

  /**
   * Get drop target from event
   */
  getDropTarget: (event: React.DragEvent): HTMLElement | null => {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    if (element && dragDropUtils.isValidDropTarget(element as HTMLElement)) {
      return element as HTMLElement;
    }
    return null;
  },

  /**
   * Create drag preview
   */
  createDragPreview: (element: HTMLElement): HTMLElement => {
    const preview = element.cloneNode(true) as HTMLElement;
    preview.style.opacity = '0.8';
    preview.style.transform = 'rotate(5deg)';
    preview.style.pointerEvents = 'none';
    preview.style.position = 'absolute';
    preview.style.top = '-1000px';
    preview.style.zIndex = '1000';
    document.body.appendChild(preview);
    return preview;
  },

  /**
   * Remove drag preview
   */
  removeDragPreview: (preview: HTMLElement): void => {
    if (preview && preview.parentNode) {
      preview.parentNode.removeChild(preview);
    }
  },
};

export default DragDropProvider;
