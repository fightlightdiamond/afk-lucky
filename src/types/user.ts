// Enhanced User Management Types

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  last_logout?: string;
  avatar?: string;
  // Additional fields from Prisma schema
  sex?: boolean;
  birthday?: string;
  address?: string;
  remember_token?: string;
  slack_webhook_url?: string;
  deleted_at?: string;
  coin?: string; // BigInt as string for JSON serialization
  locale?: string;
  group_id?: number;
  role_id?: string;
  role?: {
    id: string;
    name: UserRole;
    permissions: string[];
    description?: string;
  };
  // Computed fields
  full_name: string;
  status: "active" | "inactive" | "banned";
  activity_status: "online" | "offline" | "never";
  age?: number; // Computed from birthday
  display_name: string; // Computed display name
}

// User role enum matching Prisma schema
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  AUTHOR = "AUTHOR",
  EDITOR = "EDITOR",
  MODERATOR = "MODERATOR",
}

// Role interface
export interface Role {
  id: string;
  name: UserRole;
  description?: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

// Enhanced filter interfaces
export interface UserFilters {
  search: string;
  role: string | null;
  status: "active" | "inactive" | "all" | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  } | null;
  activityDateRange: {
    from: Date | null;
    to: Date | null;
  } | null;
  sortBy:
    | "full_name"
    | "email"
    | "created_at"
    | "last_login"
    | "role"
    | "status"
    | "activity_status";
  sortOrder: "asc" | "desc";
  // Additional filter options
  hasAvatar?: boolean | null;
  locale?: string | null;
  group_id?: number | null;
  activity_status?: "online" | "offline" | "never" | null;
}

// Filter presets for quick filtering
export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: Partial<UserFilters>;
}

// Common filter presets
export const DEFAULT_FILTER_PRESETS: FilterPreset[] = [
  {
    id: "recently_created",
    name: "Recently Created",
    description: "Users created in the last 7 days",
    filters: {
      dateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
      sortBy: "created_at",
      sortOrder: "desc",
    },
  },
  {
    id: "never_logged_in",
    name: "Never Logged In",
    description: "Users who have never logged in",
    filters: {
      activity_status: "never",
      sortBy: "created_at",
      sortOrder: "desc",
    },
  },
  {
    id: "inactive_users",
    name: "Inactive Users",
    description: "Users who are currently inactive/banned",
    filters: {
      status: "inactive",
      sortBy: "created_at",
      sortOrder: "desc",
    },
  },
  {
    id: "admin_users",
    name: "Admin Users",
    description: "Users with admin role",
    filters: {
      role: UserRole.ADMIN,
      sortBy: "full_name",
      sortOrder: "asc",
    },
  },
];

// Enhanced pagination interfaces
export interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

// Pagination configuration
export interface PaginationConfig {
  defaultPageSize: number;
  pageSizeOptions: number[];
  maxPageSize: number;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  showTotal: boolean;
}

export const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 100,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: true,
};

// Enhanced API request parameters
export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: "active" | "inactive" | "all";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  activityDateFrom?: string;
  activityDateTo?: string;
  hasAvatar?: boolean;
  locale?: string;
  group_id?: number;
  activity_status?: "online" | "offline" | "never";
  // Export parameters
  export?: boolean;
  exportFormat?: "csv" | "excel" | "json";
  exportFields?: string[];
}

// Enhanced API response interfaces
export interface UsersResponse {
  users: User[];
  pagination: PaginationParams;
  filters: UserFilters;
  metadata?: {
    totalActiveUsers: number;
    totalInactiveUsers: number;
    totalNeverLoggedIn: number;
    averageLastLogin: string;
    mostCommonRole: string;
    // Enhanced metadata for UI components
    availableRoles?: {
      id: string;
      name: string;
      description?: string;
      userCount: number;
    }[];
    availableLocales?: string[];
    availableGroupIds?: number[];
    queryPerformance?: {
      executionTime: number;
      totalQueries: number;
      cacheHit: boolean;
    };
  };
}

// Single user response
export interface UserResponse {
  user: User;
  metadata?: {
    permissions: string[];
    canEdit: boolean;
    canDelete: boolean;
    canToggleStatus: boolean;
  };
}

// Enhanced bulk operation interfaces
export interface BulkOperationRequest {
  operation:
    | "ban"
    | "unban"
    | "delete"
    | "assign_role"
    | "remove_role"
    | "export"
    | "send_notification";
  userIds: string[];
  roleId?: string; // For assign_role operation
  notificationMessage?: string; // For send_notification operation
  exportFormat?: "csv" | "excel" | "json"; // For export operation
  exportFields?: string[]; // For export operation
  reason?: string; // Optional reason for audit logging
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
  warnings?: string[];
  details?: {
    successfulIds: string[];
    failedIds: string[];
    skippedIds: string[];
  };
  exportUrl?: string; // For export operations
  estimatedTime?: number; // For long-running operations
  operationId?: string; // For tracking async operations
}

// Bulk operation progress tracking
export interface BulkOperationProgress {
  operationId: string;
  operation: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  progress: number; // 0-100
  processed: number;
  total: number;
  startedAt: string;
  estimatedCompletion?: string;
  result?: BulkOperationResult;
}

// Enhanced CRUD request interfaces
export interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role_id?: string;
  is_active?: boolean;
  // Additional optional fields
  sex?: boolean;
  birthday?: string;
  address?: string;
  avatar?: string;
  locale?: string;
  group_id?: number;
  slack_webhook_url?: string;
  coin?: string; // BigInt as string
}

export interface UpdateUserRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  role_id?: string;
  is_active?: boolean;
  // Additional optional fields
  sex?: boolean;
  birthday?: string;
  address?: string;
  avatar?: string;
  locale?: string;
  group_id?: number;
  slack_webhook_url?: string;
  coin?: string; // BigInt as string
}

// User validation interfaces
export interface UserValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
    code: string;
  }[];
  warnings?: {
    field: string;
    message: string;
  }[];
}

// User creation/update response
export interface UserMutationResponse {
  user: User;
  validation?: UserValidationResult;
  metadata?: {
    wasEmailChanged: boolean;
    wasRoleChanged: boolean;
    wasStatusChanged: boolean;
    previousValues?: Partial<User>;
  };
}

// Enhanced error handling types
export interface ApiErrorResponse {
  error: string;
  code: string;
  details?: unknown;
  timestamp: string;
  requestId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
}

export enum UserManagementErrorCodes {
  // User-related errors
  USER_NOT_FOUND = "USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  INVALID_USER_ID = "INVALID_USER_ID",
  USER_ALREADY_ACTIVE = "USER_ALREADY_ACTIVE",
  USER_ALREADY_INACTIVE = "USER_ALREADY_INACTIVE",

  // Permission errors
  CANNOT_DELETE_SELF = "CANNOT_DELETE_SELF",
  CANNOT_BAN_SELF = "CANNOT_BAN_SELF",
  CANNOT_MODIFY_SELF = "CANNOT_MODIFY_SELF",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  PERMISSION_DENIED = "PERMISSION_DENIED",

  // Role-related errors
  INVALID_ROLE = "INVALID_ROLE",
  ROLE_NOT_FOUND = "ROLE_NOT_FOUND",
  CANNOT_ASSIGN_HIGHER_ROLE = "CANNOT_ASSIGN_HIGHER_ROLE",

  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_EMAIL_FORMAT = "INVALID_EMAIL_FORMAT",
  WEAK_PASSWORD = "WEAK_PASSWORD",
  INVALID_DATE_FORMAT = "INVALID_DATE_FORMAT",
  INVALID_PAGINATION_PARAMS = "INVALID_PAGINATION_PARAMS",

  // Bulk operation errors
  BULK_OPERATION_FAILED = "BULK_OPERATION_FAILED",
  BULK_OPERATION_PARTIAL_FAILURE = "BULK_OPERATION_PARTIAL_FAILURE",
  BULK_OPERATION_TIMEOUT = "BULK_OPERATION_TIMEOUT",
  TOO_MANY_USERS_SELECTED = "TOO_MANY_USERS_SELECTED",

  // System errors
  DATABASE_ERROR = "DATABASE_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // Import/Export errors
  IMPORT_FILE_INVALID = "IMPORT_FILE_INVALID",
  IMPORT_DATA_INVALID = "IMPORT_DATA_INVALID",
  EXPORT_FAILED = "EXPORT_FAILED",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  UNSUPPORTED_FILE_FORMAT = "UNSUPPORTED_FILE_FORMAT",
}

export const errorMessages: Record<UserManagementErrorCodes, string> = {
  // User-related errors
  [UserManagementErrorCodes.USER_NOT_FOUND]: "User not found",
  [UserManagementErrorCodes.EMAIL_ALREADY_EXISTS]:
    "Email address is already in use",
  [UserManagementErrorCodes.INVALID_USER_ID]: "Invalid user ID provided",
  [UserManagementErrorCodes.USER_ALREADY_ACTIVE]: "User is already active",
  [UserManagementErrorCodes.USER_ALREADY_INACTIVE]: "User is already inactive",

  // Permission errors
  [UserManagementErrorCodes.CANNOT_DELETE_SELF]:
    "You cannot delete your own account",
  [UserManagementErrorCodes.CANNOT_BAN_SELF]: "You cannot ban your own account",
  [UserManagementErrorCodes.CANNOT_MODIFY_SELF]:
    "You cannot modify your own account in this way",
  [UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS]:
    "You do not have permission to perform this action",
  [UserManagementErrorCodes.PERMISSION_DENIED]: "Access denied",

  // Role-related errors
  [UserManagementErrorCodes.INVALID_ROLE]: "Selected role is invalid",
  [UserManagementErrorCodes.ROLE_NOT_FOUND]: "Role not found",
  [UserManagementErrorCodes.CANNOT_ASSIGN_HIGHER_ROLE]:
    "You cannot assign a role higher than your own",

  // Validation errors
  [UserManagementErrorCodes.VALIDATION_ERROR]: "Validation error occurred",
  [UserManagementErrorCodes.INVALID_EMAIL_FORMAT]: "Invalid email format",
  [UserManagementErrorCodes.WEAK_PASSWORD]:
    "Password does not meet security requirements",
  [UserManagementErrorCodes.INVALID_DATE_FORMAT]: "Invalid date format",
  [UserManagementErrorCodes.INVALID_PAGINATION_PARAMS]:
    "Invalid pagination parameters",

  // Bulk operation errors
  [UserManagementErrorCodes.BULK_OPERATION_FAILED]: "Bulk operation failed",
  [UserManagementErrorCodes.BULK_OPERATION_PARTIAL_FAILURE]:
    "Some operations failed. Please check the details",
  [UserManagementErrorCodes.BULK_OPERATION_TIMEOUT]: "Bulk operation timed out",
  [UserManagementErrorCodes.TOO_MANY_USERS_SELECTED]:
    "Too many users selected for bulk operation",

  // System errors
  [UserManagementErrorCodes.DATABASE_ERROR]: "Database error occurred",
  [UserManagementErrorCodes.INTERNAL_SERVER_ERROR]: "Internal server error",
  [UserManagementErrorCodes.RATE_LIMIT_EXCEEDED]:
    "Rate limit exceeded. Please try again later",
  [UserManagementErrorCodes.SERVICE_UNAVAILABLE]:
    "Service temporarily unavailable",

  // Import/Export errors
  [UserManagementErrorCodes.IMPORT_FILE_INVALID]: "Invalid import file",
  [UserManagementErrorCodes.IMPORT_DATA_INVALID]: "Invalid data in import file",
  [UserManagementErrorCodes.EXPORT_FAILED]: "Export operation failed",
  [UserManagementErrorCodes.FILE_TOO_LARGE]: "File size exceeds maximum limit",
  [UserManagementErrorCodes.UNSUPPORTED_FILE_FORMAT]: "Unsupported file format",
};

// Error severity levels
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Enhanced error response with severity and recovery suggestions
export interface EnhancedApiErrorResponse extends ApiErrorResponse {
  severity: ErrorSeverity;
  userMessage?: string; // User-friendly message
  technicalMessage?: string; // Technical details for developers
  recoverySuggestions?: string[];
  relatedErrors?: string[];
  helpUrl?: string;
}

// Data export/import interfaces
export interface ExportRequest {
  format: "csv" | "excel" | "json";
  filters?: Partial<UserFilters>;
  fields?: string[];
  includeHeaders?: boolean;
  includeMetadata?: boolean;
}

export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  fileSize: number;
  recordCount: number;
  expiresAt: string;
  format: string;
}

export interface ImportRequest {
  file: File;
  options: ImportOptions;
}

export interface ImportOptions {
  skipDuplicates: boolean;
  updateExisting: boolean;
  validateOnly: boolean;
  skipInvalidRows: boolean;
  defaultRole?: string;
  defaultStatus?: boolean;
  fieldMapping?: Record<string, string>;
}

export interface ImportResponse {
  success: boolean;
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  };
  errors: ImportError[];
  warnings: ImportWarning[];
  previewData?: User[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ImportWarning {
  row: number;
  field?: string;
  message: string;
  value?: unknown;
}

// User activity tracking interfaces
export interface UserActivity {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface UserActivitySummary {
  userId: string;
  totalActions: number;
  lastActivity: string;
  mostCommonActions: {
    action: string;
    count: number;
  }[];
  activityByDay: {
    date: string;
    count: number;
  }[];
}

// User statistics interfaces
export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  neverLoggedIn: number;
  byRole: {
    role: string;
    count: number;
  }[];
  byStatus: {
    status: string;
    count: number;
  }[];
  recentlyCreated: number; // Last 7 days
  recentlyActive: number; // Last 7 days
  averageSessionDuration?: number;
  topActiveUsers: {
    userId: string;
    name: string;
    activityCount: number;
  }[];
}

// User preferences and settings
export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  language?: string;
  timezone?: string;
  dateFormat?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy?: {
    showProfile: boolean;
    showActivity: boolean;
    allowMessages: boolean;
  };
}

// User session information
export interface UserSession {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  startedAt: string;
  lastActivity: string;
  isActive: boolean;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
}

// Audit log interfaces
export interface AuditLog {
  id: string;
  userId: string; // Who performed the action
  targetUserId?: string; // Who was affected (for user management actions)
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// Search and filter helper types
export interface SearchSuggestion {
  type: "user" | "email" | "role" | "status";
  value: string;
  label: string;
  count?: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

// UI state management interfaces
export interface UserTableState {
  selectedUsers: string[];
  filters: UserFilters;
  pagination: PaginationParams;
  loading: boolean;
  error?: string;
  lastUpdated?: string;
}

export interface UserDialogState {
  open: boolean;
  mode: "create" | "edit" | "view";
  user?: User;
  loading: boolean;
  error?: string;
}

export interface BulkOperationState {
  selectedUsers: string[];
  operation?: string;
  loading: boolean;
  progress?: BulkOperationProgress;
  result?: BulkOperationResult;
}

// Form validation schemas (for use with libraries like Zod)
export interface UserFormData {
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  confirmPassword?: string;
  role_id?: string;
  is_active: boolean;
  sex?: boolean;
  birthday?: string;
  address?: string;
  avatar?: string;
  locale?: string;
  group_id?: number;
  slack_webhook_url?: string;
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorResponse;
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Utility types for type safety
export type UserField = keyof User;
export type SortableUserField =
  | "full_name"
  | "email"
  | "created_at"
  | "last_login"
  | "role"
  | "status";
export type FilterableUserField =
  | "role"
  | "status"
  | "activity_status"
  | "locale"
  | "group_id";
export type BulkOperation =
  | "ban"
  | "unban"
  | "delete"
  | "assign_role"
  | "remove_role"
  | "export"
  | "send_notification";

// Constants for validation and limits
export const USER_VALIDATION_RULES = {
  EMAIL_MAX_LENGTH: 255,
  NAME_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 1,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  ADDRESS_MAX_LENGTH: 500,
  SLACK_WEBHOOK_MAX_LENGTH: 500,
} as const;

export const PAGINATION_LIMITS = {
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 20,
  MAX_BULK_SELECTION: 1000,
  DEFAULT_PAGINATION_CONFIG: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    maxPageSize: 100,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
  },
} as const;

export const EXPORT_LIMITS = {
  MAX_RECORDS: 10000,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_FORMATS: ["csv", "excel", "json"] as const,
} as const;

export const IMPORT_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_RECORDS: 5000,
  SUPPORTED_FORMATS: ["csv", "xlsx", "json"] as const,
} as const;
