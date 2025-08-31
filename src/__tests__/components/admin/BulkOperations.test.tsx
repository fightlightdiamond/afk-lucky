import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    (fetch as unknown).mockClear();
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

  describe("Accessibility", () => {
    it("should have proper ARIA attributes on action bar", () => {
      renderWithQueryClient(
        <BulkOperations
          selectedUsers={mockUsers}
          onClearSelection={mockOnClearSelection}
          availableRoles={mockRoles}
        />
      );

      // Check for toolbar role
      const toolbar = screen.getByRole("toolbar");
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveAttribute(
        "aria-label",
        "Bulk actions for 2 selected users"
      );

      // Check for group role
      const group = screen.getByRole("group");
      expect(group).toBeInTheDocument();
      expect(group).toHaveAttribute(
        "aria-describedby",
        "bulk-actions-description"
      );

      // Check for screen reader description
      const description = screen.getByText(/Bulk actions toolbar/);
      expect(description).toHaveClass("sr-only");
    });

    it("should have accessible buttons with proper labels", () => {
      renderWithQueryClient(
        <BulkOperations
          selectedUsers={mockUsers}
          onClearSelection={mockOnClearSelection}
          availableRoles={mockRoles}
        />
      );

      // Check Ban button accessibility
      const banButton = screen.getByText("Ban");
      expect(banButton).toHaveAttribute("aria-label", "Ban 2 selected users");
      expect(banButton).toHaveAttribute(
        "aria-describedby",
        "ban-action-description"
      );

      // Check Unban button accessibility
      const unbanButton = screen.getByText("Unban");
      expect(unbanButton).toHaveAttribute(
        "aria-label",
        "Unban 2 selected users"
      );
      expect(unbanButton).toHaveAttribute(
        "aria-describedby",
        "unban-action-description"
      );

      // Check More button accessibility
      const moreButton = screen.getByText("More");
      expect(moreButton).toHaveAttribute("aria-label", "More bulk actions");
      expect(moreButton).toHaveAttribute("aria-haspopup", "menu");
      expect(moreButton).toHaveAttribute("aria-expanded", "false");

      // Check Clear button accessibility
      const clearButton = screen.getByLabelText(/clear selection of 2 users/i);
      expect(clearButton).toBeInTheDocument();
    });

    it("should have live region for selection count", () => {
      renderWithQueryClient(
        <BulkOperations
          selectedUsers={mockUsers}
          onClearSelection={mockOnClearSelection}
          availableRoles={mockRoles}
        />
      );

      // Check for live region on selection count
      const selectionBadge = screen.getByText("2 selected");
      expect(selectionBadge).toHaveAttribute("aria-live", "polite");
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();

      renderWithQueryClient(
        <BulkOperations
          selectedUsers={mockUsers}
          onClearSelection={mockOnClearSelection}
          availableRoles={mockRoles}
        />
      );

      const toolbar = screen.getByRole("toolbar");

      // Test Escape key by firing keydown event directly on the toolbar
      fireEvent.keyDown(toolbar, { key: "Escape" });
      expect(mockOnClearSelection).toHaveBeenCalledTimes(1);

      // Test Tab navigation through buttons
      const banButton = screen.getByText("Ban");
      const unbanButton = screen.getByText("Unban");
      const moreButton = screen.getByText("More");

      // Focus should start on first button
      banButton.focus();
      expect(banButton).toHaveFocus();

      // Tab to next button
      await user.tab();
      await waitFor(() => {
        expect(unbanButton).toHaveFocus();
      });

      // Tab to more button
      await user.tab();
      await waitFor(() => {
        expect(moreButton).toHaveFocus();
      });
    });

    it("should open dropdown menu with proper accessibility", async () => {
      const user = userEvent.setup();

      renderWithQueryClient(
        <BulkOperations
          selectedUsers={mockUsers}
          onClearSelection={mockOnClearSelection}
          availableRoles={mockRoles}
        />
      );

      const moreButton = screen.getByText("More");

      // Open dropdown
      await user.click(moreButton);

      // Check aria-expanded is updated
      expect(moreButton).toHaveAttribute("aria-expanded", "true");

      // Check menu is present with proper role
      const menu = screen.getByRole("menu");
      expect(menu).toBeInTheDocument();
      expect(menu).toHaveAttribute(
        "aria-label",
        "Additional bulk actions for 2 selected users"
      );

      // Check menu items have proper roles
      const activateItem = screen.getByText("Activate Users");
      expect(activateItem).toBeInTheDocument();
      expect(activateItem.closest('[role="menuitem"]')).toBeInTheDocument();

      const deactivateItem = screen.getByText("Deactivate Users");
      expect(deactivateItem).toBeInTheDocument();
      expect(deactivateItem.closest('[role="menuitem"]')).toBeInTheDocument();

      const deleteItem = screen.getByText("Delete Users");
      expect(deleteItem).toBeInTheDocument();
      expect(deleteItem.closest('[role="menuitem"]')).toBeInTheDocument();
    });

    it("should have accessible role assignment options", async () => {
      const user = userEvent.setup();

      renderWithQueryClient(
        <BulkOperations
          selectedUsers={mockUsers}
          onClearSelection={mockOnClearSelection}
          availableRoles={mockRoles}
        />
      );

      const moreButton = screen.getByText("More");
      await user.click(moreButton);

      // Check role assignment group
      const roleGroup = screen.getByRole("group", {
        name: /role assignment options/i,
      });
      expect(roleGroup).toBeInTheDocument();

      // Check role menu items by text content
      const adminRoleItem = screen.getByText("ADMIN");
      expect(adminRoleItem).toBeInTheDocument();
      expect(adminRoleItem.closest('[role="menuitem"]')).toBeInTheDocument();

      const userRoleItem = screen.getByText("USER");
      expect(userRoleItem).toBeInTheDocument();
      expect(userRoleItem.closest('[role="menuitem"]')).toBeInTheDocument();
    });
  });

  describe("Dialog Accessibility", () => {
    it("should open confirmation dialog with proper accessibility", async () => {
      const user = userEvent.setup();

      renderWithQueryClient(
        <BulkOperations
          selectedUsers={mockUsers}
          onClearSelection={mockOnClearSelection}
          availableRoles={mockRoles}
        />
      );

      const banButton = screen.getByText("Ban");
      await user.click(banButton);

      // Wait for dialog to appear
      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
      });

      // Check dialog has proper title
      const dialogTitle = screen.getByRole("heading", { name: /ban users/i });
      expect(dialogTitle).toBeInTheDocument();

      // Check dialog has description
      const description = screen.getByText(/this will ban the selected users/i);
      expect(description).toBeInTheDocument();

      // Check form elements are accessible
      const reasonTextarea = screen.getByRole("textbox", { name: /reason/i });
      expect(reasonTextarea).toBeInTheDocument();
      expect(reasonTextarea).toHaveAttribute("id", "reason");

      const reasonLabel = screen.getByText("Reason");
      expect(reasonLabel).toHaveAttribute("for", "reason");

      // Check buttons are accessible
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();

      const confirmButton = screen.getByRole("button", { name: /ban users/i });
      expect(confirmButton).toBeInTheDocument();
    });

    it("should handle form validation accessibility", async () => {
      const user = userEvent.setup();

      renderWithQueryClient(
        <BulkOperations
          selectedUsers={mockUsers}
          onClearSelection={mockOnClearSelection}
          availableRoles={mockRoles}
        />
      );

      const banButton = screen.getByText("Ban");
      await user.click(banButton);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
      });

      // Check that confirm button is disabled when required field is empty
      const confirmButton = screen.getByRole("button", { name: /ban users/i });
      expect(confirmButton).toBeDisabled();

      // Fill in required field
      const reasonTextarea = screen.getByRole("textbox", { name: /reason/i });
      await user.type(reasonTextarea, "Test reason");

      // Check that confirm button is now enabled
      expect(confirmButton).toBeEnabled();
    });

    it("should handle checkbox accessibility in delete dialog", async () => {
      const user = userEvent.setup();

      renderWithQueryClient(
        <BulkOperations
          selectedUsers={mockUsers}
          onClearSelection={mockOnClearSelection}
          availableRoles={mockRoles}
        />
      );

      // Open more menu and click delete
      const moreButton = screen.getByText("More");
      await user.click(moreButton);

      const deleteItem = screen.getByText("Delete Users");
      await user.click(deleteItem);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
      });

      // Check force checkbox accessibility
      const forceCheckbox = screen.getByRole("checkbox", {
        name: /force operation/i,
      });
      expect(forceCheckbox).toBeInTheDocument();
      expect(forceCheckbox).toHaveAttribute("id", "force");

      const forceLabel = screen.getByText(/force operation/i);
      expect(forceLabel).toHaveAttribute("for", "force");
    });
  });
});
