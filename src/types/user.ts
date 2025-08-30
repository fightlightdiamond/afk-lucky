// Enhanced User Management Types

// Base User interface with all database fields
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
  password?: string; // Only included in certain contexts, never in API responses
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
  role?: Role;
  // Computed fields (calculated on the server or client)
  full_name: string;
  status: UserStatus;
  activity_status: ActivityStatus;
  age?: number; // Computed from birthday
  display_name: string; // Computed display name
}

// Simplified User interface for auth contexts (compatible with NextAuth)
export interface AuthUser {
  id: string;
  email: string;
  name: string; // Maps to full_name
  role?: {
    id: string;
    name: UserRole;
    permissions: string[];
  };
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Public User interface (for non-admin contexts, excludes sensitive data)
export interface PublicUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  display_name: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  role?: Pick<Role, "id" | "name" | "description">;
  activity_status: ActivityStatus;
  locale?: string;
}

// User role enum matching Prisma schema
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  AUTHOR = "AUTHOR",
  EDITOR = "EDITOR",
  MODERATOR = "MODERATOR",
}

// User status enum
export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BANNED = "banned",
  PENDING = "pending",
  SUSPENDED = "suspended",
}

// Activity status enum
export enum ActivityStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  NEVER = "never",
  AWAY = "away",
}

// Role interface
export interface Role {
  id: string;
  name: UserRole;
  description?: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
  user_count?: number; // Computed field for admin UI
  is_system_role?: boolean; // Whether this role can be deleted
}

// Enhanced filter interfaces
export interface UserFilters {
  search: string;
  role: string | null;
  status: UserStatus | "all" | null;
  dateRange: DateRange | null;
  activityDateRange: DateRange | null;
  sortBy: SortableUserField;
  sortOrder: SortOrder;
  // Additional filter options
  hasAvatar?: boolean | null;
  locale?: string | null;
  group_id?: number | null;
  activity_status?: ActivityStatus | null;
  age_range?: {
    min?: number;
    max?: number;
  } | null;
  coin_range?: {
    min?: string;
    max?: string;
  } | null;
}

// Date range interface
export interface DateRange {
  from: Date | null;
  to: Date | null;
}

// Sort order type
export type SortOrder = "asc" | "desc";

// Sortable fields type
export type SortableUserField =
  | "full_name"
  | "email"
  | "created_at"
  | "updated_at"
  | "last_login"
  | "role"
  | "status"
  | "activity_status"
  | "age"
  | "coin";

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
      activity_status: ActivityStatus.NEVER,
      sortBy: "created_at",
      sortOrder: "desc",
    },
  },
  {
    id: "inactive_users",
    name: "Inactive Users",
    description: "Users who are currently inactive/banned",
    filters: {
      status: UserStatus.INACTIVE,
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
  // Additional pagination metadata
  offset: number;
  limit: number;
  isFirstPage: boolean;
  isLastPage: boolean;
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
  // Pagination
  page?: number;
  pageSize?: number;

  // Search and filtering
  search?: string;
  role?: string;
  status?: UserStatus | "all";
  sortBy?: SortableUserField;
  sortOrder?: SortOrder;

  // Date filtering
  dateFrom?: string;
  dateTo?: string;
  activityDateFrom?: string;
  activityDateTo?: string;

  // Additional filters
  hasAvatar?: boolean;
  locale?: string;
  group_id?: number;
  activity_status?: ActivityStatus;
  age_min?: number;
  age_max?: number;
  coin_min?: string;
  coin_max?: string;

  // Export parameters
  export?: boolean;
  exportFormat?: ExportFormat;
  exportFields?: string[];

  // Performance options
  includeRole?: boolean;
  includePermissions?: boolean;
  includeActivity?: boolean;
  includeStats?: boolean;
}

// Export format type
export type ExportFormat = "csv" | "excel" | "json" | "pdf";

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
  operation: BulkOperationType;
  userIds: string[];
  // Operation-specific parameters
  roleId?: string; // For assign_role operation
  notificationMessage?: string; // For send_notification operation
  exportFormat?: ExportFormat; // For export operation
  exportFields?: string[]; // For export operation
  reason?: string; // Optional reason for audit logging
  // Additional options
  force?: boolean; // Force operation even if some validations fail
  async?: boolean; // Run operation asynchronously
  batchSize?: number; // Process in batches for large operations
  notifyUsers?: boolean; // Send notification to affected users
  skipValidation?: boolean; // Skip certain validations (admin only)
}

// Bulk operation types
export type BulkOperationType =
  | "ban"
  | "unban"
  | "activate"
  | "deactivate"
  | "delete"
  | "assign_role"
  | "remove_role"
  | "export"
  | "send_notification"
  | "reset_password"
  | "verify_email"
  | "update_locale"
  | "merge_accounts";

export interface BulkOperationResult {
  // Basic counts
  success: number;
  failed: number;
  skipped: number;
  total: number;

  // Detailed results
  errors: BulkOperationError[];
  warnings?: BulkOperationWarning[];
  details?: {
    successfulIds: string[];
    failedIds: string[];
    skippedIds: string[];
    processedUsers?: Partial<User>[];
  };

  // Operation metadata
  operationId?: string; // For tracking async operations
  operation: BulkOperationType;
  startedAt: string;
  completedAt?: string;
  duration?: number; // in milliseconds

  // Result-specific data
  exportUrl?: string; // For export operations
  downloadToken?: string; // For secure downloads
  notificationsSent?: number; // For notification operations

  // Performance metrics
  batchesProcessed?: number;
  averageBatchTime?: number;
  peakMemoryUsage?: number;
}

// Bulk operation error interface
export interface BulkOperationError {
  userId: string;
  userEmail?: string;
  userName?: string;
  error: string;
  code: UserManagementErrorCodes;
  details?: unknown;
  timestamp: string;
}

// Bulk operation warning interface
export interface BulkOperationWarning {
  userId: string;
  userEmail?: string;
  userName?: string;
  warning: string;
  code?: string;
  details?: unknown;
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
  // Required fields
  email: string;
  first_name: string;
  last_name: string;
  password: string;

  // Optional fields
  role_id?: string;
  is_active?: boolean;

  // Profile fields
  sex?: boolean;
  birthday?: string;
  address?: string;
  avatar?: string;
  locale?: string;
  group_id?: number;
  slack_webhook_url?: string;
  coin?: string; // BigInt as string

  // Admin-only fields
  force_email_verification?: boolean;
  send_welcome_email?: boolean;
  temporary_password?: boolean;
  password_expires_at?: string;
}

export interface UpdateUserRequest {
  // Basic fields
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  role_id?: string;
  is_active?: boolean;

  // Profile fields
  sex?: boolean;
  birthday?: string;
  address?: string;
  avatar?: string;
  locale?: string;
  group_id?: number;
  slack_webhook_url?: string;
  coin?: string; // BigInt as string

  // Admin-only fields
  force_password_change?: boolean;
  reset_remember_token?: boolean;
  clear_sessions?: boolean;
  update_reason?: string; // For audit logging
}

// Partial update request for specific operations
export interface PatchUserRequest {
  operation:
    | "toggle_status"
    | "change_role"
    | "update_profile"
    | "reset_password";
  data: Partial<UpdateUserRequest>;
  reason?: string;
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
  code: UserManagementErrorCodes;
  details?: unknown;
  timestamp: string;
  requestId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  correlationId?: string; // For tracking across services
  retryable?: boolean; // Whether the operation can be retried
  retryAfter?: number; // Seconds to wait before retry
}

export enum UserManagementErrorCodes {
  // User-related errors
  USER_NOT_FOUND = "USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  INVALID_USER_ID = "INVALID_USER_ID",
  USER_ALREADY_ACTIVE = "USER_ALREADY_ACTIVE",
  USER_ALREADY_INACTIVE = "USER_ALREADY_INACTIVE",
  USER_DELETED = "USER_DELETED",
  USER_SUSPENDED = "USER_SUSPENDED",

  // Permission errors
  CANNOT_DELETE_SELF = "CANNOT_DELETE_SELF",
  CANNOT_BAN_SELF = "CANNOT_BAN_SELF",
  CANNOT_MODIFY_SELF = "CANNOT_MODIFY_SELF",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  UNAUTHORIZED = "UNAUTHORIZED",

  // Role-related errors
  INVALID_ROLE = "INVALID_ROLE",
  ROLE_NOT_FOUND = "ROLE_NOT_FOUND",
  CANNOT_ASSIGN_HIGHER_ROLE = "CANNOT_ASSIGN_HIGHER_ROLE",
  ROLE_ASSIGNMENT_FAILED = "ROLE_ASSIGNMENT_FAILED",
  SYSTEM_ROLE_MODIFICATION = "SYSTEM_ROLE_MODIFICATION",

  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_EMAIL_FORMAT = "INVALID_EMAIL_FORMAT",
  WEAK_PASSWORD = "WEAK_PASSWORD",
  INVALID_DATE_FORMAT = "INVALID_DATE_FORMAT",
  INVALID_PAGINATION_PARAMS = "INVALID_PAGINATION_PARAMS",
  REQUIRED_FIELD_MISSING = "REQUIRED_FIELD_MISSING",
  FIELD_TOO_LONG = "FIELD_TOO_LONG",
  FIELD_TOO_SHORT = "FIELD_TOO_SHORT",
  INVALID_FIELD_VALUE = "INVALID_FIELD_VALUE",

  // Bulk operation errors
  BULK_OPERATION_FAILED = "BULK_OPERATION_FAILED",
  BULK_OPERATION_PARTIAL_FAILURE = "BULK_OPERATION_PARTIAL_FAILURE",
  BULK_OPERATION_TIMEOUT = "BULK_OPERATION_TIMEOUT",
  TOO_MANY_USERS_SELECTED = "TOO_MANY_USERS_SELECTED",
  BULK_OPERATION_IN_PROGRESS = "BULK_OPERATION_IN_PROGRESS",
  BULK_OPERATION_CANCELLED = "BULK_OPERATION_CANCELLED",

  // System errors
  DATABASE_ERROR = "DATABASE_ERROR",
  DATABASE_CONNECTION_FAILED = "DATABASE_CONNECTION_FAILED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  MAINTENANCE_MODE = "MAINTENANCE_MODE",
  RESOURCE_EXHAUSTED = "RESOURCE_EXHAUSTED",

  // Import/Export errors
  IMPORT_FILE_INVALID = "IMPORT_FILE_INVALID",
  IMPORT_DATA_INVALID = "IMPORT_DATA_INVALID",
  EXPORT_FAILED = "EXPORT_FAILED",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  UNSUPPORTED_FILE_FORMAT = "UNSUPPORTED_FILE_FORMAT",
  EXPORT_TIMEOUT = "EXPORT_TIMEOUT",
  IMPORT_TIMEOUT = "IMPORT_TIMEOUT",
  DUPLICATE_IMPORT_DATA = "DUPLICATE_IMPORT_DATA",

  // Network and connectivity errors
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  CONNECTION_REFUSED = "CONNECTION_REFUSED",
  DNS_RESOLUTION_FAILED = "DNS_RESOLUTION_FAILED",

  // Feature-specific errors
  EMAIL_SENDING_FAILED = "EMAIL_SENDING_FAILED",
  NOTIFICATION_FAILED = "NOTIFICATION_FAILED",
  AVATAR_UPLOAD_FAILED = "AVATAR_UPLOAD_FAILED",
  PASSWORD_RESET_FAILED = "PASSWORD_RESET_FAILED",
  ACCOUNT_VERIFICATION_FAILED = "ACCOUNT_VERIFICATION_FAILED",
}

export const errorMessages: Record<UserManagementErrorCodes, string> = {
  // User-related errors
  [UserManagementErrorCodes.USER_NOT_FOUND]: "User not found",
  [UserManagementErrorCodes.EMAIL_ALREADY_EXISTS]:
    "Email address is already in use",
  [UserManagementErrorCodes.INVALID_USER_ID]: "Invalid user ID provided",
  [UserManagementErrorCodes.USER_ALREADY_ACTIVE]: "User is already active",
  [UserManagementErrorCodes.USER_ALREADY_INACTIVE]: "User is already inactive",
  [UserManagementErrorCodes.USER_DELETED]: "User has been deleted",
  [UserManagementErrorCodes.USER_SUSPENDED]: "User account is suspended",

  // Permission errors
  [UserManagementErrorCodes.CANNOT_DELETE_SELF]:
    "You cannot delete your own account",
  [UserManagementErrorCodes.CANNOT_BAN_SELF]: "You cannot ban your own account",
  [UserManagementErrorCodes.CANNOT_MODIFY_SELF]:
    "You cannot modify your own account in this way",
  [UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS]:
    "You do not have permission to perform this action",
  [UserManagementErrorCodes.PERMISSION_DENIED]: "Access denied",
  [UserManagementErrorCodes.SESSION_EXPIRED]:
    "Your session has expired. Please log in again",
  [UserManagementErrorCodes.UNAUTHORIZED]:
    "You are not authorized to access this resource",

  // Role-related errors
  [UserManagementErrorCodes.INVALID_ROLE]: "Selected role is invalid",
  [UserManagementErrorCodes.ROLE_NOT_FOUND]: "Role not found",
  [UserManagementErrorCodes.CANNOT_ASSIGN_HIGHER_ROLE]:
    "You cannot assign a role higher than your own",
  [UserManagementErrorCodes.ROLE_ASSIGNMENT_FAILED]:
    "Failed to assign role to user",
  [UserManagementErrorCodes.SYSTEM_ROLE_MODIFICATION]:
    "Cannot modify system roles",

  // Validation errors
  [UserManagementErrorCodes.VALIDATION_ERROR]: "Validation error occurred",
  [UserManagementErrorCodes.INVALID_EMAIL_FORMAT]: "Invalid email format",
  [UserManagementErrorCodes.WEAK_PASSWORD]:
    "Password does not meet security requirements",
  [UserManagementErrorCodes.INVALID_DATE_FORMAT]: "Invalid date format",
  [UserManagementErrorCodes.INVALID_PAGINATION_PARAMS]:
    "Invalid pagination parameters",
  [UserManagementErrorCodes.REQUIRED_FIELD_MISSING]:
    "Required field is missing",
  [UserManagementErrorCodes.FIELD_TOO_LONG]: "Field value is too long",
  [UserManagementErrorCodes.FIELD_TOO_SHORT]: "Field value is too short",
  [UserManagementErrorCodes.INVALID_FIELD_VALUE]: "Invalid field value",

  // Bulk operation errors
  [UserManagementErrorCodes.BULK_OPERATION_FAILED]: "Bulk operation failed",
  [UserManagementErrorCodes.BULK_OPERATION_PARTIAL_FAILURE]:
    "Some operations failed. Please check the details",
  [UserManagementErrorCodes.BULK_OPERATION_TIMEOUT]: "Bulk operation timed out",
  [UserManagementErrorCodes.TOO_MANY_USERS_SELECTED]:
    "Too many users selected for bulk operation",
  [UserManagementErrorCodes.BULK_OPERATION_IN_PROGRESS]:
    "A bulk operation is already in progress",
  [UserManagementErrorCodes.BULK_OPERATION_CANCELLED]:
    "Bulk operation was cancelled",

  // System errors
  [UserManagementErrorCodes.DATABASE_ERROR]: "Database error occurred",
  [UserManagementErrorCodes.DATABASE_CONNECTION_FAILED]:
    "Failed to connect to database",
  [UserManagementErrorCodes.INTERNAL_SERVER_ERROR]: "Internal server error",
  [UserManagementErrorCodes.RATE_LIMIT_EXCEEDED]:
    "Rate limit exceeded. Please try again later",
  [UserManagementErrorCodes.SERVICE_UNAVAILABLE]:
    "Service temporarily unavailable",
  [UserManagementErrorCodes.MAINTENANCE_MODE]:
    "System is currently under maintenance",
  [UserManagementErrorCodes.RESOURCE_EXHAUSTED]:
    "System resources are exhausted",

  // Import/Export errors
  [UserManagementErrorCodes.IMPORT_FILE_INVALID]: "Invalid import file",
  [UserManagementErrorCodes.IMPORT_DATA_INVALID]: "Invalid data in import file",
  [UserManagementErrorCodes.EXPORT_FAILED]: "Export operation failed",
  [UserManagementErrorCodes.FILE_TOO_LARGE]: "File size exceeds maximum limit",
  [UserManagementErrorCodes.UNSUPPORTED_FILE_FORMAT]: "Unsupported file format",
  [UserManagementErrorCodes.EXPORT_TIMEOUT]: "Export operation timed out",
  [UserManagementErrorCodes.IMPORT_TIMEOUT]: "Import operation timed out",
  [UserManagementErrorCodes.DUPLICATE_IMPORT_DATA]:
    "Duplicate data found in import file",

  // Network and connectivity errors
  [UserManagementErrorCodes.NETWORK_ERROR]: "Network error occurred",
  [UserManagementErrorCodes.TIMEOUT_ERROR]: "Request timed out",
  [UserManagementErrorCodes.CONNECTION_REFUSED]: "Connection refused",
  [UserManagementErrorCodes.DNS_RESOLUTION_FAILED]: "DNS resolution failed",

  // Feature-specific errors
  [UserManagementErrorCodes.EMAIL_SENDING_FAILED]: "Failed to send email",
  [UserManagementErrorCodes.NOTIFICATION_FAILED]: "Failed to send notification",
  [UserManagementErrorCodes.AVATAR_UPLOAD_FAILED]: "Failed to upload avatar",
  [UserManagementErrorCodes.PASSWORD_RESET_FAILED]: "Failed to reset password",
  [UserManagementErrorCodes.ACCOUNT_VERIFICATION_FAILED]:
    "Failed to verify account",
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
  sendWelcomeEmail?: boolean;
  requirePasswordReset?: boolean;
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
  operationId?: string; // For tracking async operations
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

export interface ImportPreviewRequest {
  file: File;
  fieldMapping?: Record<string, string>;
}

export interface ImportPreviewResponse {
  success: boolean;
  preview: {
    headers: string[];
    rows: Record<string, unknown>[];
    totalRows: number;
    previewRows: number;
  };
  validation: {
    validRows: number;
    invalidRows: number;
    errors: ImportError[];
    warnings: ImportWarning[];
  };
  suggestedMapping: Record<string, string>;
}

export interface ImportProgressResponse {
  operationId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number; // 0-100
  processed: number;
  total: number;
  startedAt: string;
  estimatedCompletion?: string;
  result?: ImportResponse;
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
export type PublicUserField = keyof PublicUser;
export type AuthUserField = keyof AuthUser;

export type FilterableUserField =
  | "role"
  | "status"
  | "activity_status"
  | "locale"
  | "group_id"
  | "sex"
  | "age"
  | "coin"
  | "hasAvatar";

// Type guards for runtime type checking
export const isUser = (obj: unknown): obj is User => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "email" in obj &&
    "first_name" in obj &&
    "last_name" in obj
  );
};

export const isAuthUser = (obj: unknown): obj is AuthUser => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "email" in obj &&
    "name" in obj
  );
};

export const isPublicUser = (obj: unknown): obj is PublicUser => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "email" in obj &&
    "full_name" in obj
  );
};

// User transformation utilities
export const transformUserToAuthUser = (user: User): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.full_name,
  role: user.role
    ? {
        id: user.role.id,
        name: user.role.name,
        permissions: user.role.permissions,
      }
    : undefined,
  avatar: user.avatar,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

export const transformUserToPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  first_name: user.first_name,
  last_name: user.last_name,
  full_name: user.full_name,
  display_name: user.display_name,
  avatar: user.avatar,
  is_active: user.is_active,
  created_at: user.created_at,
  role: user.role
    ? {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
      }
    : undefined,
  activity_status: user.activity_status,
  locale: user.locale,
});

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

// Field validation utilities
export interface FieldValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
}

export const USER_FIELD_VALIDATION: Record<string, FieldValidationRule> = {
  email: {
    required: true,
    maxLength: USER_VALIDATION_RULES.EMAIL_MAX_LENGTH,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  first_name: {
    required: true,
    minLength: USER_VALIDATION_RULES.NAME_MIN_LENGTH,
    maxLength: USER_VALIDATION_RULES.NAME_MAX_LENGTH,
  },
  last_name: {
    required: true,
    minLength: USER_VALIDATION_RULES.NAME_MIN_LENGTH,
    maxLength: USER_VALIDATION_RULES.NAME_MAX_LENGTH,
  },
  password: {
    required: true,
    minLength: USER_VALIDATION_RULES.PASSWORD_MIN_LENGTH,
    maxLength: USER_VALIDATION_RULES.PASSWORD_MAX_LENGTH,
  },
  address: {
    maxLength: USER_VALIDATION_RULES.ADDRESS_MAX_LENGTH,
  },
  slack_webhook_url: {
    maxLength: USER_VALIDATION_RULES.SLACK_WEBHOOK_MAX_LENGTH,
    pattern: /^https:\/\/hooks\.slack\.com\/services\/.+/,
  },
};

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
