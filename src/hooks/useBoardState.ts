/**
 * Custom hook for managing board state and configuration
 * Provides board-level state management and configuration handling
 */

import { useState, useEffect, useCallback } from 'react';
import { BoardConfig, Sprint, BoardFilters, LoadingState } from '../types';
import { boardService } from '../services';
import { createUserErrorMessage, isRetryableError } from '../utils';

/**
 * Hook return type
 */
export interface UseBoardStateReturn {
  boardConfig: BoardConfig | null;
  activeSprint: Sprint | null;
  filters: BoardFilters;
  loading: LoadingState;
  updateBoardConfig: (updates: Partial<BoardConfig>) => Promise<void>;
  updateFilters: (filters: BoardFilters) => void;
  refreshBoard: () => Promise<void>;
  createSprint: (sprint: Partial<Sprint>) => Promise<Sprint>;
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => Promise<void>;
}

/**
 * Hook configuration
 */
export interface UseBoardStateConfig {
  boardId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  retryOnError?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (message: string) => void;
}

/**
 * Custom hook for board state management
 */
export const useBoardState = (config: UseBoardStateConfig): UseBoardStateReturn => {
  const { boardId, autoRefresh = false, refreshInterval = 60000, retryOnError = true, onError, onSuccess } = config;
  
  const [boardConfig, setBoardConfig] = useState<BoardConfig | null>(null);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [filters, setFilters] = useState<BoardFilters>({});
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  /**
   * Fetch board configuration
   */
  const fetchBoardConfig = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading({ isLoading: true, error: null });
    }

    try {
      const config = await boardService.getBoard(boardId);
      setBoardConfig(config);
      setLoading({ isLoading: false, error: null });
      onSuccess?.('Board configuration loaded successfully');
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setLoading({ isLoading: false, error: errorMessage });
      onError?.(error as Error);
      
      // Retry on retryable errors
      if (retryOnError && isRetryableError(error as Error)) {
        setTimeout(() => fetchBoardConfig(false), 5000);
      }
    }
  }, [boardId, retryOnError]);

  /**
   * Fetch active sprint
   */
  const fetchActiveSprint = useCallback(async () => {
    try {
      const sprint = await boardService.getActiveSprint(boardId);
      setActiveSprint(sprint);
      onSuccess?.('Active sprint loaded successfully');
    } catch (error) {
      // Active sprint is optional, so we don't treat this as a critical error
      console.warn('Failed to fetch active sprint:', error);
      setActiveSprint(null);
    }
  }, [boardId]);

  /**
   * Update board configuration
   */
  const updateBoardConfig = useCallback(async (updates: Partial<BoardConfig>) => {
    if (!boardConfig) return;

    setLoading({ isLoading: true, error: null });

    try {
      const updatedConfig = await boardService.updateBoard(boardId, updates);
      setBoardConfig(updatedConfig);
      setLoading({ isLoading: false, error: null });
      onSuccess?.('Board configuration updated successfully');
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setLoading({ isLoading: false, error: errorMessage });
      onError?.(error as Error);
      throw error;
    }
  }, [boardId, boardConfig, onError, onSuccess]);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters: BoardFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  /**
   * Create a new sprint
   */
  const createSprint = useCallback(async (sprintData: Partial<Sprint>): Promise<Sprint> => {
    setLoading({ isLoading: true, error: null });

    try {
      const newSprint = await boardService.createSprint(sprintData);
      setLoading({ isLoading: false, error: null });
      onSuccess?.('Sprint created successfully');
      return newSprint;
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setLoading({ isLoading: false, error: errorMessage });
      onError?.(error as Error);
      throw error;
    }
  }, [onError, onSuccess]);

  /**
   * Update an existing sprint
   */
  const updateSprint = useCallback(async (sprintId: string, updates: Partial<Sprint>) => {
    setLoading({ isLoading: true, error: null });

    try {
      const updatedSprint = await boardService.updateSprint(sprintId, updates);
      
      // Update active sprint if it's the one being updated
      if (activeSprint?.id === sprintId) {
        setActiveSprint(updatedSprint);
      }
      
      setLoading({ isLoading: false, error: null });
      onSuccess?.('Sprint updated successfully');
    } catch (error) {
      const errorMessage = createUserErrorMessage(error as Error);
      setLoading({ isLoading: false, error: errorMessage });
      onError?.(error as Error);
      throw error;
    }
  }, [activeSprint, onError, onSuccess]);

  /**
   * Refresh board data
   */
  const refreshBoard = useCallback(async () => {
    await Promise.all([
      fetchBoardConfig(true),
      fetchActiveSprint(),
    ]);
  }, [fetchBoardConfig, fetchActiveSprint]);

  /**
   * Initial load and auto-refresh setup
   */
  useEffect(() => {
    refreshBoard();

    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchBoardConfig(false);
        fetchActiveSprint();
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refreshBoard, fetchBoardConfig, fetchActiveSprint, autoRefresh, refreshInterval]);

  return {
    boardConfig,
    activeSprint,
    filters,
    loading,
    updateBoardConfig,
    updateFilters,
    refreshBoard,
    createSprint,
    updateSprint,
  };
};
