import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { RoleFilter } from "@/components/admin/filters/RoleFilter";

const mockRoles = [
  { id: "1", name: "Admin", description: "Administrator role" },
  { id: "2", name: "User", description: "Regular user role" },
  { id: "3", name: "Editor", description: "Content editor role" },
];

describe("RoleFilter", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with placeholder text", () => {
    render(
      <RoleFilter
        selectedRoles={[]}
        onChange={mockOnChange}
        roles={mockRoles}
        placeholder="Select roles"
      />
    );

    const combobox = screen.getByRole("combobox");
    expect(combobox).toBeInTheDocument();
    expect(screen.getByText("Select roles")).toBeInTheDocument();
  });

  it("displays selected role name when one role is selected", () => {
    render(
      <RoleFilter
        selectedRoles={["1"]}
        onChange={mockOnChange}
        roles={mockRoles}
      />
    );

    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("displays count when multiple roles are selected", () => {
    render(
      <RoleFilter
        selectedRoles={["1", "2"]}
        onChange={mockOnChange}
        roles={mockRoles}
      />
    );

    expect(screen.getByText("Admin, User")).toBeInTheDocument();
  });

  it("displays count when more than maxDisplayCount roles are selected", () => {
    render(
      <RoleFilter
        selectedRoles={["1", "2", "3"]}
        onChange={mockOnChange}
        roles={mockRoles}
        maxDisplayCount={2}
      />
    );

    expect(screen.getByText("3 roles selected")).toBeInTheDocument();
  });

  it("opens popover when clicked", () => {
    render(
      <RoleFilter
        selectedRoles={[]}
        onChange={mockOnChange}
        roles={mockRoles}
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    expect(screen.getByText("Select All (3)")).toBeInTheDocument();
    mockRoles.forEach((role) => {
      expect(screen.getByText(role.name)).toBeInTheDocument();
    });
  });

  it("toggles role selection when role is clicked", () => {
    render(
      <RoleFilter
        selectedRoles={[]}
        onChange={mockOnChange}
        roles={mockRoles}
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    // Click on the label specifically to avoid ambiguity
    const adminLabel = screen.getByLabelText("Admin");
    fireEvent.click(adminLabel);

    expect(mockOnChange).toHaveBeenCalledWith(["1"]);
  });

  it("removes role when already selected", () => {
    render(
      <RoleFilter
        selectedRoles={["1"]}
        onChange={mockOnChange}
        roles={mockRoles}
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    // Click on the label specifically to avoid ambiguity
    const adminLabel = screen.getByLabelText("Admin");
    fireEvent.click(adminLabel);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it("selects all roles when Select All is clicked", () => {
    render(
      <RoleFilter
        selectedRoles={[]}
        onChange={mockOnChange}
        roles={mockRoles}
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    const selectAllCheckbox = screen.getByLabelText("Select All (3)");
    fireEvent.click(selectAllCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(["1", "2", "3"]);
  });

  it("deselects all roles when Select All is clicked and all are selected", () => {
    render(
      <RoleFilter
        selectedRoles={["1", "2", "3"]}
        onChange={mockOnChange}
        roles={mockRoles}
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    const selectAllCheckbox = screen.getByLabelText("Select All (3)");
    fireEvent.click(selectAllCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it("clears all selections when clear button is clicked", () => {
    render(
      <RoleFilter
        selectedRoles={["1", "2"]}
        onChange={mockOnChange}
        roles={mockRoles}
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    const clearButton = screen.getByRole("button");
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <RoleFilter
        selectedRoles={[]}
        onChange={mockOnChange}
        roles={mockRoles}
        disabled={true}
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
  });
});
