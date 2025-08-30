import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserManagementPage } from "@/components/admin/UserManagementPage";
import { mockUsers, mockRoles } from "../__mocks__/user-data";

// Mock API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    toString: vi.fn(() => ""),
  }),
  usePathname: () => "/admin/users",
}));

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "admin-id",
        email: "admin@test.com",
        role: "ADMIN",
      },
    },
    status: "authenticated",
  }),
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("User Management Workflows", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();

    // Default successful responses
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (url.includes("/api/admin/users") && !options?.method) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              users: mockUsers,
              pagination: {
                page: 1,
                pageSize: 10,
                total: mockUsers.length,
              },
            }),
        });
      }

      if (url.includes("/api/admin/roles")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRoles),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  describe("Complete User Creation Workflow", () => {
    it("should create a new user with all required fields", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      // Click create user button
      const createButton = screen.getByRole("button", { name: /create user/i });
      await user.click(createButton);

      // Fill out the form
      await user.type(screen.getByLabelText(/first name/i), "John");
      await user.type(screen.getByLabelText(/last name/i), "Doe");
      await user.type(screen.getByLabelText(/email/i), "john.doe@test.com");
      await user.type(screen.getByLabelText(/password/i), "password123");

      // Select a role
      const roleSelect = screen.getByRole("combobox", { name: /role/i });
      await user.click(roleSelect);
      await user.click(screen.getByText("USER"));

      // Mock successful creation
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "new-user-id",
              email: "john.doe@test.com",
              first_name: "John",
              last_name: "Doe",
              is_active: true,
              role: { name: "USER" },
            }),
        })
      );

      // Submit the form
      const submitButton = screen.getByRole("button", { name: /create/i });
      await user.click(submitButton);

      // Verify API call
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/admin/users",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              first_name: "John",
              last_name: "Doe",
              email: "john.doe@test.com",
              password: "password123",
              role_id: "role-2",
            }),
          })
        );
      });
    });

    it("should handle validation errors during user creation", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      const createButton = screen.getByRole("button", { name: /create user/i });
      await user.click(createButton);

      // Try to submit without required fields
      const submitButton = screen.getByRole("button", { name: /create/i });
      await user.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it("should handle email availability checking", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      const createButton = screen.getByRole("button", { name: /create user/i });
      await user.click(createButton);

      // Mock email check response
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ available: false }),
        })
      );

      // Type an email
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "existing@test.com");

      // Should show email unavailable message
      await waitFor(() => {
        expect(screen.getByText(/email is already taken/i)).toBeInTheDocument();
      });
    });
  });

  describe("User Search and Filtering Workflow", () => {
    it("should search users by name and email", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      // Type in search box
      const searchInput = screen.getByPlaceholderText(/search users/i);
      await user.type(searchInput, "john");

      // Should trigger search API call
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("search=john"),
          expect.any(Object)
        );
      });
    });

    it("should filter users by role", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      // Open role filter
      const roleFilter = screen.getByRole("button", { name: /role/i });
      await user.click(roleFilter);

      // Select ADMIN role
      await user.click(screen.getByText("ADMIN"));

      // Should trigger filtered API call
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("role=role-1"),
          expect.any(Object)
        );
      });
    });

    it("should filter users by status", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      // Open status filter
      const statusFilter = screen.getByRole("button", { name: /status/i });
      await user.click(statusFilter);

      // Select inactive status
      await user.click(screen.getByText("Inactive"));

      // Should trigger filtered API call
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("status=inactive"),
          expect.any(Object)
        );
      });
    });

    it("should combine multiple filters", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      // Apply search
      const searchInput = screen.getByPlaceholderText(/search users/i);
      await user.type(searchInput, "admin");

      // Apply role filter
      const roleFilter = screen.getByRole("button", { name: /role/i });
      await user.click(roleFilter);
      await user.click(screen.getByText("ADMIN"));

      // Should combine filters in API call
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringMatching(
            /search=admin.*role=role-1|role=role-1.*search=admin/
          ),
          expect.any(Object)
        );
      });
    });
  });

  describe("Bulk Operations Workflow", () => {
    it("should select multiple users and perform bulk ban", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      // Select multiple users
      const checkboxes = screen.getAllByRole("checkbox");
      await user.click(checkboxes[1]); // First user checkbox
      await user.click(checkboxes[2]); // Second user checkbox

      // Bulk action bar should appear
      await waitFor(() => {
        expect(screen.getByText(/2 users selected/i)).toBeInTheDocument();
      });

      // Click bulk ban
      const banButton = screen.getByRole("button", { name: /ban selected/i });
      await user.click(banButton);

      // Confirm in dialog
      const confirmButton = screen.getByRole("button", { name: /confirm/i });

      // Mock successful bulk operation
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: 2,
              failed: 0,
              errors: [],
            }),
        })
      );

      await user.click(confirmButton);

      // Should call bulk API
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/admin/users/bulk",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              operation: "ban",
              userIds: expect.arrayContaining([
                mockUsers[0].id,
                mockUsers[1].id,
              ]),
            }),
          })
        );
      });
    });

    it("should handle bulk operation errors", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      // Select users
      const checkboxes = screen.getAllByRole("checkbox");
      await user.click(checkboxes[1]);

      // Try bulk delete
      const deleteButton = screen.getByRole("button", {
        name: /delete selected/i,
      });
      await user.click(deleteButton);

      // Mock error response
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              error: "Cannot delete your own account",
            }),
        })
      );

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      await user.click(confirmButton);

      // Should show error message
      await waitFor(() => {
        expect(
          screen.getByText(/cannot delete your own account/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("User Status Management Workflow", () => {
    it("should toggle user status with confirmation", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      // Find and click status toggle for first user
      const statusButtons = screen.getAllByRole("button", {
        name: /toggle status/i,
      });

      // Mock successful status update
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ...mockUsers[0],
              is_active: !mockUsers[0].is_active,
            }),
        })
      );

      await user.click(statusButtons[0]);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      await user.click(confirmButton);

      // Should call update API
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `/api/admin/users/${mockUsers[0].id}`,
          expect.objectContaining({
            method: "PUT",
            body: JSON.stringify({
              is_active: !mockUsers[0].is_active,
            }),
          })
        );
      });
    });
  });

  describe("Pagination Workflow", () => {
    it("should navigate through pages", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      // Mock response with pagination
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              users: mockUsers.slice(10, 20),
              pagination: {
                page: 2,
                pageSize: 10,
                total: 50,
              },
            }),
        })
      );

      // Click next page
      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      // Should call API with page parameter
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("page=2"),
          expect.any(Object)
        );
      });
    });

    it("should change page size", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      // Change page size
      const pageSizeSelect = screen.getByRole("combobox", {
        name: /page size/i,
      });
      await user.click(pageSizeSelect);
      await user.click(screen.getByText("25"));

      // Should call API with new page size
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("pageSize=25"),
          expect.any(Object)
        );
      });
    });
  });

  describe("Error Handling Workflow", () => {
    it("should handle network errors gracefully", async () => {
      const Wrapper = createWrapper();

      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<UserManagementPage />, { wrapper: Wrapper });

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
      });
    });

    it("should handle API errors with proper messages", async () => {
      const Wrapper = createWrapper();

      // Mock API error
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 403,
          json: () =>
            Promise.resolve({
              error: "Insufficient permissions",
            }),
        })
      );

      render(<UserManagementPage />, { wrapper: Wrapper });

      // Should show permission error
      await waitFor(() => {
        expect(
          screen.getByText(/insufficient permissions/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Complete User Management Workflows", () => {
    it("should handle complete user lifecycle from creation to deletion", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      // Step 1: Create user
      const createButton = screen.getByRole("button", { name: /create user/i });
      await user.click(createButton);

      await user.type(screen.getByLabelText(/first name/i), "Test");
      await user.type(screen.getByLabelText(/last name/i), "User");
      await user.type(screen.getByLabelText(/email/i), "test.user@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");

      const roleSelect = screen.getByRole("combobox", { name: /role/i });
      await user.click(roleSelect);
      await user.click(screen.getByText("USER"));

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "test-user-id",
              email: "test.user@example.com",
              first_name: "Test",
              last_name: "User",
              is_active: true,
              role: { name: "USER" },
            }),
        })
      );

      const submitButton = screen.getByRole("button", { name: /create/i });
      await user.click(submitButton);

      // Step 2: Edit user
      await waitFor(() => {
        expect(screen.getByText("test.user@example.com")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", {
        name: /edit.*test\.user/i,
      });
      await user.click(editButton);

      await user.clear(screen.getByLabelText(/first name/i));
      await user.type(screen.getByLabelText(/first name/i), "Updated");

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "test-user-id",
              email: "test.user@example.com",
              first_name: "Updated",
              last_name: "User",
              is_active: true,
              role: { name: "USER" },
            }),
        })
      );

      await user.click(screen.getByRole("button", { name: /save/i }));

      // Step 3: Ban user
      const banButton = screen.getByRole("button", { name: /ban.*updated/i });

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "test-user-id",
              email: "test.user@example.com",
              first_name: "Updated",
              last_name: "User",
              is_active: false,
              role: { name: "USER" },
            }),
        })
      );

      await user.click(banButton);
      await user.click(screen.getByRole("button", { name: /confirm/i }));

      // Step 4: Unban user
      const unbanButton = screen.getByRole("button", {
        name: /unban.*updated/i,
      });

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "test-user-id",
              email: "test.user@example.com",
              first_name: "Updated",
              last_name: "User",
              is_active: true,
              role: { name: "USER" },
            }),
        })
      );

      await user.click(unbanButton);
      await user.click(screen.getByRole("button", { name: /confirm/i }));

      // Step 5: Delete user
      const deleteButton = screen.getByRole("button", {
        name: /delete.*updated/i,
      });

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      );

      await user.click(deleteButton);
      await user.click(
        screen.getByRole("button", { name: /confirm.*delete/i })
      );

      // Verify user is removed
      await waitFor(() => {
        expect(
          screen.queryByText("test.user@example.com")
        ).not.toBeInTheDocument();
      });
    });

    it("should handle complex filtering and bulk operations workflow", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      // Step 1: Apply multiple filters
      const searchInput = screen.getByPlaceholderText(/search users/i);
      await user.type(searchInput, "admin");

      const roleFilter = screen.getByRole("button", { name: /role/i });
      await user.click(roleFilter);
      await user.click(screen.getByText("ADMIN"));

      const statusFilter = screen.getByRole("button", { name: /status/i });
      await user.click(statusFilter);
      await user.click(screen.getByText("Active"));

      // Step 2: Select filtered users
      const selectAllCheckbox = screen.getByRole("checkbox", {
        name: /select all/i,
      });
      await user.click(selectAllCheckbox);

      // Step 3: Perform bulk operation
      const bulkBanButton = screen.getByRole("button", {
        name: /ban selected/i,
      });

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: 2,
              failed: 0,
              errors: [],
            }),
        })
      );

      await user.click(bulkBanButton);
      await user.click(screen.getByRole("button", { name: /confirm/i }));

      // Step 4: Clear filters and verify changes
      const clearFiltersButton = screen.getByRole("button", {
        name: /clear filters/i,
      });
      await user.click(clearFiltersButton);

      // Verify bulk operation results
      await waitFor(() => {
        expect(
          screen.getByText(/users banned successfully/i)
        ).toBeInTheDocument();
      });
    });

    it("should handle export and import workflow", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      // Step 1: Export users
      const exportButton = screen.getByRole("button", { name: /export/i });
      await user.click(exportButton);

      const csvOption = screen.getByRole("radio", { name: /csv/i });
      await user.click(csvOption);

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          blob: () =>
            Promise.resolve(new Blob(["user,data"], { type: "text/csv" })),
        })
      );

      const startExportButton = screen.getByRole("button", {
        name: /start export/i,
      });
      await user.click(startExportButton);

      // Step 2: Import users
      const importButton = screen.getByRole("button", { name: /import/i });
      await user.click(importButton);

      // Mock file upload
      const fileInput = screen.getByLabelText(/upload file/i);
      const file = new File(["name,email\nJohn,john@test.com"], "users.csv", {
        type: "text/csv",
      });

      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      });

      // Trigger file change event
      fireEvent.change(fileInput);

      // Preview import
      const previewButton = screen.getByRole("button", { name: /preview/i });

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              preview: [{ name: "John", email: "john@test.com", valid: true }],
              summary: { total: 1, valid: 1, invalid: 0 },
            }),
        })
      );

      await user.click(previewButton);

      // Confirm import
      const confirmImportButton = screen.getByRole("button", {
        name: /confirm import/i,
      });

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: 1,
              failed: 0,
              errors: [],
            }),
        })
      );

      await user.click(confirmImportButton);

      // Verify import success
      await waitFor(() => {
        expect(
          screen.getByText(/1 user imported successfully/i)
        ).toBeInTheDocument();
      });
    });

    it("should handle role assignment and permission changes workflow", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeInTheDocument();
      });

      // Step 1: Select users for role change
      const userCheckboxes = screen.getAllByRole("checkbox", {
        name: /select user/i,
      });
      await user.click(userCheckboxes[0]);
      await user.click(userCheckboxes[1]);

      // Step 2: Bulk assign role
      const bulkRoleButton = screen.getByRole("button", {
        name: /assign role/i,
      });
      await user.click(bulkRoleButton);

      const roleSelect = screen.getByRole("combobox", { name: /select role/i });
      await user.click(roleSelect);
      await user.click(screen.getByText("ADMIN"));

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: 2,
              failed: 0,
              errors: [],
            }),
        })
      );

      const confirmRoleButton = screen.getByRole("button", {
        name: /confirm/i,
      });
      await user.click(confirmRoleButton);

      // Step 3: Verify permission changes
      await waitFor(() => {
        expect(
          screen.getByText(/roles assigned successfully/i)
        ).toBeInTheDocument();
      });

      // Verify users now have admin badges
      const adminBadges = screen.getAllByText("ADMIN");
      expect(adminBadges.length).toBeGreaterThan(0);
    });
  });
});
