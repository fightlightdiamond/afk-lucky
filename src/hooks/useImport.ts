import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  ImportRequest,
  ImportResponse,
  ImportPreviewRequest,
  ImportPreviewResponse,
  ImportOptions,
  ImportError,
  ImportWarning,
} from "@/types/user";

// Import preview hook
export function useImportPreview() {
  const { toast } = useToast();

  return useMutation<ImportPreviewResponse, Error, ImportPreviewRequest>({
    mutationFn: async ({ file, fieldMapping }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (fieldMapping) {
        formData.append("fieldMapping", JSON.stringify(fieldMapping));
      }

      const response = await fetch("/api/admin/users/import/preview", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Failed to preview import";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error?.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the response status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Preview Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Import validation hook (validate only, don't import)
export function useImportValidation() {
  const { toast } = useToast();

  return useMutation<ImportResponse, Error, ImportRequest>({
    mutationFn: async ({ file, options }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "options",
        JSON.stringify({
          ...options,
          validateOnly: true,
        })
      );

      const response = await fetch("/api/admin/users/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Failed to validate import";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error?.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the response status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Validation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Main import hook
export function useImportUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ImportResponse, Error, ImportRequest>({
    mutationFn: async ({ file, options }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("options", JSON.stringify(options));

      const response = await fetch("/api/admin/users/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Failed to import users";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error?.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the response status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // Show success toast with summary
      const { summary } = data;
      let message = `Import completed: ${summary.created} created`;
      if (summary.updated > 0) {
        message += `, ${summary.updated} updated`;
      }
      if (summary.skipped > 0) {
        message += `, ${summary.skipped} skipped`;
      }
      if (summary.errors > 0) {
        message += `, ${summary.errors} errors`;
      }

      toast({
        title: "Import Completed",
        description: message,
        variant: summary.errors > 0 ? "destructive" : "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Helper function to create default import options
export function createDefaultImportOptions(): ImportOptions {
  return {
    skipDuplicates: false,
    updateExisting: false,
    validateOnly: false,
    skipInvalidRows: true,
    sendWelcomeEmail: false,
    requirePasswordReset: true,
  };
}

// Helper function to validate file before upload
export function validateImportFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return {
      valid: false,
      error: "File size exceeds 10MB limit",
    };
  }

  // Check file type
  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const allowedExtensions = [".csv", ".xls", ".xlsx"];
  const hasValidType = allowedTypes.includes(file.type);
  const hasValidExtension = allowedExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!hasValidType && !hasValidExtension) {
    return {
      valid: false,
      error: "Unsupported file format. Please use CSV or Excel files.",
    };
  }

  return { valid: true };
}

// Helper function to format import errors for display
export function formatImportErrors(errors: ImportError[]): string[] {
  return errors.map((error) => {
    let message = `Row ${error.row}`;
    if (error.field) {
      message += ` (${error.field})`;
    }
    message += `: ${error.message}`;
    return message;
  });
}

// Helper function to format import warnings for display
export function formatImportWarnings(warnings: ImportWarning[]): string[] {
  return warnings.map((warning) => {
    let message = `Row ${warning.row}`;
    if (warning.field) {
      message += ` (${warning.field})`;
    }
    message += `: ${warning.message}`;
    return message;
  });
}

// Helper function to generate sample CSV template
export function generateSampleCSV(): string {
  const headers = [
    "email",
    "first_name",
    "last_name",
    "password",
    "role",
    "is_active",
    "birthday",
    "address",
    "locale",
    "sex",
  ];

  const sampleData = [
    [
      "john.doe@example.com",
      "John",
      "Doe",
      "SecurePass123!",
      "USER",
      "true",
      "1990-01-15",
      "123 Main St, City, State",
      "en",
      "true",
    ],
    [
      "jane.smith@example.com",
      "Jane",
      "Smith",
      "AnotherPass456!",
      "EDITOR",
      "true",
      "1985-06-22",
      "456 Oak Ave, City, State",
      "en",
      "false",
    ],
  ];

  const csvContent = [
    headers.join(","),
    ...sampleData.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

// Helper function to download sample CSV
export function downloadSampleCSV(): void {
  const csvContent = generateSampleCSV();
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "user_import_template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Helper function to get field mapping suggestions
export function getFieldMappingSuggestions(): Record<string, string[]> {
  return {
    email: ["email", "e-mail", "email_address", "emailaddress", "mail"],
    first_name: ["first_name", "firstname", "first", "fname", "given_name"],
    last_name: [
      "last_name",
      "lastname",
      "last",
      "lname",
      "surname",
      "family_name",
    ],
    password: ["password", "pwd", "pass"],
    role: ["role", "user_role", "role_name", "user_type"],
    is_active: ["is_active", "active", "status", "enabled"],
    birthday: ["birthday", "birth_date", "date_of_birth", "dob"],
    address: ["address", "location", "street_address"],
    locale: ["locale", "language", "lang"],
    sex: ["sex", "gender"],
    group_id: ["group_id", "group", "team_id", "team"],
    slack_webhook_url: ["slack_webhook_url", "slack_webhook", "webhook_url"],
  };
}
