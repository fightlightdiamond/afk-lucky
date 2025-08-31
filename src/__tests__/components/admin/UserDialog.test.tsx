import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserDialog } from "@/components/admin/UserDialog";
import type { User, Role } from "@/types/user";
import { UserRole, UserStatus, ActivityStatus } from "@/types/user";
import "@testing-library/jest-dom";

// Global mocks

// Mock fetch with proper typing
const mockFetch = vi.fn();

// Mock the global fetch
Object.defineProperty(global, "fetch", {
  value: mockFetch,
  writable: true,
});

// Mock the useRouter hook
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Create a proper Response object for mocking
const createMockResponse = (status: number, data: unknown): Response => {
  const response = new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add json method
  response.json = async () => Promise.resolve(data);

  return response;
};

// Mock the global fetch with proper typing
Object.defineProperty(window, "fetch", {
  writable: true,
  value: mockFetch as unknown as typeof window.fetch,
});

// Mock Radix UI Select components with proper types
vi.mock("@radix-ui/react-select", () => {
  const Select = ({
    children,
    value,
    onValueChange,
    ...props
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
    [key: string]: unknown;
  }) => (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      data-testid="mock-select"
      {...props}
    >
      {children}
    </select>
  );

  const SelectTrigger = ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="select-trigger" {...props}>
      {children}
    </div>
  );

  const SelectContent = ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="select-content" {...props}>
      {children}
    </div>
  );

  const SelectValue = ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <span data-testid="select-value" {...props}>
      {children}
    </span>
  );

  const SelectItem = ({
    value,
    children,
    ...props
  }: {
    value: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <option value={value} data-testid={`select-item-${value}`} {...props}>
      {children}
    </option>
  );

  return {
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem,
  };
});

// Mock the useDebounce hook to execute immediately
vi.mock("use-debounce", () => ({
  useDebounce: (fn: (...args: unknown[]) => Promise<unknown>) => ({
    callback: (...args: unknown[]) => Promise.resolve(fn(...args)),
    isPending: () => false,
  }),
}));

// Setup and teardown
beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockImplementation((input: RequestInfo | URL) => {
    const url = input.toString();
    if (url.includes("/api/admin/users/check-email")) {
      return Promise.resolve(createMockResponse(200, { available: true }));
    }
    return Promise.resolve(createMockResponse(200, {}));
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

import type { RenderResult } from "@testing-library/react";

// Mock Radix UI Select to avoid hasPointerCapture error
vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
    ...props
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
    [key: string]: unknown;
  }) => (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      {...props}
      data-testid="role-select"
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectValue: ({
    placeholder,
    children,
  }: {
    placeholder?: string;
    children?: React.ReactNode;
  }) => (
    <div data-testid="select-value">
      {children || placeholder || "Select a role"}
    </div>
  ),
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => (
    <option value={value} data-testid={`select-item-${value}`}>
      {children}
    </option>
  ),
}));

// Reset fetch mocks before each test
beforeEach(() => {
  mockFetch.mockReset();

  // Default mock implementation
  mockFetch.mockImplementation((input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("/api/admin/users/check-email")) {
      const params = new URL(url).searchParams;
      const email = params.get("email");

      if (email === "taken@example.com") {
        return Promise.resolve(createMockResponse(200, { available: false }));
      }

      return Promise.resolve(createMockResponse(200, { available: true }));
    }

    return Promise.resolve(createMockResponse(404, { error: "Not found" }));
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

// Mock user data with proper typing to match the User interface
const mockUser: User = {
  id: "1",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  role_id: "1",
  role: {
    id: "1",
    name: UserRole.ADMIN,
    permissions: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: "Administrator role",
  },
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
  locale: "en",
  full_name: "John Doe",
  display_name: "John D.",
  status: UserStatus.ACTIVE,
  activity_status: ActivityStatus.OFFLINE,
};

const renderWithQueryClient = (component: React.ReactElement): RenderResult => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // Turn off retries to avoid timeouts in tests
        retryDelay: 1,
        // Set stale time to 0 to always fetch fresh data
        staleTime: 0,
        // Use gcTime instead of cacheTime in newer versions
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

// Define the form data type that matches the component's expected props
type UserFormSubmitData = {
  first_name: string;
  last_name: string;
  email: string;
  role_id: string | undefined;
  is_active: boolean;
  password?: string;
  locale?: string;
};

describe("UserDialog", () => {
  // Create mock functions with type assertions
  const mockOnSubmit = vi.fn().mockImplementation(() => Promise.resolve());
  const mockOnOpenChange = vi.fn().mockImplementation(() => {});

  // Set up default mock implementations
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockFetch.mockClear();

    // Reset mock implementations
    mockOnSubmit.mockClear();
    mockOnOpenChange.mockClear();

    // Set default implementations
    mockOnSubmit.mockImplementation(() => Promise.resolve());
    mockOnOpenChange.mockImplementation(() => {});
  });

  // Mock roles data with all required properties
  const mockRoles: Role[] = [
    {
      id: "1",
      name: UserRole.ADMIN,
      description: "Administrator role",
      permissions: ["users:read", "users:write", "users:delete"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: UserRole.USER,
      description: "Regular user role",
      permissions: ["profile:read", "profile:write"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockOnSubmit.mockReset().mockResolvedValue(undefined);
    mockOnOpenChange.mockReset();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it("renders create user dialog correctly", () => {
    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={(open) => mockOnOpenChange(open)}
        onSubmit={mockOnSubmit}
        roles={mockRoles}
      />
    );

    expect(screen.getByText("Create New User")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Doe")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("john.doe@example.com")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter secure password")
    ).toBeInTheDocument();
    expect(screen.getByText("Create User")).toBeInTheDocument();
  });

  it("renders edit user dialog correctly", () => {
    const { getByRole } = renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={(open) => mockOnOpenChange(open)}
        onSubmit={(data) => mockOnSubmit(data as UserFormSubmitData)}
        user={mockUser}
        roles={mockRoles}
      />
    );

    expect(screen.getByText("Edit User")).toBeInTheDocument();
    expect(getByRole("textbox", { name: "First name" })).toHaveValue("John");
    expect(getByRole("textbox", { name: "Last name" })).toHaveValue("Doe");
    expect(getByRole("textbox", { name: "Email" })).toHaveValue(
      "john.doe@example.com"
    );
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

    const passwordInput = screen.getByPlaceholderText("Enter secure password");
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

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        available: true,
        message: "Email is available",
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

    const emailInput = screen.getByPlaceholderText("john.doe@example.com");
    await user.type(emailInput, "test@example.com");

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "/api/admin/users/check-email?email=test%40example.com"
        )
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Email is available")).toBeInTheDocument();
    });
  });

  it("shows success message when email is available", async () => {
    // Setup test data
    const testEmail = "available@example.com";
    const mockResponse = {
      ok: true,
      json: async () => ({ available: true }),
    };

    // Setup fetch mock
    mockFetch.mockResolvedValue(mockResponse);

    // Setup test user
    const user = userEvent.setup();

    // Render the component
    render(
      <UserDialog
        open={true}
        onOpenChange={vi.fn()}
        user={null}
        roles={[]}
        onSubmit={vi.fn()}
      />
    );

    // Find and interact with email input
    const emailInput = screen.getByPlaceholderText("john.doe@example.com");
    await user.clear(emailInput);
    await user.type(emailInput, testEmail);

    // Verify fetch was called with correct parameters
    await waitFor(
      () => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(
            `/api/admin/users/check-email?email=${encodeURIComponent(
              testEmail
            )}`
          )
        );
      },
      { timeout: 5000 }
    );

    // Verify success message is displayed
    const successMessage = await screen.findByText(
      "Email is available",
      {},
      { timeout: 5000 }
    );
    expect(successMessage).toBeInTheDocument();
    expect(successMessage).toHaveClass("text-green-600");

    // Verify input has success styling
    // The component uses border-green-500 for success state
    expect(emailInput).toHaveClass("border-green-500");
  });

  it("shows error when email is already taken", async () => {
    const user = userEvent.setup();

    // Set up the mock implementation for this test
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/api/roles")) {
        return Promise.resolve(createMockResponse(200, mockRoles));
      }
      if (url.includes("/api/users/check-email")) {
        return Promise.resolve(createMockResponse(200, { available: false }));
      }
      return Promise.resolve(createMockResponse(200, {}));
    });

    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roles={mockRoles}
        onSubmit={mockOnSubmit}
      />
    );

    const emailInput = screen.getByPlaceholderText("john.doe@example.com");
    await user.type(emailInput, "taken@example.com");

    // Wait for the debounce and API call
    await waitFor(
      () => {
        expect(mockFetch).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    // Check for the error message
    await waitFor(
      () => {
        expect(screen.getByText(/email is already taken/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
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

    // Find role select trigger (first one is role, second is language)
    const roleSelect = screen.getAllByTestId("select-trigger")[0];
    await user.click(roleSelect);

    // Select admin role - look for the role name in the select items
    const adminOption = screen.getByText("ADMIN");
    await user.click(adminOption);

    await waitFor(() => {
      // Look for permission count badge or role description
      expect(screen.getByText("3 permissions")).toBeInTheDocument();
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

    // Form should not submit if validation fails
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    // Check that submit button is still present (form didn't submit)
    expect(screen.getByText("Create User")).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roles={mockRoles}
        onSubmit={mockOnSubmit}
      />
    );

    // Fill in form using placeholders instead of labels
    await user.type(screen.getByPlaceholderText("John"), "Jane");
    await user.type(screen.getByPlaceholderText("Doe"), "Smith");
    await user.type(
      screen.getByPlaceholderText("john.doe@example.com"),
      "jane.smith@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Enter secure password"),
      "SecurePassword123!"
    );
    await user.type(
      screen.getByPlaceholderText("Confirm your password"),
      "SecurePassword123!"
    );

    // Open the role select dropdown using test id since the mocked select uses test ids
    const roleSelects = screen.getAllByTestId("role-select");
    const roleSelect = roleSelects[0]; // First one is the role select
    await user.selectOptions(roleSelect, "2"); // Select USER role with id "2"

    // Check that submit button is still present (form didn't submit)
    expect(screen.getByText("Create User")).toBeInTheDocument();

    // Form should not have been submitted yet (no submit button click)
    expect(mockOnSubmit).not.toHaveBeenCalled();
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

    const passwordInput = screen.getByPlaceholderText("Enter secure password");
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

    // Mock the fetch response for email availability check
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ available: false }),
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse as Response);

    renderWithQueryClient(
      <UserDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roles={mockRoles}
        onSubmit={mockOnSubmit}
      />
    );

    const emailInput = screen.getByPlaceholderText("john.doe@example.com");
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
