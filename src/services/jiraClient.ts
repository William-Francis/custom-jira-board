/**
 * Jira Client - Direct integration with Jira REST API
 * Makes authenticated requests to Jira for boards, tickets, and issues
 */

import { envConfig, getJiraApiHeaders, getJiraApiUrl } from '../config';

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  status: {
    id: string;
    name: string;
  };
  assignee?: {
    accountId: string;
    displayName: string;
    emailAddress: string;
    avatarUrls?: {
      '48x48': string;
    };
  };
  priority: {
    id: string;
    name: string;
  };
  issuetype: {
    id: string;
    name: string;
    iconUrl: string;
  };
  created: string;
  updated: string;
  labels: string[];
  parent?: {
    id: string;
    key: string;
    fields: {
      summary: string;
    };
  };
}

export interface JiraBoard {
  id: number;
  name: string;
  type: string;
  location: {
    projectId: number;
    projectKey: string;
    projectName: string;
    displayName: string;
    projectTypeKey: string;
  };
  filter?: {
    id: string;
  };
  canEdit: boolean;
  supportOAuth: boolean;
  subQuery: string;
}

export interface JiraSprint {
  id: number;
  name: string;
  state: string;
  boardId: number;
  goal?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Jira REST API Client
 */
class JiraClient {
  private headers: Record<string, string>;
  private baseUrl: string;

  constructor() {
    this.headers = getJiraApiHeaders();
    this.baseUrl = envConfig.jiraBaseUrl;
  }

  /**
   * Make an authenticated request to Jira API via proxy
   */
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      // Use the proxy server to bypass CORS
      // Ensure endpoint starts with /
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = `http://localhost:3001/api/jira${normalizedEndpoint}`;
      
      console.log(`🔗 Making proxy request to: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options?.headers || {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Proxy API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Jira API request failed:', error);
      throw error;
    }
  }

  /**
   * Get boards for the configured project
   */
  async getBoards(): Promise<JiraBoard[]> {
    try {
      const response: { values: JiraBoard[] } = await this.makeRequest('/board');
      
      // Filter by project if configured
      if (envConfig.jiraProjectKey && envConfig.jiraProjectKey !== 'YOUR_PROJECT_KEY') {
        return response.values.filter(board => 
          board.location?.projectKey === envConfig.jiraProjectKey
        );
      }
      
      return response.values;
    } catch (error) {
      console.error('Failed to fetch Jira boards:', error);
      throw error;
    }
  }

  /**
   * Get a specific board by ID
   */
  async getBoard(boardId: string): Promise<JiraBoard> {
    return this.makeRequest(`/board/${boardId}`);
  }

  /**
   * Get issues from a board
   * Optionally filter by sprint
   */
  async getBoardIssues(boardId: string, params?: Record<string, string | number>, sprintId?: number): Promise<JiraIssue[]> {
    try {
      // Build JQL query - limit to active sprint if specified
      let jql = '';
      if (sprintId) {
        jql = `sprint=${sprintId} AND sprint in (openSprints())`;
      } else {
        // Get active sprint automatically
        try {
          const activeSprint = await this.getActiveSprint(boardId);
          if (activeSprint) {
            jql = `sprint=${activeSprint.id} AND sprint in (openSprints())`;
            console.log(`🔍 Filtering issues to active sprint: ${activeSprint.id}`);
          }
        } catch (error) {
          console.warn('Could not determine active sprint, showing all board issues');
        }
      }
      
      const paramsString = params 
        ? '&' + Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
        : '';
      
      const jqlParam = jql ? `jql=${encodeURIComponent(jql)}` : 'jql=';
      const fieldsParam = 'fields=summary,description,status,assignee,priority,issuetype,created,updated,labels,parent,sprint,epicLink&expand=fields.parent.fields.issuetype,fields.parent.fields.summary';
      const maxResults = params?.maxResults || 50;
      
      const response: { issues: JiraIssue[] } = await this.makeRequest(
        `/board/${boardId}/issue?${jqlParam}&${fieldsParam}&maxResults=${maxResults}${paramsString}`
      );
      
      // Get the active sprint ID to filter results
      let activeSprintId: number | undefined;
      try {
        const activeSprint = await this.getActiveSprint(boardId);
        activeSprintId = activeSprint?.id;
        console.log(`🔍 Active sprint ID: ${activeSprintId}`);
      } catch (error) {
        console.warn('Could not determine active sprint');
      }
      
      // Filter issues by active sprint if we have an active sprint
      let issues = response.issues || [];
      if (activeSprintId) {
        issues = issues.filter(issue => {
          const sprintField = issue.fields?.sprint;
          if (Array.isArray(sprintField)) {
            // Multiple sprints - check if any matches active sprint
            return sprintField.some(s => s?.id === activeSprintId);
          } else if (sprintField?.id) {
            // Single sprint
            return sprintField.id === activeSprintId;
          }
          return false;
        });
        console.log(`✅ Filtered to ${issues.length} issues in active sprint ${activeSprintId}`);
      } else {
        console.log(`✅ Fetched ${issues.length} issues from board ${boardId} (no sprint filter)`);
      }
      
      return issues;
    } catch (error) {
      console.error('Failed to fetch board issues:', error);
      throw error;
    }
  }

  /**
   * Get board configuration including columns
   */
  async getBoardConfiguration(boardId: string): Promise<any> {
    try {
      const config = await this.makeRequest(`/board/${boardId}/configuration`);
      return config;
    } catch (error) {
      console.error('Failed to fetch board configuration:', error);
      throw error;
    }
  }

  /**
   * Get active sprint for a board
   */
  async getActiveSprint(boardId: string): Promise<JiraSprint | null> {
    try {
      const sprints: { values: JiraSprint[] } = await this.makeRequest(`/board/${boardId}/sprint`);
      return sprints.values.find(sprint => sprint.state === 'active') || null;
    } catch (error) {
      console.error('Failed to fetch active sprint:', error);
      return null;
    }
  }

  /**
   * Get all sprints for a board
   */
  async getSprints(boardId: string): Promise<JiraSprint[]> {
    try {
      const sprints: { values: JiraSprint[] } = await this.makeRequest(`/board/${boardId}/sprint`);
      return sprints.values || [];
    } catch (error) {
      console.error('Failed to fetch sprints:', error);
      throw error;
    }
  }

  /**
   * Get a specific issue by key or ID
   */
  async getIssue(issueKey: string): Promise<JiraIssue> {
    try {
      const issue: JiraIssue = await this.makeRequest(
        `/issue/${issueKey}?fields=summary,description,status,assignee,priority,issuetype,created,updated,labels,parent`
      );
      return issue;
    } catch (error) {
      console.error('Failed to fetch issue:', error);
      throw error;
    }
  }

  /**
   * Get available transitions for an issue
   */
  async getTransitions(issueKey: string): Promise<any[]> {
    try {
      const response: { transitions: any[] } = await this.makeRequest(
        `/issue/${issueKey}/transitions`
      );
      return response.transitions || [];
    } catch (error) {
      console.error('Failed to fetch transitions:', error);
      throw error;
    }
  }

  /**
   * Transition an issue to a new status
   */
  async transitionIssue(issueKey: string, transitionId: string): Promise<void> {
    try {
      await this.makeRequest(
        `/issue/${issueKey}/transitions`,
        {
          method: 'POST',
          body: JSON.stringify({
            transition: {
              id: transitionId
            }
          })
        }
      );
    } catch (error) {
      console.error('Failed to transition issue:', error);
      throw error;
    }
  }

  /**
   * Update issue status (uses transitions API)
   */
  async updateIssueStatus(issueKey: string, newStatusName: string): Promise<void> {
    try {
      // Get available transitions
      const transitions = await this.getTransitions(issueKey);
      
      // Find transition that matches the target status
      const transition = transitions.find(t => 
        t.to.name.toLowerCase() === newStatusName.toLowerCase()
      );
      
      if (!transition) {
        // Try to find by status category
        const fallbackTransition = transitions.find(t => {
          const category = t.to.statusCategory?.key;
          const statusName = newStatusName.toUpperCase();
          
          // Map status to Jira status categories
          if (statusName === 'TODO' || statusName === 'BACKLOG') {
            return category === 'new' || category === 'to-do';
          } else if (statusName === 'IN_PROGRESS') {
            return category === 'indeterminate';
          } else if (statusName === 'DONE') {
            return category === 'done';
          }
          return false;
        });
        
        if (fallbackTransition) {
          await this.transitionIssue(issueKey, fallbackTransition.id);
          return;
        }
        
        throw new Error(`No transition found for status: ${newStatusName}`);
      }
      
      await this.transitionIssue(issueKey, transition.id);
    } catch (error) {
      console.error('Failed to update issue status:', error);
      throw error;
    }
  }

  /**
   * Search issues using JQL (Jira Query Language)
   */
  async searchIssues(jql: string): Promise<JiraIssue[]> {
    try {
      const response: { issues: JiraIssue[] } = await this.makeRequest(
        `/search?jql=${encodeURIComponent(jql)}&fields=summary,description,status,assignee,priority,issuetype,created,updated,labels,parent`
      );
      return response.issues || [];
    } catch (error) {
      console.error('Failed to search issues:', error);
      throw error;
    }
  }
}

/**
 * Create and export Jira client instance
 */
export const jiraClient = new JiraClient();

