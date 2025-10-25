/**
 * Board service for managing board-related operations
 * Provides both mock and API implementations
 */

import { BoardConfig, Sprint } from '../types';
import { mockBoardConfig, mockSprint, simulateApiDelay } from './mockData';
import { shouldUseMockApi } from '../config';

/**
 * Board service interface
 */
export interface BoardService {
  getBoards: () => Promise<BoardConfig[]>;
  getBoard: (boardId: string) => Promise<BoardConfig>;
  createBoard: (board: Partial<BoardConfig>) => Promise<BoardConfig>;
  updateBoard: (boardId: string, updates: Partial<BoardConfig>) => Promise<BoardConfig>;
  deleteBoard: (boardId: string) => Promise<void>;
  getSprints: (boardId: string) => Promise<Sprint[]>;
  getActiveSprint: (boardId: string) => Promise<Sprint>;
  createSprint: (sprint: Partial<Sprint>) => Promise<Sprint>;
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => Promise<Sprint>;
}

/**
 * Mock board service implementation
 */
class MockBoardService implements BoardService {
  private boards: BoardConfig[] = [mockBoardConfig];
  private sprints: Sprint[] = [mockSprint];

  /**
   * Get all boards
   */
  async getBoards(): Promise<BoardConfig[]> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.05)) {
    //   throw new Error('Failed to fetch boards');
    // }

    return [...this.boards];
  }

  /**
   * Get a specific board by ID
   */
  async getBoard(boardId: string): Promise<BoardConfig> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.05)) {
    //   throw new Error('Failed to fetch board');
    // }

    const board = this.boards.find(b => b.id === boardId);
    if (!board) {
      throw new Error(`Board with ID ${boardId} not found`);
    }

    return board;
  }

  /**
   * Create a new board
   */
  async createBoard(boardData: Partial<BoardConfig>): Promise<BoardConfig> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.1)) {
    //   throw new Error('Failed to create board');
    // }

    const newBoard: BoardConfig = {
      id: `board-${Date.now()}`,
      name: boardData.name || 'New Board',
      description: boardData.description || '',
      columns: boardData.columns || [],
      workflow: boardData.workflow || [],
    };

    this.boards.push(newBoard);
    return newBoard;
  }

  /**
   * Update an existing board
   */
  async updateBoard(boardId: string, updates: Partial<BoardConfig>): Promise<BoardConfig> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.1)) {
    //   throw new Error('Failed to update board');
    // }

    const boardIndex = this.boards.findIndex(b => b.id === boardId);
    if (boardIndex === -1) {
      throw new Error(`Board with ID ${boardId} not found`);
    }

    const updatedBoard = {
      ...this.boards[boardIndex],
      ...updates,
    };

    this.boards[boardIndex] = updatedBoard;
    return updatedBoard;
  }

  /**
   * Delete a board
   */
  async deleteBoard(boardId: string): Promise<void> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.1)) {
    //   throw new Error('Failed to delete board');
    // }

    const boardIndex = this.boards.findIndex(b => b.id === boardId);
    if (boardIndex === -1) {
      throw new Error(`Board with ID ${boardId} not found`);
    }

    this.boards.splice(boardIndex, 1);
  }

  /**
   * Get all sprints for a board
   */
  async getSprints(_boardId: string): Promise<Sprint[]> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.05)) {
    //   throw new Error('Failed to fetch sprints');
    // }

    return [...this.sprints];
  }

  /**
   * Get the active sprint for a board
   */
  async getActiveSprint(_boardId: string): Promise<Sprint> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.05)) {
    //   throw new Error('Failed to fetch active sprint');
    // }

    const activeSprint = this.sprints.find(s => s.state === 'ACTIVE');
    if (!activeSprint) {
      throw new Error('No active sprint found');
    }

    return activeSprint;
  }

  /**
   * Create a new sprint
   */
  async createSprint(sprintData: Partial<Sprint>): Promise<Sprint> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.1)) {
    //   throw new Error('Failed to create sprint');
    // }

    const newSprint: Sprint = {
      id: `sprint-${Date.now()}`,
      name: sprintData.name || 'New Sprint',
      state: sprintData.state || 'FUTURE',
      startDate: sprintData.startDate || new Date(),
      endDate: sprintData.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      goal: sprintData.goal || '',
    };

    this.sprints.push(newSprint);
    return newSprint;
  }

  /**
   * Update an existing sprint
   */
  async updateSprint(sprintId: string, updates: Partial<Sprint>): Promise<Sprint> {
    await simulateApiDelay();
    
    // Disabled error simulation for stable development
    // if (simulateApiError(0.1)) {
    //   throw new Error('Failed to update sprint');
    // }

    const sprintIndex = this.sprints.findIndex(s => s.id === sprintId);
    if (sprintIndex === -1) {
      throw new Error(`Sprint with ID ${sprintId} not found`);
    }

    const updatedSprint = {
      ...this.sprints[sprintIndex],
      ...updates,
    };

    this.sprints[sprintIndex] = updatedSprint;
    return updatedSprint;
  }
}

/**
 * API board service implementation
 */
class ApiBoardService implements BoardService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api';
  }

  async getBoards(): Promise<BoardConfig[]> {
    const response = await fetch(`${this.baseUrl}/boards`);
    if (!response.ok) {
      throw new Error(`Failed to fetch boards: ${response.statusText}`);
    }
    return response.json();
  }

  async getBoard(boardId: string): Promise<BoardConfig> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch board: ${response.statusText}`);
    }
    return response.json();
  }

  async createBoard(board: Partial<BoardConfig>): Promise<BoardConfig> {
    const response = await fetch(`${this.baseUrl}/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(board),
    });
    if (!response.ok) {
      throw new Error(`Failed to create board: ${response.statusText}`);
    }
    return response.json();
  }

  async updateBoard(boardId: string, updates: Partial<BoardConfig>): Promise<BoardConfig> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update board: ${response.statusText}`);
    }
    return response.json();
  }

  async deleteBoard(boardId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete board: ${response.statusText}`);
    }
  }

  async getSprints(boardId: string): Promise<Sprint[]> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}/sprints`);
    if (!response.ok) {
      throw new Error(`Failed to fetch sprints: ${response.statusText}`);
    }
    return response.json();
  }

  async getActiveSprint(boardId: string): Promise<Sprint> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}/sprints/active`);
    if (!response.ok) {
      throw new Error(`Failed to fetch active sprint: ${response.statusText}`);
    }
    return response.json();
  }

  async createSprint(sprint: Partial<Sprint>): Promise<Sprint> {
    const response = await fetch(`${this.baseUrl}/sprints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sprint),
    });
    if (!response.ok) {
      throw new Error(`Failed to create sprint: ${response.statusText}`);
    }
    return response.json();
  }

  async updateSprint(sprintId: string, updates: Partial<Sprint>): Promise<Sprint> {
    const response = await fetch(`${this.baseUrl}/sprints/${sprintId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update sprint: ${response.statusText}`);
    }
    return response.json();
  }
}

/**
 * Create board service instance
 * Use mock service in development, API service in production
 */
export const boardService: BoardService = shouldUseMockApi()
  ? new MockBoardService()
  : new ApiBoardService();

/**
 * Export service classes for testing
 */
export { MockBoardService, ApiBoardService };