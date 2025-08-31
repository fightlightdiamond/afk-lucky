import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import { FilterPresets } from "@/components/admin/filters/FilterPresets";
import { UserStatus, ActivityStatus } from "@/types/user";

const mockCurrentFilters = {
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

describe("FilterPresets", () => {
  const mockOnPresetSelect = vi.fn();

  beforeEach(() => {
    mockOnPresetSelect.mockClear();
  });

  it("renders default presets", () => {
    render(
      <FilterPresets
        onPresetSelect={mockOnPresetSelect}
        currentFilters={mockCurrentFilters}
      />
    );

    expect(screen.getByText("Quick Filters")).toBeInTheDocument();
    expect(screen.getAllByText("All Users")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Active Users")[0]).toBeInTheDocument();
    expect(screen.getByText("Inactive Users")).toBeInTheDocument();
    expect(screen.getAllByText("Never Logged In")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Recent Users")[0]).toBeInTheDocument();
  });

  it("calls onPresetSelect when preset is clicked", () => {
    render(
      <FilterPresets
        onPresetSelect={mockOnPresetSelect}
        currentFilters={mockCurrentFilters}
      />
    );

    const activeUsersPreset = screen.getAllByText("Active Users")[0];
    fireEvent.click(activeUsersPreset);

    expect(mockOnPresetSelect).toHaveBeenCalledWith({
      status: UserStatus.ACTIVE,
    });
  });

  it("highlights active preset", () => {
    const filtersWithActiveStatus = {
      ...mockCurrentFilters,
      status: UserStatus.ACTIVE,
    };

    render(
      <FilterPresets
        onPresetSelect={mockOnPresetSelect}
        currentFilters={filtersWithActiveStatus}
      />
    );

    const activeUsersButton = screen
      .getAllByText("Active Users")[0]
      .closest("button");
    // Check for primary variant styling when active
    expect(activeUsersButton).toHaveClass("bg-primary");
  });

  it("shows badges for non-active presets", () => {
    render(
      <FilterPresets
        onPresetSelect={mockOnPresetSelect}
        currentFilters={mockCurrentFilters}
      />
    );

    // Check for badges specifically - use getAllByText for elements that appear multiple times
    const activeElements = screen.getAllByText("Active");
    expect(activeElements.length).toBeGreaterThan(0);

    const inactiveElements = screen.getAllByText("Inactive");
    expect(inactiveElements.length).toBeGreaterThan(0);

    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Recent")).toBeInTheDocument();
  });

  it("renders custom presets", () => {
    const customPresets = [
      {
        id: "custom-preset",
        label: "Custom Preset",
        description: "Custom description",
        filters: { search: "test" },
      },
    ];

    render(
      <FilterPresets
        presets={customPresets}
        onPresetSelect={mockOnPresetSelect}
        currentFilters={mockCurrentFilters}
      />
    );

    expect(screen.getByText("Custom Preset")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <FilterPresets
        onPresetSelect={mockOnPresetSelect}
        currentFilters={mockCurrentFilters}
        disabled={true}
      />
    );

    // Find all buttons and check that they are disabled
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("shows tooltip with description on hover", () => {
    render(
      <FilterPresets
        onPresetSelect={mockOnPresetSelect}
        currentFilters={mockCurrentFilters}
      />
    );

    const activeUsersButton = screen
      .getAllByText("Active Users")[0]
      .closest("button");
    expect(activeUsersButton).toHaveAttribute("title", "Users who can log in");
  });

  it("handles never logged in preset", () => {
    render(
      <FilterPresets
        onPresetSelect={mockOnPresetSelect}
        currentFilters={mockCurrentFilters}
      />
    );

    const neverLoggedInPreset = screen.getAllByText("Never Logged In")[0];
    fireEvent.click(neverLoggedInPreset);

    expect(mockOnPresetSelect).toHaveBeenCalledWith({
      activity_status: ActivityStatus.NEVER,
    });
  });

  it("handles recent users preset with date range", () => {
    render(
      <FilterPresets
        onPresetSelect={mockOnPresetSelect}
        currentFilters={mockCurrentFilters}
      />
    );

    const recentUsersPreset = screen.getAllByText("Recent Users")[0];
    fireEvent.click(recentUsersPreset);

    expect(mockOnPresetSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        dateRange: expect.objectContaining({
          from: expect.any(Date),
          to: expect.any(Date),
        }),
      })
    );
  });

  it("shows info text about presets", () => {
    render(
      <FilterPresets
        onPresetSelect={mockOnPresetSelect}
        currentFilters={mockCurrentFilters}
      />
    );

    expect(
      screen.getAllByText(/Click a preset to quickly apply common filters/)[0]
    ).toBeInTheDocument();
  });
});
