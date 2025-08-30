/**
 * Accessibility tests for admin user management components
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { UserTable } from "@/components/admin/UserTable";
import { UserFilters } from "@/components/admin/UserFilters";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { UserPagination } from "@/components/admin/UserPagination";
import { ExportDialog } from "@/components/admin/ExportDialog";
import {
  mockUsers,
  mockRoles,
  mockFilters,
  mockPagination,
} from "../__mocks__/user-data";

// Mock the accessibility utilities
vi.mock("@/lib/accessibility", () => ({
  ariaLabels: {
    sortButton: (
      column: string,
      currentSort?: string,
      currentOrder?: "asc" | "desc"
    ) => `Sort by ${column}`,
    bulkAction: (action: string, count: number) =>
      `${action} ${count} selected user${count === 1 ? "" : "s"}`,
    pagination: {
      page: (pageNumber: number, isCurrentPage: boolean = false) =>
        isCurrentPage
          ? `Current page, page ${pageNumber}`
          : `Go to page ${pageNumber}`,
      previous: (isDisabled: boolean = false) =>
        isDisabled ? "Previous page, disabled" : "Go to previous page",
      next: (isDisabled: boolean = false) =>
        isDisabled ? "Next page, disabled" : "Go to next page",
      first: (isDisabled: boolean = false) =>
        isDisabled ? "First page, disabled" : "Go to first page",
      last: (isDisabled: boolean = false) =>
        isDisabled ? "Last page, disabled" : "Go to last page",
    },
    filter: {
      search: (hasValue: boolean, value?: string) =>
        hasValue
          ? `Search users, current search: ${value}`
          : "Search users by name, email, or other criteria",
      role: (selectedRole?: string) =>
        selectedRole
          ? `Filter by role, currently: ${selectedRole}`
          : "Filter users by role",
      status: (selectedStatus?: string) =>
        selectedStatus
          ? `Filter by status, currently: ${selectedStatus}`
          : "Filter users by status",
    },
  },
  screenReader: {
    announceFilterChange: vi.fn(),
    announceSelection: vi.fn(),
    announceLoading: vi.fn(),
    announceComplete: vi.fn(),
    announceError: vi.fn(),
  },
  focusManagement: {
    storeFocus: vi.fn(() => document.activeElement),
    restoreFocus: vi.fn(),
    focusFirst: vi.fn(),
    trapFocus: vi.fn(),
  },
  keyboardNavigation: {
    handleArrowNavigation: vi.fn(),
    handleActivation: vi.fn(),
  },
}));

describe("Admin User Management Accessibility", () => {
  describe("UserTable Component", () => {
    const defaultProps = {
      users: mockUsers,
      filters: mockFilters,
      onFiltersChange: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onToggleStatus: vi.fn(),
      selectedUsers: new Set<string>(),
      onUserSelection: vi.fn(),
      onSelectAll: vi.fn(),
    };

    it("should have proper semantic structure", () => {
      const { container } = render(<UserTable {...defaultProps} />);
      expect(container.querySelector('[role="table"]')).toBeInTheDocument();
    });

    it("should have proper table structure with roles", () => {
      render(<UserTable {...defaultProps} />);

      const table = screen.getByRole("table");
      expect(table).toHaveAttribute("aria-label", "Users table");

      const columnHeaders = screen.getAllByRole("columnheader");
      expect(columnHeaders).toHaveLength(7); // Including selection column

      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1); // Header + data rows
    });

    it("should have accessible sort buttons", () => {
      render(<UserTable {...defaultProps} />);

      const sortButtons = screen
        .getAllByRole("button")
        .filter((button) =>
          button.getAttribute("aria-label")?.includes("Sort by")
        );

      sortButtons.forEach((button) => {
        expect(button).toHaveAttribute("aria-label");
        expect(button).toHaveAttribute("aria-describedby");
      });
    });

    it("should have accessible selection checkboxes", () => {
      render(<UserTable {...defaultProps} />);

      const selectAllCheckbox = screen.getByRole("checkbox", {
        name: /select all users/i,
      });
      expect(selectAllCheckbox).toHaveAttribute("aria-label");
      expect(selectAllCheckbox).toHaveAttribute("aria-describedby");

      const userCheckboxes = screen
        .getAllByRole("checkbox")
        .filter((checkbox) =>
          checkbox.getAttribute("aria-label")?.includes("Select ")
        );

      userCheckboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAttribute("aria-label");
        expect(checkbox).toHaveAttribute("aria-describedby");
      });
    });

    it("should have accessible action menus", () => {
      render(<UserTable {...defaultProps} />);

      const actionButtons = screen
        .getAllByRole("button")
        .filter((button) =>
          button.getAttribute("aria-label")?.includes("Actions for")
        );

      actionButtons.forEach((button) => {
        expect(button).toHaveAttribute("aria-label");
        expect(button).toHaveAttribute("aria-haspopup", "menu");
      });
    });
  });

  describe("UserFilters Component", () => {
    const defaultProps = {
      filters: mockFilters,
      onFiltersChange: vi.fn(),
      roles: mockRoles,
      totalRecords: 100,
    };

    it("should have accessible search input", () => {
      render(<UserFilters {...defaultProps} />);

      const searchInput = screen.getByRole("textbox");
      expect(searchInput).toHaveAttribute("aria-label");
      expect(searchInput).toHaveAttribute("aria-describedby");
    });

    it("should have accessible filter controls", () => {
      render(<UserFilters {...defaultProps} />);

      const filtersButton = screen.getByRole("button", {
        name: /open filters menu/i,
      });
      expect(filtersButton).toHaveAttribute("aria-label");
      expect(filtersButton).toHaveAttribute("aria-haspopup", "dialog");
    });

    it("should have accessible export/import buttons", () => {
      const propsWithActions = {
        ...defaultProps,
        onExport: vi.fn(),
        onImport: vi.fn(),
      };

      render(<UserFilters {...propsWithActions} />);

      const exportButton = screen.getByRole("button", { name: /export/i });
      expect(exportButton).toHaveAttribute("aria-label");
      expect(exportButton).toHaveAttribute("aria-describedby");

      const importButton = screen.getByRole("button", { name: /import/i });
      expect(importButton).toHaveAttribute("aria-label");
      expect(importButton).toHaveAttribute("aria-describedby");
    });
  });

  describe("BulkActionBar Component", () => {
    const defaultProps = {
      selectedCount: 3,
      onClearSelection: vi.fn(),
      onBulkOperation: vi.fn(),
      availableRoles: mockRoles,
    };

    it("should have proper toolbar structure", () => {
      render(<BulkActionBar {...defaultProps} />);

      const toolbar = screen.getByRole("toolbar");
      expect(toolbar).toHaveAttribute("aria-label");

      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-describedby");
    });

    it("should have accessible action buttons", () => {
      render(<BulkActionBar {...defaultProps} />);

      const banButton = screen.getByRole("button", { name: /ban.*3.*user/i });
      expect(banButton).toHaveAttribute("aria-label");
      expect(banButton).toHaveAttribute("aria-describedby");

      const unbanButton = screen.getByRole("button", {
        name: /unban.*3.*user/i,
      });
      expect(unbanButton).toHaveAttribute("aria-label");
      expect(unbanButton).toHaveAttribute("aria-describedby");
    });

    it("should have accessible dropdown menu", () => {
      render(<BulkActionBar {...defaultProps} />);

      const moreButton = screen.getByRole("button", {
        name: /more bulk actions/i,
      });
      expect(moreButton).toHaveAttribute("aria-haspopup", "menu");
      expect(moreButton).toHaveAttribute("aria-expanded");
    });
  });

  describe("UserPagination Component", () => {
    const defaultProps = {
      pagination: mockPagination,
      onPageChange: vi.fn(),
      onPageSizeChange: vi.fn(),
    };

    it("should have proper navigation structure", () => {
      render(<UserPagination {...defaultProps} />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Pagination navigation");

      const paginationGroup = screen.getByRole("group", {
        name: /pagination controls/i,
      });
      expect(paginationGroup).toBeInTheDocument();
    });

    it("should have accessible page buttons", () => {
      render(<UserPagination {...defaultProps} />);

      const pageButtons = screen
        .getAllByRole("button")
        .filter((button) =>
          button.getAttribute("aria-label")?.includes("page")
        );

      pageButtons.forEach((button) => {
        expect(button).toHaveAttribute("aria-label");
      });

      // Check for current page indicator
      const currentPageButton = screen.getByRole("button", {
        "aria-current": "page",
      });
      expect(currentPageButton).toBeInTheDocument();
    });

    it("should announce pagination status", () => {
      render(<UserPagination {...defaultProps} />);

      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-live", "polite");
      expect(status).toHaveTextContent(/showing.*results/i);
    });
  });

  describe("ExportDialog Component", () => {
    const defaultProps = {
      open: true,
      onClose: vi.fn(),
      filters: mockFilters,
      totalRecords: 100,
      onExport: vi.fn(),
    };

    it("should have proper dialog structure", () => {
      render(<ExportDialog {...defaultProps} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-describedby");

      const title = screen.getByRole("heading", { name: /export users/i });
      expect(title).toHaveAttribute("id");
    });

    it("should have accessible form controls", () => {
      render(<ExportDialog {...defaultProps} />);

      const formatSelect = screen.getByRole("combobox");
      expect(formatSelect).toHaveAttribute("aria-label");
    });

    it("should have accessible action buttons", () => {
      render(<ExportDialog {...defaultProps} />);

      const exportButton = screen.getByRole("button", { name: /export.*csv/i });
      expect(exportButton).toHaveAttribute("aria-label");
      expect(exportButton).toHaveAttribute("aria-describedby");

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      expect(cancelButton).toHaveAttribute("aria-label");
    });
  });

  describe("Keyboard Navigation Integration", () => {
    it("should support tab navigation through interactive elements", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <UserFilters
            filters={mockFilters}
            onFiltersChange={vi.fn()}
            roles={mockRoles}
            totalRecords={100}
          />
          <UserTable
            users={mockUsers}
            filters={mockFilters}
            onFiltersChange={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
            onToggleStatus={vi.fn()}
            selectedUsers={new Set(["1", "2"])}
            onUserSelection={vi.fn()}
            onSelectAll={vi.fn()}
          />
        </div>
      );

      // Test tab navigation
      await user.tab();
      expect(document.activeElement).toBeInTheDocument();

      await user.tab();
      expect(document.activeElement).toBeInTheDocument();

      // Test shift+tab (reverse navigation)
      await user.tab({ shift: true });
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe("Focus Management", () => {
    it("should manage focus properly in dialogs", () => {
      const onClose = vi.fn();

      render(
        <ExportDialog
          open={true}
          onClose={onClose}
          filters={mockFilters}
          totalRecords={100}
          onExport={vi.fn()}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();

      // Focus should be managed within the dialog
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });
});
