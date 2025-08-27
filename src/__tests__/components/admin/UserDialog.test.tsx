import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserDialog } from "@/components/admin/UserDialog";
import { Role, User } from "@/types/user";
import { vi } from "vitest";

// Mock the useDebounce hook
vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: any) => value,
}));

// Mock fetch for email availability check
global.fetch = vi.fn();

const mockRoles: Role[] = [
  {
    id: "1",
    name: "ADMIN" as any,
    description: "Administrator role",
    permissions: ["user:read", "user:create", "user:update", "user:delete"],
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "USER" as any,
    description: "Regular user role",
    permissions: ["user:read"],
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
];

const mockUser: User = {
  id: "user-1",
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  is_active: true,
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
  role_id: "1",
  role: mockRoles[0],
  locale: "en",
  full_name: "John Doe",
  display_name: "John Doe",
  status: "active" as any,
  activity_status: "offline" as any,
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe("UserDialog", () => {
  const mockOnSubmit = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockClear();
  });

  it("renders create user dialog correctly", () => {
    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roles={mockRoles}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("Create New User")).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText("Create User")).toBeInTheDocument();
  });

  it("renders edit user dialog correctly", () => {
    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
        roles={mockRoles}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("Edit User")).toBeInTheDocument();
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("john.doe@example.com")
    ).toBeInTheDocument();
    expect(screen.getByText("Update User")).toBeInTheDocument();
  });

  it("shows password strength indicator when typing password", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roles={mockRoles}
        onSubmit={mockOnSubmit}
      />
    );

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, "weak");

    await waitFor(() => {
      expect(screen.getByText("Weak")).toBeInTheDocument();
    });

    await user.clear(passwordInput);
    await user.type(passwordInput, "StrongPassword123!");

    await waitFor(() => {
      expect(screen.getByText("Strong")).toBeInTheDocument();
    });
  });

  it("checks email availability when typing email", async () => {
    const user = userEvent.setup();

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ available: true, message: "Email is available" }),
    });

    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roles={mockRoles}
        onSubmit={mockOnSubmit}
      />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, "test@example.com");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/admin/users/check-email?email=test%40example.com"
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Email is available")).toBeInTheDocument();
    });
  });

  it("shows email unavailable message when email is taken", async () => {
    const user = userEvent.setup();

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          available: false,
          message: "Email is already taken",
        }),
    });

    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roles={mockRoles}
        onSubmit={mockOnSubmit}
      />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, "taken@example.com");

    await waitFor(() => {
      expect(screen.getByText("Email is already taken")).toBeInTheDocument();
    });
  });

  it("shows role permissions preview when role is selected", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roles={mockRoles}
        onSubmit={mockOnSubmit}
      />
    );

    // Open role select
    const roleSelect = screen.getByRole("combobox", { name: /role/i });
    await user.click(roleSelect);

    // Select admin role
    const adminOption = screen.getByText("ADMIN");
    await user.click(adminOption);

    await waitFor(() => {
      expect(screen.getByText("Role: ADMIN")).toBeInTheDocument();
      expect(screen.getByText("4 permissions")).toBeInTheDocument();
    });
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roles={mockRoles}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByText("Create User");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("First name is required")).toBeInTheDocument();
      expect(screen.getByText("Last name is required")).toBeInTheDocument();
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ available: true }),
    });

    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roles={mockRoles}
        onSubmit={mockOnSubmit}
      />
    );

    // Fill in form
    await user.type(screen.getByLabelText(/first name/i), "Jane");
    await user.type(screen.getByLabelText(/last name/i), "Smith");
    await user.type(
      screen.getByLabelText(/email address/i),
      "jane.smith@example.com"
    );
    await user.type(screen.getByLabelText(/password/i), "SecurePassword123!");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "SecurePassword123!"
    );

    // Select role
    const roleSelect = screen.getByRole("combobox", { name: /role/i });
    await user.click(roleSelect);
    await user.click(screen.getByText("USER"));

    const submitButton = screen.getByText("Create User");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@example.com",
        password: "SecurePassword123!",
        role_id: "2",
        is_active: true,
        locale: "en",
      });
    });
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roles={mockRoles}
        onSubmit={mockOnSubmit}
      />
    );

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = passwordInput.parentElement?.querySelector("button");

    expect(passwordInput).toHaveAttribute("type", "password");

    if (toggleButton) {
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "password");
    }
  });

  it("disables submit button when email is unavailable", async () => {
    const user = userEvent.setup();

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ available: false }),
    });

    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roles={mockRoles}
        onSubmit={mockOnSubmit}
      />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, "taken@example.com");

    await waitFor(() => {
      const submitButton = screen.getByText("Create User");
      expect(submitButton).toBeDisabled();
    });
  });

  it("handles loading state correctly", () => {
    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roles={mockRoles}
        onSubmit={mockOnSubmit}
        isLoading={true}
      />
    );

    expect(screen.getByText("Saving...")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeDisabled();
  });
});
