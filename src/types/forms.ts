// Form-related types and validation interfaces

import { User, UserRole, CreateUserRequest, UpdateUserRequest } from "./user";

// Form field types
export type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "textarea"
  | "file"
  | "url"
  | "tel";

// Form field configuration
export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  validation?: FieldValidation;
  options?: FormFieldOption[];
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: unknown;
  dependencies?: FormFieldDependency[];
}

// Form field option (for select, radio, etc.)
export interface FormFieldOption {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: string;
}

// Form field dependency
export interface FormFieldDependency {
  field: string;
  condition:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "greater_than"
    | "less_than";
  value: unknown;
  action: "show" | "hide" | "enable" | "disable" | "require";
}

// Field validation rules
export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (
    value: unknown,
    formData?: Record<string, unknown>
  ) => boolean | string;
  asyncValidation?: (value: unknown) => Promise<boolean | string>;
}

// Form validation result
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
  touchedFields: string[];
  dirtyFields: string[];
}

// Form state interface
export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  submitCount: number;
  initialValues: T;
}

// Form configuration
export interface FormConfig {
  fields: FormField[];
  validation?: "onChange" | "onBlur" | "onSubmit";
  resetOnSubmit?: boolean;
  enableReinitialize?: boolean;
  validateOnMount?: boolean;
  submitOnEnter?: boolean;
  autoSave?: {
    enabled: boolean;
    interval: number;
    key: string;
  };
}

// User form data interfaces
export interface UserFormData extends Omit<CreateUserRequest, "password"> {
  password?: string;
  confirmPassword?: string;
  role_id?: string;
  is_active: boolean;
  // Additional form-specific fields
  send_welcome_email?: boolean;
  force_password_change?: boolean;
  temporary_password?: boolean;
}

export interface UserEditFormData extends Partial<UserFormData> {
  id: string;
  // Edit-specific fields
  update_reason?: string;
  notify_user?: boolean;
  clear_sessions?: boolean;
}

// Bulk operation form data
export interface BulkOperationFormData {
  operation: string;
  userIds: string[];
  roleId?: string;
  reason?: string;
  notifyUsers?: boolean;
  force?: boolean;
  // Export-specific fields
  exportFormat?: string;
  exportFields?: string[];
  includeHeaders?: boolean;
  // Notification-specific fields
  notificationMessage?: string;
  notificationSubject?: string;
}

// Filter form data
export interface FilterFormData {
  search: string;
  role: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  activityDateFrom: string;
  activityDateTo: string;
  hasAvatar: boolean | null;
  locale: string;
  group_id: number | null;
  activity_status: string;
  // Advanced filters
  age_min: number | null;
  age_max: number | null;
  coin_min: string;
  coin_max: string;
}

// Import form data
export interface ImportFormData {
  file: File | null;
  skipDuplicates: boolean;
  updateExisting: boolean;
  validateOnly: boolean;
  skipInvalidRows: boolean;
  defaultRole: string;
  defaultStatus: boolean;
  fieldMapping: Record<string, string>;
  // Preview options
  previewRows: number;
  hasHeaders: boolean;
}

// Form step interface (for multi-step forms)
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  validation?: (values: Record<string, unknown>) => FormValidationResult;
  canSkip?: boolean;
  isOptional?: boolean;
}

// Multi-step form configuration
export interface MultiStepFormConfig extends Omit<FormConfig, "fields"> {
  steps: FormStep[];
  fields: FormField[];
  allowBackNavigation?: boolean;
  showProgress?: boolean;
  saveProgress?: boolean;
  progressKey?: string;
}

// Multi-step form state
export interface MultiStepFormState<T = Record<string, unknown>>
  extends FormState<T> {
  currentStep: number;
  completedSteps: number[];
  stepErrors: Record<number, Record<string, string[]>>;
  canProceed: boolean;
  canGoBack: boolean;
  progress: number; // 0-100
}

// Form submission result
export interface FormSubmissionResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
  warnings?: Record<string, string[]>;
  message?: string;
  redirectUrl?: string;
  shouldReset?: boolean;
}

// Form field component props
export interface FormFieldProps {
  field: FormField;
  value: unknown;
  error?: string[];
  warning?: string[];
  touched?: boolean;
  dirty?: boolean;
  disabled?: boolean;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  onFocus?: () => void;
}

// Form context interface
export interface FormContextValue<T = Record<string, unknown>> {
  state: FormState<T>;
  config: FormConfig;
  setValue: (name: string, value: unknown) => void;
  setError: (name: string, error: string | string[]) => void;
  clearError: (name: string) => void;
  setTouched: (name: string, touched?: boolean) => void;
  setDirty: (name: string, dirty?: boolean) => void;
  validateField: (name: string) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  submitForm: () => Promise<void>;
  resetForm: (values?: Partial<T>) => void;
  getFieldProps: (name: string) => FormFieldProps;
}

// Form hook options
export interface UseFormOptions<T = Record<string, unknown>> {
  initialValues: T;
  validation?: (
    values: T
  ) => FormValidationResult | Promise<FormValidationResult>;
  onSubmit: (
    values: T
  ) => Promise<FormSubmissionResult<unknown>> | FormSubmissionResult<unknown>;
  onError?: (errors: Record<string, string[]>) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  resetOnSubmit?: boolean;
  enableReinitialize?: boolean;
}

// Predefined form configurations
export const USER_FORM_CONFIG: FormConfig = {
  fields: [
    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true,
      validation: {
        required: true,
        email: true,
        maxLength: 255,
      },
    },
    {
      name: "first_name",
      label: "First Name",
      type: "text",
      required: true,
      validation: {
        required: true,
        minLength: 1,
        maxLength: 100,
      },
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text",
      required: true,
      validation: {
        required: true,
        minLength: 1,
        maxLength: 100,
      },
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: true,
      validation: {
        required: true,
        minLength: 8,
        maxLength: 128,
      },
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      required: true,
      validation: {
        required: true,
        custom: (value, formData) => {
          return value === formData?.password || "Passwords do not match";
        },
      },
      dependencies: [
        {
          field: "password",
          condition: "not_equals",
          value: "",
          action: "show",
        },
      ],
    },
    {
      name: "role_id",
      label: "Role",
      type: "select",
      options: [], // Will be populated dynamically
    },
    {
      name: "is_active",
      label: "Active",
      type: "checkbox",
      defaultValue: true,
    },
  ],
  validation: "onBlur",
  resetOnSubmit: false,
};

export const BULK_OPERATION_FORM_CONFIG: FormConfig = {
  fields: [
    {
      name: "operation",
      label: "Operation",
      type: "select",
      required: true,
      options: [
        { value: "ban", label: "Ban Users" },
        { value: "unban", label: "Unban Users" },
        { value: "delete", label: "Delete Users" },
        { value: "assign_role", label: "Assign Role" },
        { value: "export", label: "Export Users" },
      ],
    },
    {
      name: "roleId",
      label: "Role",
      type: "select",
      dependencies: [
        {
          field: "operation",
          condition: "equals",
          value: "assign_role",
          action: "show",
        },
      ],
    },
    {
      name: "reason",
      label: "Reason",
      type: "textarea",
      helpText: "Optional reason for this operation (for audit logs)",
    },
    {
      name: "notifyUsers",
      label: "Notify affected users",
      type: "checkbox",
      defaultValue: false,
    },
  ],
  validation: "onChange",
};

export const IMPORT_FORM_CONFIG: FormConfig = {
  fields: [
    {
      name: "file",
      label: "Import File",
      type: "file",
      required: true,
      helpText: "Supported formats: CSV, Excel (.xlsx)",
    },
    {
      name: "hasHeaders",
      label: "File has headers",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "skipDuplicates",
      label: "Skip duplicate emails",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "updateExisting",
      label: "Update existing users",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "validateOnly",
      label: "Validate only (don't import)",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "defaultRole",
      label: "Default Role",
      type: "select",
      helpText: "Role to assign to users without a specified role",
    },
    {
      name: "defaultStatus",
      label: "Default Status",
      type: "checkbox",
      defaultValue: true,
      helpText: "Whether imported users should be active by default",
    },
  ],
  validation: "onChange",
};

// Form validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && password.length <= 128;
};

export const validateRequired = (value: unknown): boolean => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateLength = (
  value: string,
  min?: number,
  max?: number
): boolean => {
  const length = value?.length || 0;
  if (min !== undefined && length < min) return false;
  if (max !== undefined && length > max) return false;
  return true;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Form field generators
export const generateRoleOptions = (
  roles: Array<{ id: string; name: string; description?: string }>
): FormFieldOption[] => {
  return roles.map((role) => ({
    value: role.id,
    label: role.name,
    description: role.description,
  }));
};

export const generateStatusOptions = (): FormFieldOption[] => [
  { value: "all", label: "All Users" },
  { value: "active", label: "Active Users" },
  { value: "inactive", label: "Inactive Users" },
  { value: "banned", label: "Banned Users" },
];

export const generateActivityStatusOptions = (): FormFieldOption[] => [
  { value: "all", label: "All Activity Statuses" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "never", label: "Never Logged In" },
];
