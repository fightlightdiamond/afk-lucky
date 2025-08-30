import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { BulkOperationType, Role } from "@/types/user";

// Mock the accessibility module
vi.mock("@/lib/accessibility", () => ({
  ariaLabels: {
    bulkAction: (action: string, count: number) =>
      `${action} ${count} selected user${count === 1 ? "" : "s"}`,
  },
  focusManagement: {},
  keyboardNavigation: {},
}));

const mockRoles: Role[] = [
  {
    id: "role-1",
    name: "ADMIN",
    permissions: ["manage:users", "manage:roles"],
    description: "Administrator role",
  },
  {
    id: "role-2",
    name: "USER",
    permissions: ["read:profile"],
    description: "Regular user role",
  },
];

describe("BulkActionBar", () => {
  const mockOnClearSelection = vi.fn();
  const mockOnBulkOperation = vi.fn();
  const user = userEvent.setup();

  const defaultProps = {
    selectedCount: 3,
    onClearSelection: mockOnClearSelection,
    onBulkOperation: mockOnBulkOperation,
    availableRoles: mockRoles,
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should not render when selectedCount is 0", () => {
    render(<BulkActionBar {...defaultProps} selectedCount={0} />);

    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });

  it("should render with correct selection count", () => {
    render(<BulkActionBar {...defaultProps} />);

    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getByText("3 selected")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Bulk actions for 3 selected users/)
    ).toBeInTheDocument();
  });

  it("should render singular text for single selection", () => {
    render(<BulkActionBar {...defaultProps} selectedCount={1} />);

    expect(screen.getByText("1 selected")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Bulk actions for 1 selected user$/)
    ).toBeInTheDocument();
  });

  it("should call onClearSelection when clear button is clicked", async () => {
    render(<BulkActionBar {...defaultProps} />);

    const clearButton = screen.getByLabelText(/Clear selection of 3 users/);
    await user.click(clearButton);

    expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
  });

  it("should call onBulkOperation when ban button is clicked", async () => {
    render(<BulkActionBar {...defaultProps} />);

    const banButton = screen.getByRole("button", {
      name: /Ban 3 selected users/,
    });
    await user.click(banButton);

    expect(mockOnBulkOperation).toHaveBeenCalledWith("ban", undefined);
  });

  it("should call onBulkOperation when unban button is clicked", async () => {
    render(<BulkActionBar {...defaultProps} />);

    const unbanButton = screen.getByRole("button", {
      name: /Unban 3 selected users/,
    });
    await user.click(unbanButton);

    expect(mockOnBulkOperation).toHaveBeenCalledWith("unban", undefined);
  });

  it("should open dropdown menu when More button is clicked", async () => {
    render(<BulkActionBar {...defaultProps} />);

    const moreButton = screen.getByRole("button", {
      name: "More bulk actions",
    });
    await user.click(moreButton);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /Activate 3 selected users/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /Deactivate 3 selected users/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /Delete 3 selected users/ })
    ).toBeInTheDocument();
  });

  it("should show role assignment options in dropdown", async () => {
    render(<BulkActionBar {...defaultProps} />);

    const moreButton = screen.getByRole("button", {
      name: "More bulk actions",
    });
    await user.click(moreButton);

    expect(screen.getByText("Assign Role")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /Assign ADMIN role/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /Assign USER role/ })
    ).toBeInTheDocument();
  });

  it("should call onBulkOperation with role id when role is selected", async () => {
    render(<BulkActionBar {...defaultProps} />);

    const moreButton = screen.getByRole("button", {
      name: "More bulk actions",
    });
    await user.click(moreButton);

    const adminRoleOption = screen.getByRole("menuitem", {
      name: /Assign ADMIN role/,
    });
    await user.click(adminRoleOption);

    expect(mockOnBulkOperation).toHaveBeenCalledWith("assign_role", "role-1");
  });

  it("should call onBulkOperation for activate action", async () => {
    render(<BulkActionBar {...defaultProps} />);

    const moreButton = screen.getByRole("button", {
      name: "More bulk actions",
    });
    await user.click(moreButton);

    const activateOption = screen.getByRole("menuitem", {
      name: /Activate 3 selected users/,
    });
    await user.click(activateOption);

    expect(mockOnBulkOperation).toHaveBeenCalledWith("activate", undefined);
  });

  it("should call onBulkOperation for deactivate action", async () => {
    render(<BulkActionBar {...defaultProps} />);

    const moreButton = screen.getByRole("button", {
      name: "More bulk actions",
    });
    await user.click(moreButton);

    const deactivateOption = screen.getByRole("menuitem", {
      name: /Deactivate 3 selected users/,
    });
    await user.click(deactivateOption);

    expect(mockOnBulkOperation).toHaveBeenCalledWith("deactivate", undefined);
  });

  it("should call onBulkOperation for delete action", async () => {
    render(<BulkActionBar {...defaultProps} />);

    const moreButton = screen.getByRole("button", {
      name: "More bulk actions",
    });
    await user.click(moreButton);

    const deleteOption = screen.getByRole("menuitem", {
      name: /Delete 3 selected users/,
    });
    await user.click(deleteOption);

    expect(mockOnBulkOperation).toHaveBeenCalledWith("delete", undefined);
  });

  it("should disable all buttons when disabled prop is true", () => {
    render(<BulkActionBar {...defaultProps} disabled={true} />);

    const banButton = screen.getByRole("button", {
      name: /Ban 3 selected users/,
    });
    const unbanButton = screen.getByRole("button", {
      name: /Unban 3 selected users/,
    });
    const moreButton = screen.getByRole("button", {
      name: "More bulk actions",
    });
    const clearButton = screen.getByLabelText(/Clear selection of 3 users/);

    expect(banButton).toBeDisabled();
    expect(unbanButton).toBeDisabled();
    expect(moreButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("should handle keyboard navigation with Escape key", async () => {
    render(<BulkActionBar {...defaultProps} />);

    const toolbar = screen.getByRole("toolbar");
    fireEvent.keyDown(toolbar, { key: "Escape" });

    expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
  });

  it("should not show role assignment section when no roles available", async () => {
    render(<BulkActionBar {...defaultProps} availableRoles={[]} />);

    const moreButton = screen.getByRole("button", {
      name: "More bulk actions",
    });
    await user.click(moreButton);

    expect(screen.queryByText("Assign Role")).not.toBeInTheDocument();
  });

  it("should close dropdown after selecting an action", async () => {
    render(<BulkActionBar {...defaultProps} />);

    const moreButton = screen.getByRole("button", {
      name: "More bulk actions",
    });
    await user.click(moreButton);

    expect(screen.getByRole("menu")).toBeInTheDocument();

    const activateOption = screen.getByRole("menuitem", {
      name: /Activate 3 selected users/,
    });
    await user.click(activateOption);

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("should have proper ARIA attributes", () => {
    render(<BulkActionBar {...defaultProps} />);

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveAttribute(
      "aria-label",
      "Bulk actions for 3 selected users"
    );

    const group = screen.getByRole("group");
    expect(group).toHaveAttribute(
      "aria-describedby",
      "bulk-actions-description"
    );

    const badge = screen.getByText("3 selected");
    expect(badge).toHaveAttribute("aria-live", "polite");
  });

  it("should adapt layout for mobile screens", () => {
    // Mock mobile screen width
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 600,
    });

    render(<BulkActionBar {...defaultProps} />);

    // Trigger resize event
    fireEvent(window, new Event("resize"));

    // The component should still render (mobile-specific styling is handled via CSS classes)
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });

  it("should focus first button when component appears", async () => {
    const { rerender } = render(
      <BulkActionBar {...defaultProps} selectedCount={0} />
    );

    // Initially no toolbar
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();

    // Show toolbar
    rerender(<BulkActionBar {...defaultProps} selectedCount={3} />);

    // Wait for focus to be set
    await waitFor(
      () => {
        const banButton = screen.getByRole("button", {
          name: /Ban 3 selected users/,
        });
        expect(banButton).toHaveFocus();
      },
      { timeout: 200 }
    );
  });

  it("should include screen reader descriptions for actions", () => {
    render(<BulkActionBar {...defaultProps} />);

    expect(
      screen.getByText(/This will ban 3 selected users/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This will unban 3 selected users/)
    ).toBeInTheDocument();
  });

  it("should handle window resize events", () => {
    render(<BulkActionBar {...defaultProps} />);

    // Change window size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    fireEvent(window, new Event("resize"));

    // Component should still be rendered
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });
});
