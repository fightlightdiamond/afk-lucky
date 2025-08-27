// Main types index file - exports all user management types

// User-related types
export type {
  User,
  AuthUser,
  PublicUser,
  Role,
  UserFilters,
  FilterPreset,
  PaginationParams,
  PaginationConfig,
  GetUsersParams,
  UsersResponse,
  UserResponse,
  BulkOperationRequest,
  BulkOperationResult,
  BulkOperationProgress,
  BulkOperationError,
  BulkOperationWarning,
  CreateUserRequest,
  UpdateUserRequest,
  PatchUserRequest,
  UserValidationResult,
  UserMutationResponse,
  UserActivity,
  UserActivitySummary,
  UserStatistics,
  UserPreferences,
  UserSession,
  AuditLog,
  SearchSuggestion,
  FilterOption,
  UserTableState,
  UserDialogState,
  BulkOperationState,
  UserFormData,
  ExportRequest,
  ExportResponse,
  ImportRequest,
  ImportOptions,
  ImportResponse,
  ImportError,
  ImportWarning,
  DateRange,
  UserField,
  PublicUserField,
  AuthUserField,
  FilterableUserField,
  SortableUserField,
  SortOrder,
  FieldValidationRule,
} from "./user";

// User enums
export {
  UserRole,
  UserStatus,
  ActivityStatus,
  UserManagementErrorCodes,
  ErrorSeverity,
} from "./user";

// User constants
export {
  DEFAULT_FILTER_PRESETS,
  DEFAULT_PAGINATION_CONFIG,
  errorMessages,
  USER_VALIDATION_RULES,
  PAGINATION_LIMITS,
  EXPORT_LIMITS,
  IMPORT_LIMITS,
  USER_FIELD_VALIDATION,
} from "./user";

// User utility functions
export {
  isUser,
  isAuthUser,
  isPublicUser,
  transformUserToAuthUser,
  transformUserToPublicUser,
} from "./user";

// User type aliases
export type { BulkOperationType, ExportFormat } from "./user";

// API-related types
export type {
  ApiResponse,
  ApiResponseMetadata,
  ApiErrorResponse,
  ApiRequestOptions,
  PaginationRequest,
  SortRequest,
  FilterRequest,
  QueryRequest,
  BatchRequest,
  BatchResponse,
  FileUploadRequest,
  FileUploadResponse,
  WebhookPayload,
  RateLimitInfo,
  HealthCheckResponse,
  ApiVersion,
  RequestContext,
  CacheOptions,
  ApiMetrics,
  SearchRequest,
  SearchResponse,
} from "./api";

// API enums
export {
  ErrorSeverity as ApiErrorSeverity,
  HttpStatusCode,
  ContentType,
} from "./api";

// API constants
export { API_CONSTANTS } from "./api";

// Form-related types
export type {
  FormFieldType,
  FormField,
  FormFieldOption,
  FormFieldDependency,
  FieldValidation,
  FormValidationResult,
  FormState,
  FormConfig,
  UserFormData,
  UserEditFormData,
  BulkOperationFormData,
  FilterFormData,
  ImportFormData,
  FormStep,
  MultiStepFormConfig,
  MultiStepFormState,
  FormSubmissionResult,
  FormFieldProps,
  FormContextValue,
  UseFormOptions,
} from "./forms";

// Form constants
export {
  USER_FORM_CONFIG,
  BULK_OPERATION_FORM_CONFIG,
  IMPORT_FORM_CONFIG,
} from "./forms";

// Form utility functions
export {
  validateEmail,
  validatePassword,
  validateRequired,
  validateLength,
  validateUrl,
  generateRoleOptions,
  generateStatusOptions,
  generateActivityStatusOptions,
} from "./forms";

// Re-export commonly used types with shorter names for convenience
export type {
  User as AdminUser,
  AuthUser as SimpleUser,
  UserFilters as Filters,
  PaginationParams as Pagination,
  BulkOperationRequest as BulkRequest,
  BulkOperationResult as BulkResult,
  CreateUserRequest as CreateUser,
  UpdateUserRequest as UpdateUser,
  ApiResponse as Response,
  ApiErrorResponse as ErrorResponse,
} from "./user";

// Type utility helpers
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Common type combinations
export type UserWithRole = User & {
  role: Required<Role>;
};

export type UserListItem = Pick<
  User,
  "id" | "email" | "full_name" | "is_active" | "created_at" | "last_login"
> & {
  role?: Pick<Role, "id" | "name">;
};

export type UserSummary = Pick<
  User,
  "id" | "email" | "full_name" | "status" | "activity_status"
>;

export type CreateUserForm = Omit<CreateUserRequest, "password"> & {
  password: string;
  confirmPassword: string;
};

export type UpdateUserForm = UpdateUserRequest & {
  id: string;
  confirmPassword?: string;
};

// Validation result types
export type ValidationResult<T = unknown> = {
  isValid: boolean;
  data?: T;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
};

// Query result types
export type QueryResult<T = unknown> = {
  data?: T;
  error?: ApiErrorResponse;
  loading: boolean;
  refetch: () => void;
};

export type MutationResult<T = unknown> = {
  data?: T;
  error?: ApiErrorResponse;
  loading: boolean;
  mutate: (variables: unknown) => Promise<T>;
};

// Table column types
export type TableColumn<T = unknown> = {
  key: string;
  title: string;
  dataIndex?: keyof T;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
};

export type TableAction<T = unknown> = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: T) => void;
  disabled?: (record: T) => boolean;
  visible?: (record: T) => boolean;
  danger?: boolean;
};

// Filter and sort types for tables
export type TableFilters = Record<string, unknown>;
export type TableSorter = {
  field: string;
  order: "ascend" | "descend";
};

// Pagination types for tables
export type TablePagination = {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
};

// Selection types for tables
export type TableSelection<T = unknown> = {
  selectedRowKeys: string[];
  selectedRows: T[];
  onChange: (selectedRowKeys: string[], selectedRows: T[]) => void;
  onSelectAll: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
  onSelect: (record: T, selected: boolean, selectedRows: T[]) => void;
};

// Common component prop types
export type ComponentSize = "small" | "medium" | "large";
export type ComponentVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";
export type ComponentStatus =
  | "loading"
  | "success"
  | "error"
  | "warning"
  | "info";

// Theme and styling types
export type ThemeMode = "light" | "dark" | "system";
export type ColorScheme =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "gray";

// Responsive breakpoint types
export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// Event handler types
export type ChangeHandler<T = unknown> = (value: T) => void;
export type ClickHandler = (event: React.MouseEvent) => void;
export type SubmitHandler<T = unknown> = (values: T) => void | Promise<void>;
export type ErrorHandler = (error: Error | ApiErrorResponse) => void;

// Generic utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Function types
export type AsyncFunction<T = unknown, R = unknown> = (arg: T) => Promise<R>;
export type SyncFunction<T = unknown, R = unknown> = (arg: T) => R;
export type VoidFunction = () => void;
export type AsyncVoidFunction = () => Promise<void>;

// ID types
export type ID = string | number;
export type UUID = string;
export type Timestamp = string | number | Date;

// Status types
export type LoadingState = "idle" | "loading" | "success" | "error";
export type RequestState = "pending" | "fulfilled" | "rejected";
export type OperationStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";
