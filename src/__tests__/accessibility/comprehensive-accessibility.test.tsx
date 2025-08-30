import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserManagementPage } from "@/components/admin/UserManagementPage";
import { UserTable } from "@/components/admin/UserTable";
import { UserFilters } from "@/components/admin/UserFilters";
import { BulkOperations } from "@/components/admin/BulkOperations";
import { UserDialog } from "@/components/admin/UserDialog";
import { mockUsers, mockRoles } from "../__mocks__/user-data";

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock dependencies
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

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

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

describe("Comprehensive Accessibility Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/api/admin/users")) {
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

  describe("User Management Page Accessibility", () => {
    it("should have no accessibility violations", async () => {
      const Wrapper = createWrapper();
      const { container } = render(<UserManagementPage />, {
        wrapper: Wrapper,
      });

      // Wait for content to load
      await screen.findByText("User Management");

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper heading structure", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await screen.findByText("User Management");

      // Check for proper heading hierarchy
      const mainHeading = screen.getByRole("heading", { level: 1 });
      expect(mainHeading).toHaveTextContent("User Management");

      // Check for section headings
      const sectionHeadings = screen.getAllByRole("heading", { level: 2 });
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });

    it("should have proper landmarks", async () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      await screen.findByText("User Management");

      // Check for main landmark
      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();

      // Check for navigation if present
      const navigation = screen.queryByRole("navigation");
      if (navigation) {
        expect(navigation).toHaveAccessibleName();
      }
    });
  });

  describe("User Table Accessibility", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(
        <UserTable
          users={mockUsers}
          loading={false}
          filters={{
            search: "",
            role: null,
            status: null,
            dateRange: null,
            sortBy: "full_name",
            sortOrder: "asc",
          }}
          pagination={{
            page: 1,
            pageSize: 10,
            total: mockUsers.length,
          }}
          selectedUsers={[]}
          onSort={vi.fn()}
          onSelectUser={vi.fn()}
          onSelectAll={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper table structure", () => {
      render(
        <UserTable
          users={mockUsers}
          loading={false}
          filters={{
            search: "",
            role: null,
            status: null,
            dateRange: null,
            sortBy: "full_name",
            sortOrder: "asc",
          }}
          pagination={{
            page: 1,
            pageSize: 10,
            total: mockUsers.length,
          }}
          selectedUsers={[]}
          onSort={vi.fn()}
          onSelectUser={vi.fn()}
          onSelectAll={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
        />
      );

      // Check for table role
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();

      // Check for column headers
      const columnHeaders = screen.getAllByRole("columnheader");
      expect(columnHeaders.length).toBeGreaterThan(0);

      // Check for row headers or cells
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1); // Header + data rows
    });

    it("should have accessible sort controls", () => {
      render(
        <UserTable
          users={mockUsers}
          loading={false}
          filters={{
            search: "",
            role: null,
            status: null,
            dateRange: null,
            sortBy: "full_name",
            sortOrder: "asc",
          }}
          pagination={{
            page: 1,
            pageSize: 10,
            total: mockUsers.length,
          }}
          selectedUsers={[]}
          onSort={vi.fn()}
          onSelectUser={vi.fn()}
          onSelectAll={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
        />
      );

      // Check for sortable column headers
      const sortButtons = screen.getAllByRole("button", { name: /sort by/i });
      sortButtons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });

    it("should have accessible selection controls", () => {
      render(
        <UserTable
          users={mockUsers}
          loading={false}
          filters={{
            search: "",
            role: null,
            status: null,
            dateRange: null,
            sortBy: "full_name",
            sortOrder: "asc",
          }}
          pagination={{
            page: 1,
            pageSize: 10,
            total: mockUsers.length,
          }}
          selectedUsers={[]}
          onSort={vi.fn()}
          onSelectUser={vi.fn()}
          onSelectAll={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
        />
      );

      // Check for select all checkbox
      const selectAllCheckbox = screen.getByRole("checkbox", {
        name: /select all/i,
      });
      expect(selectAllCheckbox).toBeInTheDocument();

      // Check for individual selection checkboxes
      const userCheckboxes = screen.getAllByRole("checkbox", {
        name: /select user/i,
      });
      expect(userCheckboxes.length).toBe(mockUsers.length);
    });
  });

  describe("User Filters Accessibility", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(
        <UserFilters
          filters={{
            search: "",
            role: null,
            status: null,
            dateRange: null,
            sortBy: "full_name",
            sortOrder: "asc",
          }}
          roles={mockRoles}
          onFiltersChange={vi.fn()}
          onClearFilters={vi.fn()}
          onExport={vi.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have accessible form controls", () => {
      render(
        <UserFilters
          filters={{
            search: "",
            role: null,
            status: null,
            dateRange: null,
            sortBy: "full_name",
            sortOrder: "asc",
          }}
          roles={mockRoles}
          onFiltersChange={vi.fn()}
          onClearFilters={vi.fn()}
          onExport={vi.fn()}
        />
      );

      // Check for search input
      const searchInput = screen.getByRole("textbox", { name: /search/i });
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAccessibleName();

      // Check for filter controls
      const filterButtons = screen.getAllByRole("button");
      filterButtons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });

    it("should have proper labels and descriptions", () => {
      render(
        <UserFilters
          filters={{
            search: "",
            role: null,
            status: null,
            dateRange: null,
            sortBy: "full_name",
            sortOrder: "asc",
          }}
          roles={mockRoles}
          onFiltersChange={vi.fn()}
          onClearFilters={vi.fn()}
          onExport={vi.fn()}
        />
      );

      // Check that all form controls have labels
      const inputs = screen.getAllByRole("textbox");
      inputs.forEach((input) => {
        expect(input).toHaveAccessibleName();
      });

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  describe("User Dialog Accessibility", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(
        <UserDialog
          open={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          roles={mockRoles}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper dialog structure", () => {
      render(
        <UserDialog
          open={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          roles={mockRoles}
        />
      );

      // Check for dialog role
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAccessibleName();

      // Check for close button
      const closeButton = screen.getByRole("button", { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it("should have accessible form fields", () => {
      render(
        <UserDialog
          open={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          roles={mockRoles}
        />
      );

      // Check that all form fields have labels
      const textInputs = screen.getAllByRole("textbox");
      textInputs.forEach((input) => {
        expect(input).toHaveAccessibleName();
      });

      // Check password field
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should manage focus properly", async () => {
      const user = userEvent.setup();

      render(
        <UserDialog
          open={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          roles={mockRoles}
        />
      );

      // Focus should be trapped within dialog
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();

      // Tab through focusable elements
      await user.tab();
      const focusedElement = document.activeElement;
      expect(dialog).toContainElement(focusedElement);
    });
  });

  describe("Bulk Operations Accessibility", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(
        <BulkOperations
          selectedUsers={["user-1", "user-2"]}
          onBulkBan={vi.fn()}
          onBulkUnban={vi.fn()}
          onBulkDelete={vi.fn()}
          onBulkAssignRole={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should announce selection changes", () => {
      render(
        <BulkOperations
          selectedUsers={["user-1", "user-2"]}
          onBulkBan={vi.fn()}
          onBulkUnban={vi.fn()}
          onBulkDelete={vi.fn()}
          onBulkAssignRole={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );

      // Check for selection announcement
      const selectionText = screen.getByText(/2 users selected/i);
      expect(selectionText).toBeInTheDocument();
      expect(selectionText).toHaveAttribute("aria-live", "polite");
    });

    it("should have accessible action buttons", () => {
      render(
        <BulkOperations
          selectedUsers={["user-1", "user-2"]}
          onBulkBan={vi.fn()}
          onBulkUnban={vi.fn()}
          onBulkDelete={vi.fn()}
          onBulkAssignRole={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );

      // Check that all action buttons have accessible names
      const actionButtons = screen.getAllByRole("button");
      actionButtons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  describe("Keyboard Navigation", () => {
    it("should support keyboard navigation through table", async () => {
      const user = userEvent.setup();

      render(
        <UserTable
          users={mockUsers}
          loading={false}
          filters={{
            search: "",
            role: null,
            status: null,
            dateRange: null,
            sortBy: "full_name",
            sortOrder: "asc",
          }}
          pagination={{
            page: 1,
            pageSize: 10,
            total: mockUsers.length,
          }}
          selectedUsers={[]}
          onSort={vi.fn()}
          onSelectUser={vi.fn()}
          onSelectAll={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
        />
      );

      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement).toHaveRole("checkbox");

      await user.tab();
      expect(document.activeElement).toHaveRole("button");
    });

    it("should support keyboard shortcuts", async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();

      render(
        <UserTable
          users={mockUsers}
          loading={false}
          filters={{
            search: "",
            role: null,
            status: null,
            dateRange: null,
            sortBy: "full_name",
            sortOrder: "asc",
          }}
          pagination={{
            page: 1,
            pageSize: 10,
            total: mockUsers.length,
          }}
          selectedUsers={[]}
          onSort={onSort}
          onSelectUser={vi.fn()}
          onSelectAll={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
        />
      );

      // Focus on sort button and press Enter
      const sortButton = screen.getByRole("button", { name: /sort by name/i });
      sortButton.focus();
      await user.keyboard("{Enter}");

      expect(onSort).toHaveBeenCalled();
    });
  });

  describe("Screen Reader Support", () => {
    it("should have proper ARIA labels", () => {
      const Wrapper = createWrapper();
      render(<UserManagementPage />, { wrapper: Wrapper });

      // Check for ARIA labels on interactive elements
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAccessibleName();
      });
    });

    it("should announce loading states", async () => {
      const Wrapper = createWrapper();
      render(
        <UserTable
          users={[]}
          loading={true}
          filters={{
            search: "",
            role: null,
            status: null,
            dateRange: null,
            sortBy: "full_name",
            sortOrder: "asc",
          }}
          pagination={{
            page: 1,
            pageSize: 10,
            total: 0,
          }}
          selectedUsers={[]}
          onSort={vi.fn()}
          onSelectUser={vi.fn()}
          onSelectAll={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
        />
      );

      // Check for loading announcement
      const loadingElement = screen.getByText(/loading/i);
      expect(loadingElement).toBeInTheDocument();
      expect(loadingElement).toHaveAttribute("aria-live", "polite");
    });

    it("should announce status changes", () => {
      render(
        <UserTable
          users={mockUsers}
          loading={false}
          filters={{
            search: "",
            role: null,
            status: null,
            dateRange: null,
            sortBy: "full_name",
            sortOrder: "asc",
          }}
          pagination={{
            page: 1,
            pageSize: 10,
            total: mockUsers.length,
          }}
          selectedUsers={[]}
          onSort={vi.fn()}
          onSelectUser={vi.fn()}
          onSelectAll={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
        />
      );

      // Check for status indicators with proper ARIA labels
      const statusBadges = screen.getAllByText(/active|inactive/i);
      statusBadges.forEach((badge) => {
        expect(badge.closest("[role]") || badge).toHaveAccessibleName();
      });
    });
  });

  describe("Color Contrast and Visual Accessibility", () => {
    it("should not rely solely on color for information", () => {
      render(
        <UserTable
          users={mockUsers}
          loading={false}
          filters={{
            search: "",
            role: null,
            status: null,
            dateRange: null,
            sortBy: "full_name",
            sortOrder: "asc",
          }}
          pagination={{
            page: 1,
            pageSize: 10,
            total: mockUsers.length,
          }}
          selectedUsers={[]}
          onSort={vi.fn()}
          onSelectUser={vi.fn()}
          onSelectAll={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
        />
      );

      // Status should have text labels, not just colors
      const statusElements = screen.getAllByText(/active|inactive/i);
      expect(statusElements.length).toBeGreaterThan(0);

      // Sort indicators should have text or symbols, not just colors
      const sortButtons = screen.getAllByRole("button", { name: /sort/i });
      sortButtons.forEach((button) => {
        expect(button).toHaveTextContent();
      });
    });
  });
});
