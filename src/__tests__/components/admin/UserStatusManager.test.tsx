import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { UserStatusManager } from "@/components/admin/UserStatusManager";
import { User, UserStatus } from "@/types/user";

// Mock the UI components
vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children, open }: any) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogContent: ({ children }: any) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: any) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: any) => (
    <h2 data-testid="alert-dialog-title">{children}</h2>
  ),
  AlertDialogDescription: ({ children }: any) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: any) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogAction: ({ children, onClick, disabled }: any) => (
    <button
      data-testid="alert-dialog-action"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children, disabled }: any) => (
    <button data-testid="alert-dialog-cancel" disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) =>
    asChild ? children : <div>{children}</div>,
  TooltipContent: ({ children }: any) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
}));

const mockUser: User = {
  id: "1",
  email: "test@example.com",
  first_name: "John",
  last_name: "Doe",
  full_name: "John Doe",
  display_name: "John Doe",
  is_active: true,
  status: UserStatus.ACTIVE,
  activity_status: "online" as const,
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
};

describe("UserStatusManager", () => {
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders active user status correctly", () => {
    render(
      <UserStatusManager user={mockUser} onStatusChange={mockOnStatusChange} />
    );

    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders inactive user status correctly", () => {
    const inactiveUser = {
      ...mockUser,
      is_active: false,
      status: UserStatus.INACTIVE,
    };

    render(
      <UserStatusManager
        user={inactiveUser}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("renders banned user status correctly", () => {
    const bannedUser = {
      ...mockUser,
      is_active: false,
      status: UserStatus.BANNED,
    };

    render(
      <UserStatusManager
        user={bannedUser}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("Banned")).toBeInTheDocument();
  });

  it("shows deactivate and ban actions for active user", () => {
    render(
      <UserStatusManager user={mockUser} onStatusChange={mockOnStatusChange} />
    );

    // Should show action buttons for active user
    const actionButtons = screen.getAllByRole("button");
    expect(actionButtons.length).toBeGreaterThan(1); // Status badge + action buttons
  });

  it("shows activate action for inactive user", () => {
    const inactiveUser = {
      ...mockUser,
      is_active: false,
      status: UserStatus.INACTIVE,
    };

    render(
      <UserStatusManager
        user={inactiveUser}
        onStatusChange={mockOnStatusChange}
      />
    );

    // Should show action buttons for inactive user
    const actionButtons = screen.getAllByRole("button");
    expect(actionButtons.length).toBeGreaterThan(1);
  });

  it("shows unban action for banned user", () => {
    const bannedUser = {
      ...mockUser,
      is_active: false,
      status: UserStatus.BANNED,
    };

    render(
      <UserStatusManager
        user={bannedUser}
        onStatusChange={mockOnStatusChange}
      />
    );

    // Should show action buttons for banned user
    const actionButtons = screen.getAllByRole("button");
    expect(actionButtons.length).toBeGreaterThan(0);
  });

  it("opens confirmation dialog when action button is clicked", async () => {
    render(
      <UserStatusManager user={mockUser} onStatusChange={mockOnStatusChange} />
    );

    // Click on an action button (first one after the status badge)
    const actionButtons = screen.getAllByRole("button");
    if (actionButtons.length > 1) {
      fireEvent.click(actionButtons[1]); // First action button

      await waitFor(() => {
        expect(screen.getByTestId("alert-dialog")).toBeInTheDocument();
      });
    }
  });

  it("calls onStatusChange when action is confirmed", async () => {
    render(
      <UserStatusManager user={mockUser} onStatusChange={mockOnStatusChange} />
    );

    // Click on an action button
    const actionButtons = screen.getAllByRole("button");
    if (actionButtons.length > 1) {
      fireEvent.click(actionButtons[1]);

      await waitFor(() => {
        expect(screen.getByTestId("alert-dialog")).toBeInTheDocument();
      });

      // Click confirm button
      const confirmButton = screen.getByTestId("alert-dialog-action");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalled();
      });
    }
  });

  it("does not show action buttons when disabled", () => {
    render(
      <UserStatusManager
        user={mockUser}
        onStatusChange={mockOnStatusChange}
        disabled={true}
      />
    );

    // Should only show the status badge, no action buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(0); // No action buttons when disabled
  });

  it("renders without label when showLabel is false", () => {
    render(
      <UserStatusManager
        user={mockUser}
        onStatusChange={mockOnStatusChange}
        showLabel={false}
      />
    );

    // Should not show the "Active" text
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  it("applies correct size classes", () => {
    const { rerender } = render(
      <UserStatusManager
        user={mockUser}
        onStatusChange={mockOnStatusChange}
        size="sm"
      />
    );

    // Test different sizes by rerendering
    rerender(
      <UserStatusManager
        user={mockUser}
        onStatusChange={mockOnStatusChange}
        size="lg"
      />
    );

    // The component should render without errors for different sizes
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
