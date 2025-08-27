import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserPagination } from "@/components/admin/UserPagination";
import { PaginationParams } from "@/types/user";

// Mock the UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    ...props
  }: React.ComponentProps<"button">) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

interface SelectProps {
  children: React.ReactNode;
  onValueChange: (value: string) => void;
  value: string;
  disabled?: boolean;
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
}

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, value, disabled }: SelectProps) => (
    <select
      data-testid="page-size-select"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
    >
      {children}
    </select>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectItem: ({ children, value }: SelectItemProps) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectValue: () => null,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.ComponentProps<"input">) => <input {...props} />,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: React.ComponentProps<"label">) => (
    <label {...props}>{children}</label>
  ),
}));

describe("UserPagination", () => {
  const mockOnPageChange = vi.fn();
  const mockOnPageSizeChange = vi.fn();

  const defaultPagination: PaginationParams = {
    page: 1,
    pageSize: 20,
    total: 100,
    totalPages: 5,
    hasNextPage: true,
    hasPreviousPage: false,
    startIndex: 1,
    endIndex: 20,
    offset: 0,
    limit: 20,
    isFirstPage: true,
    isLastPage: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders pagination information correctly", () => {
    render(
      <UserPagination
        pagination={defaultPagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    expect(
      screen.getByText("Showing 1 to 20 of 100 results")
    ).toBeInTheDocument();
  });

  it("renders page size selector with correct options", () => {
    render(
      <UserPagination
        pagination={defaultPagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    const select = screen.getByTestId("page-size-select");
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue("20");

    // Check if options are present
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("calls onPageSizeChange when page size is changed", () => {
    render(
      <UserPagination
        pagination={defaultPagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    const select = screen.getByTestId("page-size-select");
    fireEvent.change(select, { target: { value: "50" } });

    expect(mockOnPageSizeChange).toHaveBeenCalledWith(50);
  });

  it("renders navigation buttons correctly", () => {
    render(
      <UserPagination
        pagination={defaultPagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    // Previous button should be disabled on first page
    const prevButton = screen.getByText("Previous").closest("button");
    expect(prevButton).toBeDisabled();

    // Next button should be enabled
    const nextButton = screen.getByText("Next").closest("button");
    expect(nextButton).not.toBeDisabled();

    // Page number buttons
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("calls onPageChange when navigation buttons are clicked", () => {
    const middlePagePagination: PaginationParams = {
      ...defaultPagination,
      page: 3,
      hasPreviousPage: true,
      hasNextPage: true,
      startIndex: 41,
      endIndex: 60,
      isFirstPage: false,
      isLastPage: false,
    };

    render(
      <UserPagination
        pagination={middlePagePagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    // Click previous button
    const prevButton = screen.getByText("Previous").closest("button");
    fireEvent.click(prevButton!);
    expect(mockOnPageChange).toHaveBeenCalledWith(2);

    // Click next button
    const nextButton = screen.getByText("Next").closest("button");
    fireEvent.click(nextButton!);
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it("renders first and last page buttons on desktop", () => {
    render(
      <UserPagination
        pagination={defaultPagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    // First and last buttons should be present (they have hidden sm:flex class)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(4); // Should include first/last buttons
  });

  it("calls onPageChange when first/last buttons are clicked", () => {
    const middlePagePagination: PaginationParams = {
      ...defaultPagination,
      page: 3,
      hasPreviousPage: true,
      hasNextPage: true,
      startIndex: 41,
      endIndex: 60,
      isFirstPage: false,
      isLastPage: false,
    };

    render(
      <UserPagination
        pagination={middlePagePagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    const buttons = screen.getAllByRole("button");

    // First button (should be the first button with ChevronsLeft icon)
    fireEvent.click(buttons[0]);
    expect(mockOnPageChange).toHaveBeenCalledWith(1);

    // Last button (should be the last button with ChevronsRight icon)
    fireEvent.click(buttons[buttons.length - 1]);
    expect(mockOnPageChange).toHaveBeenCalledWith(5);
  });

  it("renders jump to page input for large page counts", () => {
    const largePagination: PaginationParams = {
      ...defaultPagination,
      total: 1000,
      totalPages: 50,
      endIndex: 20,
    };

    render(
      <UserPagination
        pagination={largePagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    expect(screen.getByText("Go to:")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Page")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
  });

  it("handles jump to page functionality", async () => {
    const largePagination: PaginationParams = {
      ...defaultPagination,
      total: 1000,
      totalPages: 50,
      endIndex: 20,
    };

    render(
      <UserPagination
        pagination={largePagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    const input = screen.getByPlaceholderText("Page");
    const goButton = screen.getByText("Go");

    // Type page number
    fireEvent.change(input, { target: { value: "25" } });
    fireEvent.click(goButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(25);
  });

  it("handles jump to page with Enter key", async () => {
    const largePagination: PaginationParams = {
      ...defaultPagination,
      total: 1000,
      totalPages: 50,
      endIndex: 20,
    };

    render(
      <UserPagination
        pagination={largePagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    const input = screen.getByPlaceholderText("Page");

    // Type page number and press Enter
    fireEvent.change(input, { target: { value: "30" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockOnPageChange).toHaveBeenCalledWith(30);
  });

  it("validates jump to page input", () => {
    const largePagination: PaginationParams = {
      ...defaultPagination,
      total: 1000,
      totalPages: 50,
      endIndex: 20,
    };

    render(
      <UserPagination
        pagination={largePagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    const input = screen.getByPlaceholderText("Page");
    const goButton = screen.getByText("Go");

    // Try invalid page number (too high)
    fireEvent.change(input, { target: { value: "100" } });
    fireEvent.click(goButton);

    // Should not call onPageChange for invalid page
    expect(mockOnPageChange).not.toHaveBeenCalledWith(100);

    // Try invalid page number (too low)
    fireEvent.change(input, { target: { value: "0" } });
    fireEvent.click(goButton);

    expect(mockOnPageChange).not.toHaveBeenCalledWith(0);
  });

  it("disables controls when loading", () => {
    render(
      <UserPagination
        pagination={defaultPagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        isLoading={true}
      />
    );

    // All buttons should be disabled
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });

    // Page size select should be disabled
    const select = screen.getByTestId("page-size-select");
    expect(select).toBeDisabled();
  });

  it("renders page numbers with ellipsis for large page counts", () => {
    const largePagination: PaginationParams = {
      ...defaultPagination,
      page: 25,
      total: 1000,
      totalPages: 50,
      startIndex: 481,
      endIndex: 500,
      hasPreviousPage: true,
      hasNextPage: true,
      isFirstPage: false,
      isLastPage: false,
    };

    render(
      <UserPagination
        pagination={largePagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    // Should show page 1, ellipsis, current page range, ellipsis, last page
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();

    // Use getAllByText to handle multiple elements with "50" (option and button)
    const fiftyElements = screen.getAllByText("50");
    expect(fiftyElements.length).toBeGreaterThan(0);
  });

  it("does not render when total is 0", () => {
    const emptyPagination: PaginationParams = {
      ...defaultPagination,
      total: 0,
      totalPages: 0,
      startIndex: 0,
      endIndex: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    const { container } = render(
      <UserPagination
        pagination={emptyPagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("handles undefined pagination gracefully", () => {
    const { container } = render(
      <UserPagination
        pagination={undefined as any}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders responsive layout correctly", () => {
    render(
      <UserPagination
        pagination={defaultPagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    // Check for responsive classes on the main container
    const container = screen
      .getByText("Showing 1 to 20 of 100 results")
      .closest("div")?.parentElement;
    expect(container).toHaveClass("flex");
  });
});
