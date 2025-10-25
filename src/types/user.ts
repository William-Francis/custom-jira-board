/**
 * User-related type definitions
 */

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  displayName: string;
  role: UserRole;
  permissions: Permission[];
  preferences: UserPreferences;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User roles
 */
export type UserRole = 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'VIEWER';

/**
 * User permissions
 */
export type Permission = 
  | 'CREATE_TICKET'
  | 'EDIT_TICKET'
  | 'DELETE_TICKET'
  | 'MOVE_TICKET'
  | 'ASSIGN_TICKET'
  | 'VIEW_BOARD'
  | 'MANAGE_BOARD'
  | 'MANAGE_USERS';

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  boardView: BoardViewSettings;
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  ticketUpdates: boolean;
  mentions: boolean;
  deadlineReminders: boolean;
}

/**
 * Board view settings
 */
export interface BoardViewSettings {
  defaultColumns: string[];
  showStoryPoints: boolean;
  showLabels: boolean;
  compactView: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

/**
 * User session interface
 */
export interface UserSession {
  user: UserProfile;
  token: string;
  expiresAt: Date;
  permissions: Permission[];
}

/**
 * User authentication context
 */
export interface AuthContextType {
  user: UserProfile | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

/**
 * Login form data
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * User registration data
 */
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: UserRole;
}

/**
 * User update data
 */
export interface UserUpdateData {
  name?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  preferences?: Partial<UserPreferences>;
}
