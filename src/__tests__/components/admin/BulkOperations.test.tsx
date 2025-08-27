import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BulkOperations } from "@/components/admin/BulkOperations";
import { User, Role, UserRole, UserStatus, ActivityStatus } from "@/types/user";

import { vi } from "vitest";

// Mock the toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

const mockRoles: Role[] = [
  {
    id: "1",
    name: UserRole.ADMIN,
    description: "Administrator role",
    permissions: ["read", "write", "delete"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: UserRole.USER,
    description: "Regular user role",
    permissions: ["read"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const mockUsers: User[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    full_name: "John Doe",
    display_name: "John Doe",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: UserStatus.ACTIVE,
    activity_status: ActivityStatus.ONLINE,
    role: mockRoles[0],
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    first_name: "Jane",
    last_name: "Smith",
    full_name: "Jane Smith",
    display_name: "Jane Smith",
    is_active: true,
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    status: UserStatus.ACTIVE,
    activity_status: ActivityStatus.OFFLINE,
    role: mockRoles[1],
  },
];

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe("BulkOperations", () => {
  const mockOnClearSelection = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockClear();
  });

  it("should not render action bar when no users are selected", () => {
    renderWithQueryClient(
      <BulkOperations
        selectedUsers={[]}
        onClearSelection={mockOnClearSelection}
        availableRoles={mockRoles}
      />
    );

    expect(screen.queryByText("selected")).not.toBeInTheDocument();
  });

  it("should render action bar when users are selected", () => {
    renderWithQueryClient(
      <BulkOperations
        selectedUsers={mockUsers}
        onClearSelection={mockOnClearSelection}
        availableRoles={mockRoles}
      />
    );

    expect(screen.getByText("2 selected")).toBeInTheDocument();
    expect(screen.getByText("Ban")).toBeInTheDocument();
    expect(screen.getByText("Unban")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("should call onClearSelection when clear button is clicked", () => {
    renderWithQueryClient(
      <BulkOperations
        selectedUsers={mockUsers}
        onClearSelection={mockOnClearSelection}
        availableRoles={mockRoles}
      />
    );

    // The clear button is the one with the X icon (last button)
    const buttons = screen.getAllByRole("button");
    const clearButton = buttons[buttons.length - 1]; // Last button is the clear button
    fireEvent.click(clearButton);

    expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
  });

  it("should open confirmation dialog when ban button is clicked", async () => {
    renderWithQueryClient(
      <BulkOperations
        selectedUsers={mockUsers}
        onClearSelection={mockOnClearSelection}
        availableRoles={mockRoles}
      />
    );

    const banButton = screen.getByText("Ban");
    fireEvent.click(banButton);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("should render more button for additional actions", () => {
    renderWithQueryClient(
      <BulkOperations
        selectedUsers={mockUsers}
        onClearSelection={mockOnClearSelection}
        availableRoles={mockRoles}
      />
    );

    const moreButton = screen.getByText("More");
    expect(moreButton).toBeInTheDocument();
    expect(moreButton).toHaveAttribute("aria-haspopup", "menu");
  });

  it("should disable buttons when disabled prop is true", () => {
    renderWithQueryClient(
      <BulkOperations
        selectedUsers={mockUsers}
        onClearSelection={mockOnClearSelection}
        availableRoles={mockRoles}
        disabled={true}
      />
    );

    const banButton = screen.getByText("Ban");
    const unbanButton = screen.getByText("Unban");
    const moreButton = screen.getByText("More");

    expect(banButton).toBeDisabled();
    expect(unbanButton).toBeDisabled();
    expect(moreButton).toBeDisabled();
  });

  it("should have correct props passed to components", () => {
    renderWithQueryClient(
      <BulkOperations
        selectedUsers={mockUsers}
        onClearSelection={mockOnClearSelection}
        availableRoles={mockRoles}
        disabled={false}
        onSuccess={mockOnSuccess}
      />
    );

    // Verify the component renders with correct user count
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    // Verify action buttons are present
    expect(screen.getByText("Ban")).toBeInTheDocument();
    expect(screen.getByText("Unban")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("should render with available roles", () => {
    renderWithQueryClient(
      <BulkOperations
        selectedUsers={mockUsers}
        onClearSelection={mockOnClearSelection}
        availableRoles={mockRoles}
      />
    );

    // Component should render successfully with roles
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    // Should have the More dropdown for additional actions
    expect(screen.getByText("More")).toBeInTheDocument();
  });
});
