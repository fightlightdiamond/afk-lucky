import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { User } from "@/types/user";

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
    last_logout: null,
    avatar: null,
    role: {
      id: "role-1",
      name: "USER",
      permissions: ["read:profile", "update:profile"],
      description: "Regular user",
    },
    full_name: "John Doe",
    status: "active",
    activity_status: "offline",
  },
  {
    id: "user-2",
    email: "jane@example.com",
    first_name: "Jane",
    last_name: "Smith",
    is_active: false,
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    last_login: null,
    last_logout: null,
    avatar: null,
    role: null,
    full_name: "Jane Smith",
    status: "inactive",
    activity_status: "never",
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

// Create a simplified UserTable component for testing
const UserTable = ({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (userId: string, status: boolean) => void;
}) => (
  <table data-testid="user-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Status</th>
        <th>Last Login</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {users.map((user) => (
        <tr key={user.id} data-testid={`user-row-${user.id}`}>
          <td>{user.full_name}</td>
          <td>{user.email}</td>
          <td>
            {user.role ? (
              <div>
                <span data-testid="role-badge">{user.role.name}</span>
                {user.role.permissions.slice(0, 2).map((permission) => (
                  <span key={permission} data-testid="permission-badge">
                    {permission}
                  </span>
                ))}
                {user.role.permissions.length > 2 && (
                  <span data-testid="more-permissions">
                    +{user.role.permissions.length - 2}
                  </span>
                )}
              </div>
            ) : (
              <span data-testid="no-role">No Role</span>
            )}
          </td>
          <td>
            <span data-testid={`status-${user.status}`}>
              {user.is_active ? "Active" : "Inactive"}
            </span>
          </td>
          <td>
            {user.last_login
              ? new Date(user.last_login).toLocaleDateString()
              : "Never"}
          </td>
          <td>
            <button
              onClick={() => onEdit(user)}
              data-testid={`edit-user-${user.id}`}
            >
              Edit
            </button>
            <button
              onClick={() => onToggleStatus(user.id, user.is_active)}
              data-testid={`toggle-status-${user.id}`}
            >
              {user.is_active ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => onDelete(user.id)}
              data-testid={`delete-user-${user.id}`}
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

describe("UserTable Component", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user table with correct data", () => {
    render(
      <UserTable
        users={mockUsers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    expect(screen.getByTestId("user-table")).toBeInTheDocument();
    expect(screen.getByTestId("user-row-user-1")).toBeInTheDocument();
    expect(screen.getByTestId("user-row-user-2")).toBeInTheDocument();

    // Check user data
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("displays user roles and permissions correctly", () => {
    render(
      <UserTable
        users={mockUsers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    // User with role
    expect(screen.getByTestId("role-badge")).toHaveTextContent("USER");
    expect(screen.getAllByTestId("permission-badge")).toHaveLength(2);

    // User without role
    expect(screen.getByTestId("no-role")).toHaveTextContent("No Role");
  });

  it("displays user status correctly", () => {
    render(
      <UserTable
        users={mockUsers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    expect(screen.getByTestId("status-active")).toHaveTextContent("Active");
    expect(screen.getByTestId("status-inactive")).toHaveTextContent("Inactive");
  });

  it("displays last login information", () => {
    render(
      <UserTable
        users={mockUsers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    // User with last login
    expect(screen.getByText("1/15/2024")).toBeInTheDocument();

    // User without last login
    expect(screen.getByText("Never")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <UserTable
        users={mockUsers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    await user.click(screen.getByTestId("edit-user-user-1"));

    expect(mockOnEdit).toHaveBeenCalledWith(mockUsers[0]);
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <UserTable
        users={mockUsers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    await user.click(screen.getByTestId("delete-user-user-1"));

    expect(mockOnDelete).toHaveBeenCalledWith("user-1");
  });

  it("calls onToggleStatus when status toggle button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <UserTable
        users={mockUsers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    await user.click(screen.getByTestId("toggle-status-user-1"));

    expect(mockOnToggleStatus).toHaveBeenCalledWith("user-1", true);
  });

  it("renders empty state when no users provided", () => {
    render(
      <UserTable
        users={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    expect(screen.getByTestId("user-table")).toBeInTheDocument();
    expect(screen.queryByTestId("user-row-user-1")).not.toBeInTheDocument();
  });

  it("handles users with many permissions correctly", () => {
    const userWithManyPermissions: User = {
      ...mockUsers[0],
      role: {
        id: "role-admin",
        name: "ADMIN",
        permissions: [
          "read:users",
          "write:users",
          "delete:users",
          "manage:roles",
          "system:admin",
        ],
        description: "Administrator",
      },
    };

    render(
      <UserTable
        users={[userWithManyPermissions]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    expect(screen.getAllByTestId("permission-badge")).toHaveLength(2);
    expect(screen.getByTestId("more-permissions")).toHaveTextContent("+3");
  });
});
