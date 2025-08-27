import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExportDialog } from "@/components/admin/ExportDialog";
import { UserFilters } from "@/types/user";

// Mock the toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockFilters: UserFilters = {
  search: "",
  role: null,
  status: null,
  dateRange: null,
  activityDateRange: null,
  sortBy: "created_at",
  sortOrder: "desc",
  hasAvatar: null,
  locale: null,
  group_id: null,
  activity_status: null,
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  filters: mockFilters,
  totalRecords: 100,
  onExport: vi.fn(),
};

describe("ExportDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render export dialog", () => {
    render(<ExportDialog {...defaultProps} />);

    expect(screen.getByText("Export Users")).toBeInTheDocument();
    expect(screen.getByText("Total Records:")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("should show format selection options", () => {
    render(<ExportDialog {...defaultProps} />);

    // Click on format selector
    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByText("CSV")).toBeInTheDocument();
    expect(screen.getByText("Excel")).toBeInTheDocument();
    expect(screen.getByText("JSON")).toBeInTheDocument();
  });

  it("should show field selection for CSV format", () => {
    render(<ExportDialog {...defaultProps} />);

    expect(screen.getByText("Fields to Export")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
  });

  it("should hide field selection for JSON format", () => {
    render(<ExportDialog {...defaultProps} />);

    // Change to JSON format
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("JSON"));

    expect(screen.queryByText("Fields to Export")).not.toBeInTheDocument();
    expect(
      screen.getByText("All available fields will be included")
    ).toBeInTheDocument();
  });

  it("should handle field selection", () => {
    render(<ExportDialog {...defaultProps} />);

    // Initially some fields should be selected
    const emailCheckbox = screen.getByLabelText("Email");
    expect(emailCheckbox).toBeChecked();

    // Uncheck email
    fireEvent.click(emailCheckbox);
    expect(emailCheckbox).not.toBeChecked();

    // Check it again
    fireEvent.click(emailCheckbox);
    expect(emailCheckbox).toBeChecked();
  });

  it("should handle select all fields", () => {
    render(<ExportDialog {...defaultProps} />);

    // Click select all
    fireEvent.click(screen.getByText("Select All"));

    // All checkboxes should be checked
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
  });

  it("should handle clear all fields", () => {
    render(<ExportDialog {...defaultProps} />);

    // Click clear all
    fireEvent.click(screen.getByText("Clear All"));

    // All checkboxes should be unchecked
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it("should call onExport when export button is clicked", async () => {
    const mockOnExport = vi.fn().mockResolvedValue(undefined);
    render(<ExportDialog {...defaultProps} onExport={mockOnExport} />);

    // Click export button
    fireEvent.click(screen.getByText("Export CSV"));

    await waitFor(() => {
      expect(mockOnExport).toHaveBeenCalledWith("csv", expect.any(Array));
    });
  });

  it("should prevent export when no fields selected for CSV", () => {
    render(<ExportDialog {...defaultProps} />);

    // Clear all fields
    fireEvent.click(screen.getByText("Clear All"));

    // Export button should be disabled
    const exportButton = screen.getByText("Export CSV");
    expect(exportButton).toBeDisabled();
  });

  it("should show warning when export limit exceeded", () => {
    render(<ExportDialog {...defaultProps} totalRecords={15000} />);

    expect(screen.getByText(/Export limit exceeded/)).toBeInTheDocument();
    expect(screen.getByText("15,000")).toBeInTheDocument();

    // Export button should be disabled
    const exportButton = screen.getByText("Export CSV");
    expect(exportButton).toBeDisabled();
  });

  it("should show active filters count", () => {
    const filtersWithActive: UserFilters = {
      ...mockFilters,
      search: "john",
      status: "active",
      role: "admin",
    };

    render(<ExportDialog {...defaultProps} filters={filtersWithActive} />);

    expect(screen.getByText("Active Filters:")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should show security notice", () => {
    render(<ExportDialog {...defaultProps} />);

    expect(screen.getByText(/Security Notice:/)).toBeInTheDocument();
    expect(
      screen.getByText(/Sensitive information such as passwords/)
    ).toBeInTheDocument();
  });

  it("should handle export error", async () => {
    const mockOnExport = jest
      .fn()
      .mockRejectedValue(new Error("Export failed"));
    render(<ExportDialog {...defaultProps} onExport={mockOnExport} />);

    // Click export button
    fireEvent.click(screen.getByText("Export CSV"));

    await waitFor(() => {
      expect(mockOnExport).toHaveBeenCalled();
    });
  });

  it("should close dialog when cancel is clicked", () => {
    const mockOnClose = vi.fn();
    render(<ExportDialog {...defaultProps} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText("Cancel"));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should show loading state during export", async () => {
    const mockOnExport = jest
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
    render(<ExportDialog {...defaultProps} onExport={mockOnExport} />);

    // Click export button
    fireEvent.click(screen.getByText("Export CSV"));

    // Should show loading state
    expect(screen.getByText("Exporting...")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnExport).toHaveBeenCalled();
    });
  });
});
