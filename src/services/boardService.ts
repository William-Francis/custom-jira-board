/**
 * Board service for managing board-related operations
 * Provides both mock and API implementations
 */

import { BoardConfig, Sprint } from '../types';
import { mockBoardConfig, mockSprint, simulateApiDelay } from './mockData';
import { shouldUseMockApi } from '../config';
import { jiraClient } from './jiraClient';

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
 * API board service implementation (Jira integration)
 */
class ApiBoardService implements BoardService {
  constructor() {
    // Using Jira client
  }

  async getBoards(): Promise<BoardConfig[]> {
    try {
      const jiraBoards = await jiraClient.getBoards();
      
      // Transform Jira boards to BoardConfig format
      return jiraBoards.map(board => ({
        id: board.id.toString(),
        name: board.name,
        description: board.location?.displayName || '',
        columns: [
          { id: 'TODO', name: 'To Do', status: 'TODO', color: '#4CAF50' },
          { id: 'IN_PROGRESS', name: 'In Progress', status: 'IN_PROGRESS', color: '#2196F3' },
          { id: 'DONE', name: 'Done', status: 'DONE', color: '#9E9E9E' },
        ],
        workflow: [
          { from: 'TODO', to: 'IN_PROGRESS' },
          { from: 'IN_PROGRESS', to: 'DONE' },
          { from: 'IN_PROGRESS', to: 'TODO' },
        ],
      }));
    } catch (error) {
      console.error('Failed to fetch boards from Jira:', error);
      throw error;
    }
  }

  async getBoard(boardId: string): Promise<BoardConfig> {
    try {
      const jiraBoard = await jiraClient.getBoard(boardId);
      const boardConfig = await jiraClient.getBoardConfiguration(boardId);
      
      // Extract columns from configuration
      const jiraColumns = boardConfig.columnConfig?.columns || [];
      
      // Map Jira column names to status IDs
      const columnMap: Record<string, string> = {
        'To Do': 'TODO',
        'Blocked': 'BLOCKED',
        'In Progress': 'IN_PROGRESS',
        'Code Review': 'REVIEW',
        'Done': 'DONE',
        'Testing': 'TESTING',
      };
      
      // Define colors for each status
      const colorMap: Record<string, string> = {
        'TODO': '#4CAF50',
        'BLOCKED': '#F44336',
        'IN_PROGRESS': '#2196F3',
        'REVIEW': '#FF9800',
        'DONE': '#9E9E9E',
        'TESTING': '#9C27B0',
      };
      
      const columns = jiraColumns.map((col: any, index: number) => {
        const columnName = col.name;
        const statusId = columnMap[columnName] || columnName.toUpperCase().replace(/\s+/g, '_');
        return {
          id: statusId,
          name: columnName,
          status: statusId as any,
          color: colorMap[statusId] || '#9E9E9E',
        };
      });
      
      // Build workflow (allow transitions between adjacent columns)
      const workflow: { from: string; to: string }[] = [];
      for (let i = 0; i < columns.length - 1; i++) {
        workflow.push({ from: columns[i].status, to: columns[i + 1].status });
        // Allow going back
        workflow.push({ from: columns[i + 1].status, to: columns[i].status });
      }
      
      return {
        id: jiraBoard.id.toString(),
        name: jiraBoard.name,
        description: jiraBoard.location?.displayName || '',
        columns,
        workflow,
      };
    } catch (error) {
      console.error('Failed to fetch board from Jira:', error);
      throw error;
    }
  }

  async getSprints(boardId: string): Promise<Sprint[]> {
    try {
      return await jiraClient.getSprints(boardId);
    } catch (error) {
      console.error('Failed to fetch sprints from Jira:', error);
      throw error;
    }
  }

  async getActiveSprint(boardId: string): Promise<Sprint> {
    try {
      const activeSprint = await jiraClient.getActiveSprint(boardId);
      if (!activeSprint) {
        throw new Error('No active sprint found');
      }
      return activeSprint;
    } catch (error) {
      console.error('Failed to fetch active sprint from Jira:', error);
      throw error;
    }
  }

  async createBoard(board: Partial<BoardConfig>): Promise<BoardConfig> {
    // Not implemented in Jira API - would need to create via UI or admin API
    throw new Error('Creating boards via API is not supported. Use Jira UI instead.');
  }

  async updateBoard(boardId: string, updates: Partial<BoardConfig>): Promise<BoardConfig> {
    // Not implemented in Jira API for most operations
    throw new Error('Updating boards via API is not supported. Use Jira UI instead.');
  }

  async deleteBoard(boardId: string): Promise<void> {
    // Not implemented in Jira API
    throw new Error('Deleting boards via API is not supported. Use Jira UI instead.');
  }

  async createSprint(sprint: Partial<Sprint>): Promise<Sprint> {
    // Not implemented - would need specific Jira API call
    throw new Error('Creating sprints via API is not supported. Use Jira UI instead.');
  }

  async updateSprint(sprintId: string, updates: Partial<Sprint>): Promise<Sprint> {
    // Not implemented
    throw new Error('Updating sprints via API is not supported. Use Jira UI instead.');
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