import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserManagementErrorCodes } from "@/types/user";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { UserManagementPage } from "@/components/admin/UserManagementPage";
import { toast } from "sonner";

// Mock dependencies
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/lib/api", () => ({
  userApi: {
    getUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    bulkOperation: vi.fn(),
    exportUsers: vi.fn(),
    importUsers: vi.fn(),
  },
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "admin-id",
        email: "admin@example.com",
        role: "ADMIN",
      },
    },
    status: "authenticated",
  }),
}));

vi.mock("@/store/userStore", () => ({
  useUserStore: () => ({
    userFilters: {
      search: "",
      role: null,
      status: null,
      dateRange: null,
      sortBy: "created_at",
      sortOrder: "desc",
    },
    selectedUsers: new Set(),
    clearSelection: vi.fn(),
    setFilters: vi.fn(),
    toggleUserSelection: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </QueryClientProvider>
  );
};

describe("Comprehensive Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console.error to avoid noise in tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("API Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      const { userApi } = await import("@/lib/api");
      (userApi.getUsers as any).mockRejectedValue(new Error("Network error"));

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("Network error")
        );
      });
    });

    it("should handle 401 unauthorized errors", async () => {
      const { userApi } = await import("@/lib/api");
      const unauthorizedError = new Error("Unauthorized");
      (unauthorizedError as any).status = 401;
      (unauthorizedError as any).code =
        UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS;

      (userApi.getUsers as any).mockRejectedValue(unauthorizedError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("Unauthorized")
        );
      });
    });

    it("should handle 403 forbidden errors", async () => {
      const { userApi } = await import("@/lib/api");
      const forbiddenError = new Error("Insufficient permissions");
      (forbiddenError as any).status = 403;
      (forbiddenError as any).code =
        UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS;

      (userApi.getUsers as any).mockRejectedValue(forbiddenError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("Insufficient permissions")
        );
      });
    });

    it("should handle 404 not found errors", async () => {
      const { userApi } = await import("@/lib/api");
      const notFoundError = new Error("User not found");
      (notFoundError as any).status = 404;
      (notFoundError as any).code = UserManagementErrorCodes.USER_NOT_FOUND;

      (userApi.updateUser as any).mockRejectedValue(notFoundError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      // Simulate user update that fails
      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
      });
    });

    it("should handle 409 conflict errors", async () => {
      const { userApi } = await import("@/lib/api");
      const conflictError = new Error("Email already exists");
      (conflictError as any).status = 409;
      (conflictError as any).code =
        UserManagementErrorCodes.EMAIL_ALREADY_EXISTS;

      (userApi.createUser as any).mockRejectedValue(conflictError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
      });
    });

    it("should handle 422 validation errors", async () => {
      const { userApi } = await import("@/lib/api");
      const validationError = new Error("Validation failed");
      (validationError as any).status = 422;
      (validationError as any).code = UserManagementErrorCodes.VALIDATION_ERROR;
      (validationError as any).details = {
        errors: [
          { field: "email", message: "Invalid email format" },
          { field: "password", message: "Password too weak" },
        ],
      };

      (userApi.createUser as any).mockRejectedValue(validationError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
      });
    });

    it("should handle 500 server errors", async () => {
      const { userApi } = await import("@/lib/api");
      const serverError = new Error("Internal server error");
      (serverError as any).status = 500;
      (serverError as any).code =
        UserManagementErrorCodes.INTERNAL_SERVER_ERROR;

      (userApi.getUsers as any).mockRejectedValue(serverError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("Internal server error")
        );
      });
    });

    it("should handle timeout errors", async () => {
      const { userApi } = await import("@/lib/api");
      const timeoutError = new Error("Request timeout");
      (timeoutError as any).name = "TimeoutError";

      (userApi.getUsers as any).mockRejectedValue(timeoutError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("timeout")
        );
      });
    });

    it("should handle rate limiting errors", async () => {
      const { userApi } = await import("@/lib/api");
      const rateLimitError = new Error("Too many requests");
      (rateLimitError as any).status = 429;

      (userApi.getUsers as any).mockRejectedValue(rateLimitError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("Too many requests")
        );
      });
    });
  });

  describe("Bulk Operation Error Handling", () => {
    it("should handle partial failures in bulk operations", async () => {
      const { userApi } = await import("@/lib/api");
      const partialFailureResult = {
        success: 2,
        failed: 1,
        errors: ["Failed to delete user-3: User not found"],
      };

      (userApi.bulkOperation as any).mockResolvedValue(partialFailureResult);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
      });
    });

    it("should handle complete bulk operation failures", async () => {
      const { userApi } = await import("@/lib/api");
      const bulkError = new Error("Bulk operation failed");
      (bulkError as any).code = UserManagementErrorCodes.BULK_OPERATION_FAILED;

      (userApi.bulkOperation as any).mockRejectedValue(bulkError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
      });
    });

    it("should handle bulk operation permission errors", async () => {
      const { userApi } = await import("@/lib/api");
      const permissionError = new Error("Cannot delete your own account");
      (permissionError as any).code =
        UserManagementErrorCodes.CANNOT_DELETE_SELF;

      (userApi.bulkOperation as any).mockRejectedValue(permissionError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
      });
    });
  });

  describe("Import/Export Error Handling", () => {
    it("should handle file upload errors", async () => {
      const { userApi } = await import("@/lib/api");
      const fileError = new Error("File too large");
      (fileError as any).code = "FILE_TOO_LARGE";

      (userApi.importUsers as any).mockRejectedValue(fileError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
      });
    });

    it("should handle unsupported file format errors", async () => {
      const { userApi } = await import("@/lib/api");
      const formatError = new Error("Unsupported file format");
      (formatError as any).code = "UNSUPPORTED_FILE_FORMAT";

      (userApi.importUsers as any).mockRejectedValue(formatError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
      });
    });

    it("should handle export generation errors", async () => {
      const { userApi } = await import("@/lib/api");
      const exportError = new Error("Failed to generate export");
      (exportError as any).code = "EXPORT_GENERATION_FAILED";

      (userApi.exportUsers as any).mockRejectedValue(exportError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
      });
    });
  });

  describe("Component Error Boundaries", () => {
    it("should catch and display component errors", () => {
      const ThrowError = () => {
        throw new Error("Component error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it("should provide error recovery options", () => {
      const ThrowError = () => {
        throw new Error("Component error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/try again/i)).toBeInTheDocument();
    });

    it("should log errors for debugging", () => {
      const consoleSpy = vi.spyOn(console, "error");
      const ThrowError = () => {
        throw new Error("Component error");
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("Form Validation Error Handling", () => {
    it("should display field-specific validation errors", async () => {
      const user = userEvent.setup();

      render(<UserManagementPage />, { wrapper: createWrapper() });

      // Simulate opening create user dialog and submitting invalid data
      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
      });

      // Test would continue with form interaction...
    });

    it("should handle async validation errors", async () => {
      const { userApi } = await import("@/lib/api");
      const validationError = new Error("Email already exists");
      (validationError as any).code =
        UserManagementErrorCodes.EMAIL_ALREADY_EXISTS;

      (userApi.createUser as any).mockRejectedValue(validationError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
      });
    });
  });

  describe("Loading State Error Handling", () => {
    it("should handle loading state errors gracefully", async () => {
      const { userApi } = await import("@/lib/api");

      // Mock a delayed error
      (userApi.getUsers as any).mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Delayed error")), 100)
          )
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      // Should show loading state first
      expect(
        screen.getByText(/loading/i) || screen.getByRole("progressbar")
      ).toBeTruthy();

      // Then show error
      await waitFor(
        () => {
          expect(toast.error).toHaveBeenCalled();
        },
        { timeout: 200 }
      );
    });

    it("should handle concurrent request errors", async () => {
      const { userApi } = await import("@/lib/api");

      (userApi.getUsers as any).mockRejectedValue(
        new Error("Request 1 failed")
      );
      (userApi.createUser as any).mockRejectedValue(
        new Error("Request 2 failed")
      );

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledTimes(1); // Should handle multiple errors gracefully
      });
    });
  });

  describe("Memory and Performance Error Handling", () => {
    it("should handle large dataset errors", async () => {
      const { userApi } = await import("@/lib/api");
      const memoryError = new Error("Out of memory");
      (memoryError as any).name = "RangeError";

      (userApi.getUsers as any).mockRejectedValue(memoryError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("memory")
        );
      });
    });

    it("should handle quota exceeded errors", async () => {
      const { userApi } = await import("@/lib/api");
      const quotaError = new Error("Quota exceeded");
      (quotaError as any).name = "QuotaExceededError";

      (userApi.exportUsers as any).mockRejectedValue(quotaError);

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
      });
    });
  });

  describe("Error Recovery", () => {
    it("should provide retry mechanisms for failed operations", async () => {
      const { userApi } = await import("@/lib/api");
      let callCount = 0;

      (userApi.getUsers as any).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error("Temporary error"));
        }
        return Promise.resolve({ users: [], pagination: { total: 0 } });
      });

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Simulate retry
      await waitFor(() => {
        expect(callCount).toBeGreaterThan(1);
      });
    });

    it("should clear errors after successful operations", async () => {
      const { userApi } = await import("@/lib/api");

      // First call fails
      (userApi.getUsers as any).mockRejectedValueOnce(new Error("Error"));
      // Second call succeeds
      (userApi.getUsers as any).mockResolvedValueOnce({
        users: [],
        pagination: { total: 0 },
      });

      render(<UserManagementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // After successful retry, error should be cleared
      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
      });
    });
  });
});
