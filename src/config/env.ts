/**
 * Environment configuration utility
 * Handles environment variables and provides type-safe access
 */

/**
 * Environment configuration interface
 */
export interface EnvConfig {
  // Jira API Configuration
  jiraBaseUrl: string;
  jiraUsername: string;
  jiraApiToken: string;
  jiraProjectKey?: string;
  jiraBoardId?: string;
  
  // Development Settings
  devMode: boolean;
  mockApi: boolean;
  
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;
  apiRetryAttempts: number;
  
  // Feature Flags
  enableBulkOperations: boolean;
  enableRealTimeUpdates: boolean;
  enableKeyboardShortcuts: boolean;
  
  // Debug Settings
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string = ''): string {
  return import.meta.env[key] || fallback;
}

/**
 * Get boolean environment variable
 */
function getBooleanEnvVar(key: string, fallback: boolean = false): boolean {
  const value = getEnvVar(key);
  if (value === '') return fallback;
  return value.toLowerCase() === 'true';
}

/**
 * Get number environment variable
 */
function getNumberEnvVar(key: string, fallback: number = 0): number {
  const value = getEnvVar(key);
  if (value === '') return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Environment configuration
 */
export const envConfig: EnvConfig = {
  // Jira API Configuration
  jiraBaseUrl: getEnvVar('VITE_JIRA_BASE_URL', 'https://your-domain.atlassian.net'),
  jiraUsername: getEnvVar('VITE_JIRA_USERNAME', 'your-email@example.com'),
  jiraApiToken: getEnvVar('VITE_JIRA_API_TOKEN', 'your-api-token-here'),
  jiraProjectKey: getEnvVar('VITE_JIRA_PROJECT_KEY') || undefined,
  jiraBoardId: getEnvVar('VITE_JIRA_BOARD_ID') || undefined,
  
  // Development Settings
  devMode: getBooleanEnvVar('VITE_DEV_MODE', true),
  mockApi: getBooleanEnvVar('VITE_MOCK_API', false),
  
  // API Configuration
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'https://your-api-server.com/api'),
  apiTimeout: getNumberEnvVar('VITE_API_TIMEOUT', 30000),
  apiRetryAttempts: getNumberEnvVar('VITE_API_RETRY_ATTEMPTS', 3),
  
  // Feature Flags
  enableBulkOperations: getBooleanEnvVar('VITE_ENABLE_BULK_OPERATIONS', true),
  enableRealTimeUpdates: getBooleanEnvVar('VITE_ENABLE_REAL_TIME_UPDATES', false),
  enableKeyboardShortcuts: getBooleanEnvVar('VITE_ENABLE_KEYBOARD_SHORTCUTS', true),
  
  // Debug Settings
  debugMode: getBooleanEnvVar('VITE_DEBUG_MODE', false),
  logLevel: (getEnvVar('VITE_LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error'),
};

/**
 * Validate required environment variables
 */
export function validateEnvConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required Jira configuration
  if (!envConfig.jiraBaseUrl || envConfig.jiraBaseUrl === 'https://your-domain.atlassian.net') {
    errors.push('VITE_JIRA_BASE_URL is required');
  }
  
  if (!envConfig.jiraUsername || envConfig.jiraUsername === 'your-email@example.com') {
    errors.push('VITE_JIRA_USERNAME is required');
  }
  
  if (!envConfig.jiraApiToken || envConfig.jiraApiToken === 'your-api-token-here') {
    errors.push('VITE_JIRA_API_TOKEN is required');
  }
  
  // Validate URL format
  try {
    new URL(envConfig.jiraBaseUrl);
  } catch {
    errors.push('VITE_JIRA_BASE_URL must be a valid URL');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (envConfig.jiraUsername && !emailRegex.test(envConfig.jiraUsername)) {
    errors.push('VITE_JIRA_USERNAME must be a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get Jira API headers
 */
export function getJiraApiHeaders(): Record<string, string> {
  return {
    'Authorization': `Basic ${btoa(`${envConfig.jiraUsername}:${envConfig.jiraApiToken}`)}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

/**
 * Get Jira API base URL
 */
export function getJiraApiUrl(endpoint: string = ''): string {
  const baseUrl = envConfig.jiraBaseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${baseUrl}/rest/api/3/${cleanEndpoint}`;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return envConfig.devMode || import.meta.env.DEV === true;
}

/**
 * Check if mock API should be used
 * Respect explicit VITE_MOCK_API setting regardless of dev mode
 */
export function shouldUseMockApi(): boolean {
  // Only use mock API if explicitly enabled
  // Don't force mock API just because we're in development mode
  const useMock = typeof envConfig.mockApi === 'boolean' ? envConfig.mockApi : isDevelopment();
  
  // Debug logging
  console.log('🔧 shouldUseMockApi check:', {
    envConfigMockApi: envConfig.mockApi,
    isDevelopment: isDevelopment(),
    willUseMock: useMock
  });
  
  return useMock;
}

/**
 * Log configuration (only in debug mode)
 */
export function logConfig(): void {
  if (envConfig.debugMode) {
    console.group('🔧 Environment Configuration');
    console.log('Jira Base URL:', envConfig.jiraBaseUrl);
    console.log('Jira Username:', envConfig.jiraUsername);
    console.log('Jira Project Key:', envConfig.jiraProjectKey || 'Not set');
    console.log('Jira Board ID:', envConfig.jiraBoardId || 'Not set');
    console.log('Dev Mode:', envConfig.devMode);
    console.log('Mock API:', envConfig.mockApi);
    console.log('Bulk Operations:', envConfig.enableBulkOperations);
    console.log('Real-time Updates:', envConfig.enableRealTimeUpdates);
    console.log('Keyboard Shortcuts:', envConfig.enableKeyboardShortcuts);
    console.log('Debug Mode:', envConfig.debugMode);
    console.log('Log Level:', envConfig.logLevel);
    console.groupEnd();
  }
}

/**
 * Initialize environment configuration
 */
export function initializeEnvConfig(): void {
  const validation = validateEnvConfig();
  
  if (!validation.isValid) {
    console.warn('⚠️ Environment configuration issues:', validation.errors);
    
    if (isDevelopment()) {
      console.log('💡 To fix these issues:');
      console.log('1. Copy env.example to .env.local');
      console.log('2. Fill in your actual Jira credentials');
      console.log('3. Restart the development server');
    }
  } else {
    console.log('✅ Environment configuration is valid');
  }
  
  logConfig();
}
