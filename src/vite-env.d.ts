/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JIRA_BASE_URL: string
  readonly VITE_JIRA_USERNAME: string
  readonly VITE_JIRA_API_TOKEN: string
  readonly VITE_JIRA_PROJECT_KEY?: string
  readonly VITE_JIRA_BOARD_ID?: string
  readonly VITE_DEV_MODE: string
  readonly VITE_MOCK_API: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_API_RETRY_ATTEMPTS: string
  readonly VITE_ENABLE_BULK_OPERATIONS: string
  readonly VITE_ENABLE_REAL_TIME_UPDATES: string
  readonly VITE_ENABLE_KEYBOARD_SHORTCUTS: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_LOG_LEVEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
