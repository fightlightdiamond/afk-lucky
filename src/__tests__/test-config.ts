/**
 * Test configuration for different testing environments
 */

export interface TestConfig {
  apiBaseUrl: string;
  testTimeout: number;
  retries: number;
  headless: boolean;
  slowMo: number;
  viewport: {
    width: number;
    height: number;
  };
  testData: {
    adminUser: {
      email: string;
      password: string;
    };
    testUsers: Array<{
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: string;
    }>;
  };
}

export const testConfigs: Record<string, TestConfig> = {
  development: {
    apiBaseUrl: "http://localhost:3000",
    testTimeout: 30000,
    retries: 1,
    headless: false,
    slowMo: 100,
    viewport: {
      width: 1280,
      height: 720,
    },
    testData: {
      adminUser: {
        email: "admin@test.com",
        password: "admin123",
      },
      testUsers: [
        {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@test.com",
          password: "password123",
          role: "USER",
        },
        {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@test.com",
          password: "password123",
          role: "USER",
        },
        {
          firstName: "Bob",
          lastName: "Johnson",
          email: "bob.johnson@test.com",
          password: "password123",
          role: "ADMIN",
        },
      ],
    },
  },

  ci: {
    apiBaseUrl: "http://localhost:3000",
    testTimeout: 60000,
    retries: 3,
    headless: true,
    slowMo: 0,
    viewport: {
      width: 1280,
      height: 720,
    },
    testData: {
      adminUser: {
        email: "admin@test.com",
        password: "admin123",
      },
      testUsers: [
        {
          firstName: "CI",
          lastName: "User1",
          email: "ci.user1@test.com",
          password: "password123",
          role: "USER",
        },
        {
          firstName: "CI",
          lastName: "User2",
          email: "ci.user2@test.com",
          password: "password123",
          role: "USER",
        },
      ],
    },
  },

  staging: {
    apiBaseUrl: "https://staging.example.com",
    testTimeout: 45000,
    retries: 2,
    headless: true,
    slowMo: 50,
    viewport: {
      width: 1280,
      height: 720,
    },
    testData: {
      adminUser: {
        email: "staging.admin@test.com",
        password: "stagingPassword123",
      },
      testUsers: [
        {
          firstName: "Staging",
          lastName: "User1",
          email: "staging.user1@test.com",
          password: "password123",
          role: "USER",
        },
      ],
    },
  },
};

export function getTestConfig(): TestConfig {
  const environment = process.env.TEST_ENV || "development";
  const config = testConfigs[environment];

  if (!config) {
    throw new Error(`Unknown test environment: ${environment}`);
  }

  return config;
}

export const accessibilityRules = {
  // WCAG 2.1 AA compliance rules
  wcag21aa: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],

  // Additional accessibility rules
  bestPractices: ["best-practice"],

  // Rules to disable for specific scenarios
  disabledRules: [
    // Disable color-contrast rule for screenshots (can be flaky)
    // 'color-contrast',
  ],
};

export const testSelectors = {
  // Page elements
  userManagementPage: '[data-testid="user-management-page"]',
  userTable: '[data-testid="user-table"]',
  userFilters: '[data-testid="user-filters"]',

  // Buttons
  createUserButton: '[data-testid="create-user-button"]',
  editUserButton: '[data-testid="edit-user-button"]',
  deleteUserButton: '[data-testid="delete-user-button"]',
  toggleStatusButton: '[data-testid="toggle-status-button"]',

  // Dialogs
  userDialog: '[data-testid="user-dialog"]',
  confirmDialog: '[data-testid="confirm-dialog"]',
  bulkConfirmDialog: '[data-testid="bulk-confirm-dialog"]',
  bulkProgressDialog: '[data-testid="bulk-progress-dialog"]',
  bulkResultDialog: '[data-testid="bulk-result-dialog"]',

  // Form inputs
  firstNameInput: '[data-testid="first-name-input"]',
  lastNameInput: '[data-testid="last-name-input"]',
  emailInput: '[data-testid="email-input"]',
  passwordInput: '[data-testid="password-input"]',
  roleSelect: '[data-testid="role-select"]',
  searchInput: '[data-testid="search-input"]',

  // Bulk operations
  bulkActionBar: '[data-testid="bulk-action-bar"]',
  selectAllUsers: '[data-testid="select-all-users"]',
  bulkBanButton: '[data-testid="bulk-ban-button"]',
  bulkUnbanButton: '[data-testid="bulk-unban-button"]',
  bulkDeleteButton: '[data-testid="bulk-delete-button"]',
  bulkAssignRoleButton: '[data-testid="bulk-assign-role-button"]',

  // Filters
  roleFilter: '[data-testid="role-filter"]',
  statusFilter: '[data-testid="status-filter"]',
  dateRangeFilter: '[data-testid="date-range-filter"]',
  clearFiltersButton: '[data-testid="clear-filters-button"]',

  // Pagination
  pagination: '[data-testid="pagination"]',
  nextPageButton: '[data-testid="next-page-button"]',
  previousPageButton: '[data-testid="previous-page-button"]',
  pageSizeSelect: '[data-testid="page-size-select"]',
  currentPage: '[data-testid="current-page"]',

  // Export/Import
  exportButton: '[data-testid="export-button"]',
  importButton: '[data-testid="import-button"]',
  exportDialog: '[data-testid="export-dialog"]',
  importDialog: '[data-testid="import-dialog"]',

  // Notifications
  toast: '[data-testid="toast"]',
  errorMessage: '[data-testid="error-message"]',
  successMessage: '[data-testid="success-message"]',

  // Loading states
  loadingSpinner: '[data-testid="loading-spinner"]',
  progressBar: '[data-testid="progress-bar"]',

  // Dynamic selectors (use with template literals)
  selectUser: (email: string) => `[data-testid="select-user-${email}"]`,
  userRow: (email: string) => `[data-testid="user-row-${email}"]`,
  userStatus: (email: string) => `[data-testid="user-status-${email}"]`,
  userRole: (email: string) => `[data-testid="user-role-${email}"]`,
  editUserButton: (email: string) => `[data-testid="edit-user-${email}"]`,
  deleteUserButton: (email: string) => `[data-testid="delete-user-${email}"]`,
};

export const testTimeouts = {
  short: 5000,
  medium: 15000,
  long: 30000,
  veryLong: 60000,
};

export const testViewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  largeDesktop: { width: 1920, height: 1080 },
};

export const mockApiResponses = {
  users: {
    success: {
      users: [
        {
          id: "1",
          email: "john.doe@test.com",
          first_name: "John",
          last_name: "Doe",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          role: { id: "1", name: "USER" },
        },
        {
          id: "2",
          email: "jane.smith@test.com",
          first_name: "Jane",
          last_name: "Smith",
          is_active: true,
          created_at: "2024-01-02T00:00:00Z",
          role: { id: "2", name: "ADMIN" },
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 2,
      },
    },
    empty: {
      users: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
      },
    },
  },

  roles: [
    { id: "1", name: "USER", permissions: ["read"] },
    { id: "2", name: "ADMIN", permissions: ["read", "write", "delete"] },
  ],

  bulkOperation: {
    success: {
      success: 2,
      failed: 0,
      errors: [],
    },
    partialFailure: {
      success: 1,
      failed: 1,
      errors: ["Cannot delete your own account"],
    },
    failure: {
      success: 0,
      failed: 2,
      errors: ["Network error", "Permission denied"],
    },
  },
};
