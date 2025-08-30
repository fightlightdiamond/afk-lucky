/**
 * Comprehensive error handling utilities for the admin user management system
 * Implements standardized error message display, loading states, and user feedback
 */

import { useToast } from "@/hooks/use-toast";
import {
  UserManagementErrorCodes,
  ApiErrorResponse,
  ErrorSeverity,
} from "@/types/user";

// Error message mappings for user-friendly display
export const ERROR_MESSAGES: Record<UserManagementErrorCodes, string> = {
  [UserManagementErrorCodes.USER_NOT_FOUND]: "User not found",
  [UserManagementErrorCodes.EMAIL_ALREADY_EXISTS]:
    "Email address is already in use",
  [UserManagementErrorCodes.CANNOT_DELETE_SELF]:
    "You cannot delete your own account",
  [UserManagementErrorCodes.CANNOT_BAN_SELF]: "You cannot ban your own account",
  [UserManagementErrorCodes.INVALID_ROLE]: "Selected role is invalid",
  [UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS]:
    "You do not have permission to perform this action",
  [UserManagementErrorCodes.BULK_OPERATION_FAILED]:
    "Some operations failed. Please check the details",
  [UserManagementErrorCodes.VALIDATION_ERROR]:
    "Please check your input and try again",
  [UserManagementErrorCodes.WEAK_PASSWORD]:
    "Password does not meet security requirements",
  [UserManagementErrorCodes.INVALID_EMAIL_FORMAT]:
    "Please enter a valid email address",
  [UserManagementErrorCodes.INVALID_DATE_FORMAT]: "Please enter a valid date",
  [UserManagementErrorCodes.INVALID_PAGINATION_PARAMS]:
    "Invalid page parameters",
  [UserManagementErrorCodes.DATABASE_ERROR]: "Database operation failed",
  [UserManagementErrorCodes.INTERNAL_SERVER_ERROR]:
    "An unexpected error occurred",
  [UserManagementErrorCodes.RATE_LIMIT_EXCEEDED]:
    "Too many requests. Please wait a moment and try again",
  [UserManagementErrorCodes.SERVICE_UNAVAILABLE]:
    "Service temporarily unavailable",
  [UserManagementErrorCodes.UNAUTHORIZED]: "Authentication required",
  [UserManagementErrorCodes.NETWORK_ERROR]: "Network connection error",
  [UserManagementErrorCodes.TIMEOUT_ERROR]: "Request timed out",
  [UserManagementErrorCodes.EXPORT_FAILED]: "Failed to export data",
  [UserManagementErrorCodes.IMPORT_FAILED]: "Failed to import data",
  [UserManagementErrorCodes.FILE_TOO_LARGE]: "File size exceeds maximum limit",
  [UserManagementErrorCodes.INVALID_FILE_FORMAT]: "Invalid file format",
  [UserManagementErrorCodes.CONCURRENT_MODIFICATION]:
    "Data was modified by another user",
};

// Success message mappings
export const SUCCESS_MESSAGES = {
  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  USER_ACTIVATED: "User activated successfully",
  USER_DEACTIVATED: "User deactivated successfully",
  BULK_OPERATION_SUCCESS: "Bulk operation completed successfully",
  EXPORT_SUCCESS: "Data exported successfully",
  IMPORT_SUCCESS: "Data imported successfully",
  SETTINGS_SAVED: "Settings saved successfully",
  PASSWORD_CHANGED: "Password changed successfully",
  ROLE_ASSIGNED: "Role assigned successfully",
} as const;

// Error recovery actions
export interface ErrorRecoveryAction {
  label: string;
  action: () => void;
  variant?: "default" | "destructive";
}

// Enhanced error handling hook
export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = (
    error: unknown,
    context?: string,
    recoveryActions?: ErrorRecoveryAction[]
  ) => {
    console.error(`Error in ${context || "unknown context"}:`, error);

    let errorMessage = "An unexpected error occurred";
    let errorCode: UserManagementErrorCodes | undefined;
    let severity: ErrorSeverity = ErrorSeverity.MEDIUM;

    // Parse different error types
    if (isApiErrorResponse(error)) {
      errorCode = error.code as UserManagementErrorCodes;
      errorMessage =
        error.userMessage || ERROR_MESSAGES[errorCode] || error.error;
      severity = error.severity || ErrorSeverity.MEDIUM;
    } else if (error instanceof Error) {
      errorMessage = error.message;

      // Check for specific error patterns
      if (error.message.includes("Network")) {
        errorCode = UserManagementErrorCodes.NETWORK_ERROR;
        errorMessage = ERROR_MESSAGES[errorCode];
      } else if (error.message.includes("timeout")) {
        errorCode = UserManagementErrorCodes.TIMEOUT_ERROR;
        errorMessage = ERROR_MESSAGES[errorCode];
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    // Show toast notification
    toast({
      title: getErrorTitle(severity),
      description: errorMessage,
      variant: severity === ErrorSeverity.CRITICAL ? "destructive" : "default",
    });

    // Log error for monitoring
    logError(error, context, errorCode, severity);

    return {
      errorMessage,
      errorCode,
      severity,
      recoveryActions,
    };
  };

  const handleSuccess = (
    message: keyof typeof SUCCESS_MESSAGES | string,
    description?: string
  ) => {
    const successMessage =
      typeof message === "string" ? message : SUCCESS_MESSAGES[message];

    toast({
      title: "Success",
      description: description || successMessage,
      variant: "default",
    });
  };

  const handleWarning = (message: string, description?: string) => {
    toast({
      title: "Warning",
      description: description || message,
      variant: "default",
    });
  };

  return {
    handleError,
    handleSuccess,
    handleWarning,
  };
}

// Type guard for API error responses
function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    "code" in error
  );
}

// Get error title based on severity
function getErrorTitle(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.LOW:
      return "Notice";
    case ErrorSeverity.MEDIUM:
      return "Error";
    case ErrorSeverity.HIGH:
      return "Error";
    case ErrorSeverity.CRITICAL:
      return "Critical Error";
    default:
      return "Error";
  }
}

// Error logging function (can be extended to send to monitoring service)
function logError(
  error: unknown,
  context?: string,
  errorCode?: UserManagementErrorCodes,
  severity?: ErrorSeverity
) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    errorCode,
    severity,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
    userAgent:
      typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error Log:", errorLog);
  }

  // In production, you would send this to your monitoring service
  // Example: sendToMonitoringService(errorLog);
}

// Retry utility for failed operations
export function createRetryHandler(
  operation: () => Promise<any>,
  maxRetries: number = 3,
  delay: number = 1000
) {
  return async function retryOperation(): Promise<any> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx) or specific error codes
        if (isApiErrorResponse(error)) {
          const shouldNotRetry = [
            UserManagementErrorCodes.VALIDATION_ERROR,
            UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
            UserManagementErrorCodes.EMAIL_ALREADY_EXISTS,
            UserManagementErrorCodes.USER_NOT_FOUND,
            UserManagementErrorCodes.CANNOT_DELETE_SELF,
            UserManagementErrorCodes.CANNOT_BAN_SELF,
          ].includes(error.code as UserManagementErrorCodes);

          if (shouldNotRetry) {
            throw error;
          }
        }

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }

    throw lastError;
  };
}

// Validation error formatter
export function formatValidationErrors(
  errors: Array<{ field: string; message: string; code?: string }>
): string {
  if (errors.length === 1) {
    return errors[0].message;
  }

  return `Multiple validation errors:\n${errors
    .map((e) => `• ${e.message}`)
    .join("\n")}`;
}

// Network error detector
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("fetch") ||
      error.message.includes("Network") ||
      error.message.includes("ERR_NETWORK") ||
      error.message.includes("ERR_INTERNET_DISCONNECTED")
    );
  }
  return false;
}

// Timeout error detector
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("timeout") ||
      error.message.includes("TIMEOUT") ||
      error.name === "TimeoutError"
    );
  }
  return false;
}

// Error boundary fallback component props
export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  context?: string;
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandling() {
  if (typeof window !== "undefined") {
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);

      // Prevent the default browser behavior
      event.preventDefault();

      // You could show a global error notification here
      // toast.error("An unexpected error occurred");
    });

    window.addEventListener("error", (event) => {
      console.error("Global error:", event.error);

      // Log the error
      logError(event.error, "global", undefined, ErrorSeverity.HIGH);
    });
  }
}
