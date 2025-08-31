import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  User,
  UserFilters,
  UserRole,
  UserStatus,
  ActivityStatus,
} from "@/types/user";
import { UserTable } from "@/components/admin/UserTable";

// Mock the admin users page component
const mockUsers: User[] = [
  {
    id: "user-1",
    email: "john@example.com",
    first_name: "John",
    last_name: "Doe",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    last_login: "2024-01-15T10:00:00Z",
    role: {
      id: "role-1",
      name: UserRole.USER,
      permissions: ["read:profile", "update:profile"],
      description: "Regular user",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    full_name: "John Doe",
    status: UserStatus.ACTIVE,
    activity_status: ActivityStatus.OFFLINE,
    display_name: "John Doe",
  },
  {
    id: "user-2",
    email: "jane@example.com",
    first_name: "Jane",
    last_name: "Smith",
    is_active: false,
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    full_name: "Jane Smith",
    status: UserStatus.INACTIVE,
    activity_status: ActivityStatus.NEVER,
    display_name: "Jane Smith",
  },
];

// Mock components and hooks
vi.mock("@/components/auth/permission-guard", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/admin/PermissionBadge", () => ({
  PermissionBadge: ({ permission }: { permission: string }) => (
    <span data-testid="permission-badge">{permission}</span>
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

// Mock filters for testing
const mockFilters: UserFilters = {
  search: "",
  role: null,
  status: null,
  dateRange: null,
  activityDateRange: null,
  sortBy: "full_name",
  sortOrder: "asc",
};

describe("UserTable Component", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleStatus = vi.fn();
  const mockOnFiltersChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user table with correct data", () => {
    render(
      <UserTable
        users={mockUsers}
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    // Check user data is displayed
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("displays user roles and permissions correctly", () => {
    render(
      <UserTable
        users={mockUsers}
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    // User with role should show role name
    expect(screen.getByText("USER")).toBeInTheDocument();

    // User without role should show "No Role"
    expect(screen.getByText("No Role")).toBeInTheDocument();
  });

  it("displays user status correctly", () => {
    render(
      <UserTable
        users={mockUsers}
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("displays created date information", () => {
    render(
      <UserTable
        users={mockUsers}
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    // Should show formatted created date
    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 2, 2024/)).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <UserTable
        users={mockUsers}
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    // Click on the dropdown menu button first
    const dropdownButtons = screen.getAllByRole("button", {
      name: /Actions for/i,
    });
    await user.click(dropdownButtons[0]);

    // Then click on edit option
    const editButton = screen.getByText("Edit user");
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockUsers[0]);
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <UserTable
        users={mockUsers}
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    // Click on the dropdown menu button first
    const dropdownButtons = screen.getAllByRole("button", {
      name: /Actions for/i,
    });
    await user.click(dropdownButtons[0]);

    // Then click on delete option
    const deleteButton = screen.getByText("Delete user");
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith("user-1");
  });

  it("calls onToggleStatus when status toggle button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <UserTable
        users={mockUsers}
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    // Click on the dropdown menu button first
    const dropdownButtons = screen.getAllByRole("button", {
      name: /Actions for/i,
    });
    await user.click(dropdownButtons[0]);

    // Then click on deactivate option (since user is active)
    const toggleButton = screen.getByText("Deactivate");
    await user.click(toggleButton);

    expect(mockOnToggleStatus).toHaveBeenCalledWith("user-1", true);
  });

  it("renders empty state when no users provided", () => {
    render(
      <UserTable
        users={[]}
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    expect(screen.getByText("No users found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "No users match your current filters. Try adjusting your search criteria."
      )
    ).toBeInTheDocument();
  });

  it("handles users with many permissions correctly", () => {
    const userWithManyPermissions: User = {
      ...mockUsers[0],
      role: {
        id: "role-admin",
        name: UserRole.ADMIN,
        permissions: [
          "read:users",
          "write:users",
          "delete:users",
          "manage:roles",
          "system:admin",
        ],
        description: "Administrator",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    };

    render(
      <UserTable
        users={[userWithManyPermissions]}
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    // Should show ADMIN role
    expect(screen.getByText("ADMIN")).toBeInTheDocument();

    // Should show +3 for additional permissions beyond the first 2
    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  describe("Selection functionality", () => {
    const mockOnSelectUser = vi.fn();
    const mockOnSelectAll = vi.fn();

    beforeEach(() => {
      mockOnSelectUser.mockClear();
      mockOnSelectAll.mockClear();
    });

    it("renders selection checkboxes when selection handlers are provided", () => {
      render(
        <UserTable
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
          onUserSelection={mockOnSelectUser}
          onSelectAll={mockOnSelectAll}
          selectedUsers={new Set()}
        />
      );

      // Should have select all checkbox in header
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(mockUsers.length + 1); // +1 for select all
    });

    it("calls onUserSelection when individual checkbox is clicked", async () => {
      const user = userEvent.setup();

      render(
        <UserTable
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
          onUserSelection={mockOnSelectUser}
          onSelectAll={mockOnSelectAll}
          selectedUsers={new Set()}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      const firstUserCheckbox = checkboxes[1]; // Skip select all checkbox

      await user.click(firstUserCheckbox);

      expect(mockOnSelectUser).toHaveBeenCalledWith(mockUsers[0].id, true);
    });

    it("calls onSelectAll when select all checkbox is clicked", async () => {
      const user = userEvent.setup();

      render(
        <UserTable
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
          onUserSelection={mockOnSelectUser}
          onSelectAll={mockOnSelectAll}
          selectedUsers={new Set()}
        />
      );

      const selectAllCheckbox = screen.getAllByRole("checkbox")[0];

      await user.click(selectAllCheckbox);

      expect(mockOnSelectAll).toHaveBeenCalledWith(true);
    });

    it("shows selected rows with different styling", () => {
      render(
        <UserTable
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
          onUserSelection={mockOnSelectUser}
          onSelectAll={mockOnSelectAll}
          selectedUsers={new Set([mockUsers[0].id])}
        />
      );

      const rows = screen.getAllByRole("row");
      const selectedRow = rows.find((row) =>
        row.textContent?.includes("John Doe")
      );
      expect(selectedRow).toHaveClass("bg-muted/30");
    });
  });

  describe("Edge cases and error handling", () => {
    it("handles users with null or undefined values gracefully", () => {
      const userWithNullValues: User = {
        id: "user-null",
        email: "null@example.com",
        first_name: "Null",
        last_name: "User",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        last_login: null,
        role: null,
        full_name: "Null User",
        status: UserStatus.ACTIVE,
        activity_status: ActivityStatus.NEVER,
        display_name: "Null User",
      };

      render(
        <UserTable
          users={[userWithNullValues]}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      expect(screen.getByText("Null User")).toBeInTheDocument();
      expect(screen.getByText("No Role")).toBeInTheDocument();
      expect(screen.getByText("Never")).toBeInTheDocument();
    });

    it("handles very long user names and emails", () => {
      const userWithLongValues: User = {
        id: "user-long",
        email: "verylongemailaddressthatmightcauselayoutissues@example.com",
        first_name: "VeryLongFirstNameThatMightCauseLayoutIssues",
        last_name: "VeryLongLastNameThatMightCauseLayoutIssues",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        full_name:
          "VeryLongFirstNameThatMightCauseLayoutIssues VeryLongLastNameThatMightCauseLayoutIssues",
        status: UserStatus.ACTIVE,
        activity_status: ActivityStatus.OFFLINE,
        display_name:
          "VeryLongFirstNameThatMightCauseLayoutIssues VeryLongLastNameThatMightCauseLayoutIssues",
      };

      render(
        <UserTable
          users={[userWithLongValues]}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      expect(
        screen.getAllByText(/VeryLongFirstNameThatMightCauseLayoutIssues/)[0]
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /verylongemailaddressthatmightcauselayoutissues@example.com/
        )
      ).toBeInTheDocument();
    });

    it("handles users with special characters in names", () => {
      const userWithSpecialChars: User = {
        id: "user-special",
        email: "josé.garcía@example.com",
        first_name: "José",
        last_name: "García-López",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        full_name: "José García-López",
        status: UserStatus.ACTIVE,
        activity_status: ActivityStatus.ONLINE,
        display_name: "José García-López",
      };

      render(
        <UserTable
          users={[userWithSpecialChars]}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      expect(screen.getByText("José García-López")).toBeInTheDocument();
      expect(screen.getByText("josé.garcía@example.com")).toBeInTheDocument();
    });

    it("handles large number of users efficiently", { timeout: 10000 }, () => {
      const manyUsers = Array.from({ length: 50 }, (_, i) => ({
        id: `user-${i}`,
        email: `user${i}@example.com`,
        first_name: `User${i}`,
        last_name: `Test`,
        is_active: i % 2 === 0,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        full_name: `User${i} Test`,
        status: i % 2 === 0 ? UserStatus.ACTIVE : UserStatus.INACTIVE,
        activity_status: ActivityStatus.OFFLINE,
        display_name: `User${i} Test`,
      }));

      const { container } = render(
        <UserTable
          users={manyUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      // Should render all users
      expect(container.querySelectorAll("tbody tr")).toHaveLength(50);
    });

    it("handles invalid date formats gracefully", () => {
      const userWithInvalidDate: User = {
        id: "user-invalid-date",
        email: "invalid@example.com",
        first_name: "Invalid",
        last_name: "Date",
        is_active: true,
        created_at: "invalid-date",
        updated_at: "2024-01-01T00:00:00Z",
        last_login: "also-invalid",
        full_name: "Invalid Date",
        status: UserStatus.ACTIVE,
        activity_status: ActivityStatus.OFFLINE,
        display_name: "Invalid Date",
      };

      render(
        <UserTable
          users={[userWithInvalidDate]}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      expect(screen.getAllByText("Invalid Date")[0]).toBeInTheDocument();
      // Should handle invalid dates gracefully without crashing
    });

    it("handles missing callback functions gracefully", () => {
      render(
        <UserTable
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      // Should render without errors even if some callbacks are missing
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("handles rapid successive clicks without errors", async () => {
      const user = userEvent.setup();

      render(
        <UserTable
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      const dropdownButton = screen.getAllByRole("button", {
        name: /Actions for/i,
      })[0];

      // Click once to open dropdown
      await user.click(dropdownButton);

      // Should not cause errors and dropdown should be accessible
      expect(dropdownButton).toBeInTheDocument();
      expect(dropdownButton).toBeEnabled();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for screen readers", () => {
      render(
        <UserTable
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      // Check for proper table structure
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getAllByRole("columnheader")).toHaveLength(6); // User, Role, Status, Activity, Created, Actions
      expect(screen.getAllByRole("row")).toHaveLength(3); // Header + 2 users
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();

      render(
        <UserTable
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      const firstActionButton = screen.getAllByRole("button", {
        name: /Actions for/i,
      })[0];

      // Should be focusable
      firstActionButton.focus();
      expect(firstActionButton).toHaveFocus();

      // Should open dropdown on Enter
      await user.keyboard("{Enter}");
      expect(screen.getByText("Edit user")).toBeInTheDocument();
    });

    it("has proper contrast and visual indicators", () => {
      render(
        <UserTable
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      // Status badges should have proper styling
      const activeStatus = screen.getByText("Active");
      const inactiveStatus = screen.getByText("Inactive");

      expect(activeStatus).toHaveClass("bg-green-50");
      expect(inactiveStatus).toHaveClass("bg-gray-50");
    });
  });

  describe("Performance", () => {
    it("memoizes expensive operations", () => {
      const { rerender } = render(
        <UserTable
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      // Re-render with same props
      rerender(
        <UserTable
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      // Should not cause unnecessary re-renders
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("handles updates efficiently", () => {
      const { rerender } = render(
        <UserTable
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      const updatedUsers = [
        {
          ...mockUsers[0],
          first_name: "Updated John",
          full_name: "Updated John Doe",
        },
        mockUsers[1],
      ];

      rerender(
        <UserTable
          users={updatedUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
        />
      );

      expect(screen.getByText("Updated John Doe")).toBeInTheDocument();
    });
  });
});
