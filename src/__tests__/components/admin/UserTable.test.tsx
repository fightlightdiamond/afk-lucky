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
      name: /open menu/i,
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
      name: /open menu/i,
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
      name: /open menu/i,
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
      screen.getByText("Try adjusting your search or filter criteria")
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
          onSelectUser={mockOnSelectUser}
          onSelectAll={mockOnSelectAll}
          selectedUsers={[]}
        />
      );

      // Should have select all checkbox in header
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(mockUsers.length + 1); // +1 for select all
    });

    it("calls onSelectUser when individual checkbox is clicked", async () => {
      const user = userEvent.setup();

      render(
        <UserTable
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleStatus={mockOnToggleStatus}
          onSelectUser={mockOnSelectUser}
          onSelectAll={mockOnSelectAll}
          selectedUsers={[]}
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
          onSelectUser={mockOnSelectUser}
          onSelectAll={mockOnSelectAll}
          selectedUsers={[]}
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
          onSelectUser={mockOnSelectUser}
          onSelectAll={mockOnSelectAll}
          selectedUsers={[mockUsers[0].id]}
        />
      );

      const rows = screen.getAllByRole("row");
      const selectedRow = rows.find((row) =>
        row.textContent?.includes("John Doe")
      );
      expect(selectedRow).toHaveClass("bg-muted/30");
    });
  });
});
