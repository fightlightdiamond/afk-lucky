import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { DateRangeFilter } from "@/components/admin/filters/DateRangeFilter";
import { expect } from "storybook/internal/test";
import { it } from "@faker-js/faker";
import { expect } from "storybook/internal/test";
import { it } from "@faker-js/faker";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { it } from "@faker-js/faker";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { it } from "@faker-js/faker";
import { expect } from "storybook/internal/test";
import { it } from "@faker-js/faker";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { expect } from "storybook/internal/test";
import { it } from "@faker-js/faker";
import { expect } from "storybook/internal/test";
import { it } from "@faker-js/faker";
import { expect } from "storybook/internal/test";
import { it } from "@faker-js/faker";
import { expect } from "storybook/internal/test";
import { it } from "@faker-js/faker";
import { expect } from "storybook/internal/test";
import { it } from "@faker-js/faker";
import { expect } from "storybook/internal/test";
import { it } from "@faker-js/faker";
import { expect } from "storybook/internal/test";
import { it } from "@faker-js/faker";
import { beforeEach } from "node:test";
import { describe } from "node:test";

describe("DateRangeFilter", () => {
  const mockOnChange = vi.fn();
  const mockPresets = [
    {
      label: "Last 7 days",
      value: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    },
    {
      label: "Last 30 days",
      value: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    },
  ];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with placeholder text", () => {
    render(
      <DateRangeFilter
        value={null}
        onChange={mockOnChange}
        placeholder="Pick a date range"
      />
    );

    expect(screen.getByText("Pick a date range")).toBeInTheDocument();
  });

  it("displays selected date range", () => {
    const dateRange = {
      from: new Date("2024-01-01"),
      to: new Date("2024-01-31"),
    };

    render(<DateRangeFilter value={dateRange} onChange={mockOnChange} />);

    expect(screen.getByText(/Jan 01, 2024 - Jan 31, 2024/)).toBeInTheDocument();
  });

  it("displays 'from' date only when 'to' is null", () => {
    const dateRange = {
      from: new Date("2024-01-01"),
      to: null,
    };

    render(<DateRangeFilter value={dateRange} onChange={mockOnChange} />);

    expect(screen.getByText(/From Jan 01, 2024/)).toBeInTheDocument();
  });

  it("displays 'until' date only when 'from' is null", () => {
    const dateRange = {
      from: null,
      to: new Date("2024-01-31"),
    };

    render(<DateRangeFilter value={dateRange} onChange={mockOnChange} />);

    expect(screen.getByText(/Until Jan 31, 2024/)).toBeInTheDocument();
  });

  it("shows clear button when date range is selected", () => {
    const dateRange = {
      from: new Date("2024-01-01"),
      to: new Date("2024-01-31"),
    };

    render(<DateRangeFilter value={dateRange} onChange={mockOnChange} />);

    // Should have 2 buttons: clear button and trigger button
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("clears date range when clear button is clicked", () => {
    const dateRange = {
      from: new Date("2024-01-01"),
      to: new Date("2024-01-31"),
    };

    render(<DateRangeFilter value={dateRange} onChange={mockOnChange} />);

    // Get all buttons and find the clear button (should be the first one)
    const buttons = screen.getAllByRole("button");
    const clearButton = buttons[0]; // The clear button should be first
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it("opens popover when trigger is clicked", () => {
    render(
      <DateRangeFilter
        value={null}
        onChange={mockOnChange}
        presets={mockPresets}
      />
    );

    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    expect(screen.getByText("Quick Select")).toBeInTheDocument();
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  it("applies preset when preset button is clicked", () => {
    render(
      <DateRangeFilter
        value={null}
        onChange={mockOnChange}
        presets={mockPresets}
      />
    );

    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    const presetButton = screen.getByText("Last 7 days");
    fireEvent.click(presetButton);

    expect(mockOnChange).toHaveBeenCalledWith(mockPresets[0].value);
  });

  it("shows date badges when date range is selected", () => {
    const dateRange = {
      from: new Date("2024-01-01"),
      to: new Date("2024-01-31"),
    };

    render(<DateRangeFilter value={dateRange} onChange={mockOnChange} />);

    expect(screen.getByText(/From: Jan 01, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/To: Jan 31, 2024/)).toBeInTheDocument();
  });

  it("shows only 'from' badge when 'to' is null", () => {
    const dateRange = {
      from: new Date("2024-01-01"),
      to: null,
    };

    render(<DateRangeFilter value={dateRange} onChange={mockOnChange} />);

    expect(screen.getByText(/From: Jan 01, 2024/)).toBeInTheDocument();
    expect(screen.queryByText(/To:/)).not.toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <DateRangeFilter value={null} onChange={mockOnChange} disabled={true} />
    );

    const trigger = screen.getByRole("button");
    expect(trigger).toBeDisabled();
  });

  it("uses custom label", () => {
    render(
      <DateRangeFilter
        value={null}
        onChange={mockOnChange}
        label="Custom Date Range"
      />
    );

    expect(screen.getByText("Custom Date Range")).toBeInTheDocument();
  });
});
