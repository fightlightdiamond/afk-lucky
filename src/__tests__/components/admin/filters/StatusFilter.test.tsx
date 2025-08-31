import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import { StatusFilter } from "@/components/admin/filters/StatusFilter";

describe("StatusFilter", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with default value", () => {
    render(<StatusFilter value="all" onChange={mockOnChange} />);

    expect(screen.getByText("All statuses")).toBeInTheDocument();
  });

  it("displays active status correctly", () => {
    render(<StatusFilter value="active" onChange={mockOnChange} />);

    // Use getAllByText since there are multiple "Active" elements (in select and badge)
    const activeElements = screen.getAllByText("Active");
    expect(activeElements.length).toBeGreaterThan(0);
  });

  it("shows status badge when not 'all'", () => {
    render(<StatusFilter value="active" onChange={mockOnChange} />);

    // Should show badge for non-"all" values
    expect(screen.getAllByText("Active")).toHaveLength(2); // One in select, one in badge
  });

  it("does not show badge when value is 'all'", () => {
    render(<StatusFilter value="all" onChange={mockOnChange} />);

    // Should only show in select, not in badge
    expect(screen.getAllByText("All statuses")).toHaveLength(1);
  });

  it("can be disabled", () => {
    render(
      <StatusFilter value="all" onChange={mockOnChange} disabled={true} />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
  });

  it("shows counts when provided", () => {
    render(
      <StatusFilter
        value="all"
        onChange={mockOnChange}
        showCounts={true}
        counts={{
          active: 10,
          inactive: 5,
          total: 15,
        }}
      />
    );

    // The counts should be shown in the options when opened
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    expect(screen.getByText("All statuses (15)")).toBeInTheDocument();
    expect(screen.getByText("Active (10)")).toBeInTheDocument();
  });
});
