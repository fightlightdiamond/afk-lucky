import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import { SearchInput } from "@/components/admin/filters/SearchInput";

describe("SearchInput", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with placeholder text", () => {
    render(
      <SearchInput
        value=""
        onChange={mockOnChange}
        placeholder="Search users..."
      />
    );

    const input = screen.getByLabelText("Search users");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Search users...");
  });

  it("displays the current value", () => {
    render(<SearchInput value="test search" onChange={mockOnChange} />);

    const input = screen.getByLabelText("Search users");
    expect(input).toHaveValue("test search");
  });

  it("has proper accessibility attributes", () => {
    render(<SearchInput value="" onChange={mockOnChange} />);

    const input = screen.getByLabelText("Search users");
    expect(input).toHaveAttribute("aria-label", "Search users");
    expect(input).toHaveAttribute("aria-describedby", "search-help");

    const helpText = screen.getByText(/Search through users by name, email/);
    expect(helpText).toBeInTheDocument();
  });

  it("shows clear button when there is a value", () => {
    render(<SearchInput value="test" onChange={mockOnChange} />);

    const clearButton = screen.getByLabelText("Clear search");
    expect(clearButton).toBeInTheDocument();
  });

  it("clears value when clear button is clicked", () => {
    render(<SearchInput value="test" onChange={mockOnChange} />);

    const clearButton = screen.getByLabelText("Clear search");
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith("");
  });

  it("can be disabled", () => {
    render(<SearchInput value="" onChange={mockOnChange} disabled={true} />);

    const input = screen.getByLabelText("Search users");
    expect(input).toBeDisabled();
  });
});
