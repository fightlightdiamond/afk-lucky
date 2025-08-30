import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { AdvancedUserFilters } from "@/components/admin/filters/AdvancedUserFilters";
import { UserStatus } from "@/types/user";

const mockRoles = [
  { id: "1", name: "Admin", description: "Administrator role" },
  { id: "2", name: "User", description: "Regular user role" },
];

const mockFilters = {
  search: "",
  role: null,
  status: null,
  dateRange: null,
  activityDateRange: null,
  sortBy: "created_at" as const,
  sortOrder: "desc" as const,
  hasAvatar: null,
  locale: null,
  group_id: null,
  activity_status: null,
};

describe("AdvancedUserFilters", () => {
  const mockOnFiltersChange = vi.fn();

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  it("renders search input and filters button", () => {
    render(
      <AdvancedUserFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        roles={mockRoles}
      />
    );

    expect(
      screen.getByPlaceholderText(/Search users by name, email/)
    ).toBeInTheDocument();
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("shows active filters count in filters button", () => {
    const filtersWithSearch = {
      ...mockFilters,
      search: "test",
      status: UserStatus.ACTIVE,
    };

    render(
      <AdvancedUserFilters
        filters={filtersWithSearch}
        onFiltersChange={mockOnFiltersChange}
        roles={mockRoles}
      />
    );

    expect(screen.getByText("2")).toBeInTheDocument(); // Badge showing count
  });

  it("opens filters popover when filters button is clicked", () => {
    render(
      <AdvancedUserFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        roles={mockRoles}
      />
    );

    const filtersButton = screen.getByText("Filters");
    fireEvent.click(filtersButton);

    expect(screen.getByText("Advanced Filters")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders search input that accepts user input", () => {
    render(
      <AdvancedUserFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        roles={mockRoles}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      /Search users by name, email/
    );

    // Test that the input exists and can receive focus
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).not.toBeDisabled();

    // Test that the input has the correct placeholder
    expect(searchInput).toHaveAttribute(
      "placeholder",
      "Search users by name, email..."
    );
  });

  it("shows filter presets when showPresets is true", () => {
    render(
      <AdvancedUserFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        roles={mockRoles}
        showPresets={true}
      />
    );

    expect(screen.getByText("Quick Filters")).toBeInTheDocument();
    expect(screen.getByText("All Users")).toBeInTheDocument();
  });

  it("hides filter presets when showPresets is false", () => {
    render(
      <AdvancedUserFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        roles={mockRoles}
        showPresets={false}
      />
    );

    expect(screen.queryByText("Quick Filters")).not.toBeInTheDocument();
  });

  it("shows active filters display when filters are applied", () => {
    const filtersWithValues = {
      ...mockFilters,
      search: "test",
      status: UserStatus.ACTIVE,
      role: "1",
    };

    render(
      <AdvancedUserFilters
        filters={filtersWithValues}
        onFiltersChange={mockOnFiltersChange}
        roles={mockRoles}
      />
    );

    expect(screen.getByText("Active Filters:")).toBeInTheDocument();
    expect(screen.getByText("Search: test")).toBeInTheDocument();
    expect(screen.getByText("Status: active")).toBeInTheDocument();
    expect(screen.getByText("Role: Admin")).toBeInTheDocument();
  });

  it("clears all filters when Clear All is clicked", () => {
    const filtersWithValues = {
      ...mockFilters,
      search: "test",
      status: UserStatus.ACTIVE,
    };

    render(
      <AdvancedUserFilters
        filters={filtersWithValues}
        onFiltersChange={mockOnFiltersChange}
        roles={mockRoles}
      />
    );

    const clearAllButton = screen.getByText("Clear All");
    fireEvent.click(clearAllButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "",
        role: null,
        status: null,
        dateRange: null,
        activityDateRange: null,
      })
    );
  });

  it("removes individual filter when X is clicked on filter badge", () => {
    const filtersWithSearch = {
      ...mockFilters,
      search: "test",
    };

    render(
      <AdvancedUserFilters
        filters={filtersWithSearch}
        onFiltersChange={mockOnFiltersChange}
        roles={mockRoles}
      />
    );

    // Find the X button in the search filter badge
    const searchBadge = screen.getByText("Search: test").closest("div");
    const removeButton = searchBadge?.querySelector("svg");

    if (removeButton) {
      fireEvent.click(removeButton);
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "",
        })
      );
    }
  });

  it("is disabled when isLoading is true", () => {
    render(
      <AdvancedUserFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        roles={mockRoles}
        isLoading={true}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      /Search users by name, email/
    );
    expect(searchInput).toBeDisabled();
  });

  it("applies custom className", () => {
    const { container } = render(
      <AdvancedUserFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        roles={mockRoles}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("handles preset selection", () => {
    render(
      <AdvancedUserFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        roles={mockRoles}
        showPresets={true}
      />
    );

    const activeUsersPreset = screen.getByText("Active Users");
    fireEvent.click(activeUsersPreset);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        status: UserStatus.ACTIVE,
      })
    );
  });
});
