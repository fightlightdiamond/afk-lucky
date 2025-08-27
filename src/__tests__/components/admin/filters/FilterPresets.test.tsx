import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { FilterPresets } from "@/components/admin/filters/FilterPresets";
import { UserStatus, ActivityStatus } from "@/types/user";
import { expect } from "storybook/internal/test";
import { it } from "node:test";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { it } from "node:test";
import { expect } from "storybook/internal/test";
import { it } from "node:test";
import { expect } from "storybook/internal/test";
import { it } from "node:test";
import { expect } from "storybook/internal/test";
import { it } from "node:test";
import { expect } from "storybook/internal/test";
import { it } from "node:test";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { it } from "node:test";
import { expect } from "storybook/internal/test";
import { it } from "node:test";
import { expect } from "storybook/internal/test";
import { it } from "node:test";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { it } from "node:test";
import { beforeEach } from "node:test";
import { describe } from "node:test";

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
    expect(screen.getByText("All Users")).toBeInTheDocument();
    expect(screen.getByText("Active Users")).toBeInTheDocument();
    expect(screen.getByText("Inactive Users")).toBeInTheDocument();
    expect(screen.getByText("Never Logged In")).toBeInTheDocument();
    expect(screen.getByText("Recent Users")).toBeInTheDocument();
  });

  it("calls onPresetSelect when preset is clicked", () => {
    render(
      <FilterPresets
        onPresetSelect={mockOnPresetSelect}
        currentFilters={mockCurrentFilters}
      />
    );

    const activeUsersPreset = screen.getByText("Active Users");
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
      .getByText("Active Users")
      .closest("button");
    expect(activeUsersButton).toHaveClass("bg-primary"); // Default variant styling
  });

  it("shows badges for non-active presets", () => {
    render(
      <FilterPresets
        onPresetSelect={mockOnPresetSelect}
        currentFilters={mockCurrentFilters}
      />
    );

    // Check for badges specifically
    expect(screen.getAllByText("Active")).toHaveLength(2); // One in button text, one in badge
    expect(screen.getByText("Inactive")).toBeInTheDocument();
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

    const allUsersButton = screen.getByText("All Users").closest("button");
    expect(allUsersButton).toBeDisabled();
  });

  it("shows tooltip with description on hover", () => {
    render(
      <FilterPresets
        onPresetSelect={mockOnPresetSelect}
        currentFilters={mockCurrentFilters}
      />
    );

    const activeUsersButton = screen
      .getByText("Active Users")
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

    const neverLoggedInPreset = screen.getByText("Never Logged In");
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

    const recentUsersPreset = screen.getByText("Recent Users");
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
      screen.getByText(/Click a preset to quickly apply common filters/)
    ).toBeInTheDocument();
  });
});
