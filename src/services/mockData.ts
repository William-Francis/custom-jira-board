/**
 * Mock data for development and testing
 * This file contains realistic Jira-like data for the board application
 */

import { Ticket, User, Sprint, BoardConfig, TicketStatus, TicketPriority } from '../types';

/**
 * Mock users for the application
 */
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    displayName: 'John Doe',
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    displayName: 'Jane Smith',
  },
  {
    id: 'user-3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    displayName: 'Mike Johnson',
  },
  {
    id: 'user-4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    displayName: 'Sarah Wilson',
  },
  {
    id: 'user-5',
    name: 'David Brown',
    email: 'david.brown@company.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    displayName: 'David Brown',
  },
];

/**
 * Mock sprint data
 */
export const mockSprint: Sprint = {
  id: 'sprint-1',
  name: 'Sprint 2024.1',
  state: 'ACTIVE',
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-01-29'),
  goal: 'Complete user authentication and dashboard features',
};

/**
 * Mock board configuration
 */
export const mockBoardConfig: BoardConfig = {
  id: 'board-1',
  name: 'Development Team Board',
  description: 'Main development board for the engineering team',
  columns: [
    {
      id: 'todo',
      name: 'To Do',
      status: 'TODO',
      order: 1,
      color: '#6b778c',
      wipLimit: 10,
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      status: 'IN_PROGRESS',
      order: 2,
      color: '#0052cc',
      wipLimit: 5,
    },
    {
      id: 'in-review',
      name: 'In Review',
      status: 'IN_REVIEW',
      order: 3,
      color: '#ffab00',
      wipLimit: 3,
    },
    {
      id: 'done',
      name: 'Done',
      status: 'DONE',
      order: 4,
      color: '#36b37e',
      wipLimit: undefined,
    },
  ],
  workflow: [
    {
      from: 'TODO',
      to: 'IN_PROGRESS',
      autoResolve: false,
    },
    {
      from: 'IN_PROGRESS',
      to: 'IN_REVIEW',
      autoResolve: false,
    },
    {
      from: 'IN_REVIEW',
      to: 'DONE',
      autoResolve: true,
    },
    {
      from: 'DONE',
      to: 'TODO',
      autoResolve: false,
    },
  ],
};

/**
 * Generate mock tickets with realistic data
 */
export const generateMockTickets = (): Ticket[] => {
  const ticketTemplates = [
    {
      titles: [
        'Implement user authentication system',
        'Add drag and drop functionality to board',
        'Create responsive design for mobile devices',
        'Fix critical bug in payment processing',
        'Optimize database queries for better performance',
        'Add dark mode support to the application',
        'Implement real-time notifications',
        'Create comprehensive test suite',
        'Update API documentation',
        'Refactor legacy code components',
        'Add accessibility features',
        'Implement caching mechanism',
        'Create user onboarding flow',
        'Add data export functionality',
        'Implement search and filtering',
      ],
      descriptions: [
        'This task involves implementing a secure authentication system with JWT tokens and proper session management.',
        'Users should be able to drag tickets between columns with smooth animations and proper validation.',
        'The application needs to work seamlessly across all device sizes with touch-friendly interactions.',
        'Critical issue affecting user payments that needs immediate attention and resolution.',
        'Database performance is crucial for user experience, especially with large datasets.',
        'Dark mode is becoming a standard feature that users expect in modern applications.',
        'Real-time updates will improve user experience and collaboration.',
        'Comprehensive testing ensures code quality and prevents regressions.',
        'Clear documentation helps developers understand and maintain the codebase.',
        'Refactoring improves code maintainability and reduces technical debt.',
        'Accessibility ensures the application is usable by everyone.',
        'Caching improves performance and reduces server load.',
        'Good onboarding helps users understand and adopt the application.',
        'Data export functionality is important for data portability and compliance.',
        'Search and filtering help users find relevant information quickly.',
      ],
      labels: [
        ['frontend', 'react'],
        ['frontend', 'ui'],
        ['frontend', 'responsive'],
        ['backend', 'bug', 'critical'],
        ['backend', 'performance'],
        ['frontend', 'ui', 'theme'],
        ['frontend', 'real-time'],
        ['testing', 'quality'],
        ['documentation'],
        ['refactoring', 'maintenance'],
        ['accessibility', 'a11y'],
        ['backend', 'performance'],
        ['frontend', 'ux'],
        ['backend', 'data'],
        ['frontend', 'search'],
      ],
    },
  ];

  const tickets: Ticket[] = [];
  const template = ticketTemplates[0];

  template.titles.forEach((title, index) => {
    const assignee = Math.random() > 0.3 ? mockUsers[Math.floor(Math.random() * mockUsers.length)] : undefined;
    const reporter = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const statuses: TicketStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    const priorities: TicketPriority[] = ['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const storyPoints = Math.random() > 0.5 ? Math.floor(Math.random() * 8) + 1 : undefined;

    const created = new Date();
    created.setDate(created.getDate() - Math.floor(Math.random() * 30));
    
    const updated = new Date(created);
    updated.setDate(updated.getDate() + Math.floor(Math.random() * 7));

    const ticket: Ticket = {
      id: `ticket-${index + 1}`,
      key: `PROJ-${String(index + 1).padStart(3, '0')}`,
      title,
      description: template.descriptions[index],
      status,
      priority,
      assignee,
      reporter,
      created,
      updated,
      resolution: status === 'DONE' ? 'DONE' : undefined,
      labels: template.labels[index],
      storyPoints,
      sprint: mockSprint,
    };

    tickets.push(ticket);
  });

  return tickets;
};

/**
 * Mock tickets data
 */
export const mockTickets: Ticket[] = generateMockTickets();

/**
 * Simulate API delay for realistic testing
 */
export const simulateApiDelay = (min: number = 300, max: number = 1000): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * Simulate API errors for testing error handling
 */
export const simulateApiError = (errorRate: number = 0.1): boolean => {
  return Math.random() < errorRate;
};

/**
 * Mock API responses
 */
export const mockApiResponses = {
  success: <T>(data: T) => ({
    data,
    success: true,
    message: 'Operation completed successfully',
    timestamp: new Date().toISOString(),
  }),
  error: (message: string, code: string = 'GENERIC_ERROR') => ({
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
    errors: [message],
  }),
};
