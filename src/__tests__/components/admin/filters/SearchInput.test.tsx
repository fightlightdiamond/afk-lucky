import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchInput } from "@/components/admin/filters/SearchInput";

describe("SearchInput", () => {
  const mockOnChange = jest.fn();

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

    expect(screen.getByPlaceholderText("Search users...")).toBeInTheDocument();
  });

  it("displays the current value", () => {
    render(<SearchInput value="test search" onChange={mockOnChange} />);

    expect(screen.getByDisplayValue("test search")).toBeInTheDocument();
  });

  it("calls onChange after debounce delay", async () => {
    render(<SearchInput value="" onChange={mockOnChange} debounceMs={100} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "new search" } });

    // Should not call immediately
    expect(mockOnChange).not.toHaveBeenCalled();

    // Should call after debounce delay
    await waitFor(
      () => {
        expect(mockOnChange).toHaveBeenCalledWith("new search");
      },
      { timeout: 200 }
    );
  });

  it("shows clear button when there is a value", () => {
    render(<SearchInput value="test" onChange={mockOnChange} />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("clears value when clear button is clicked", () => {
    render(<SearchInput value="test" onChange={mockOnChange} />);

    const clearButton = screen.getByRole("button");
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith("");
  });

  it("can be disabled", () => {
    render(<SearchInput value="" onChange={mockOnChange} disabled={true} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });
});
