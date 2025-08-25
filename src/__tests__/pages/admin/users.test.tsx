import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UsersPage from "@/app/admin/users/page";

// Mock fetch
global.fetch = jest.fn();

const mockUsers = {
  data: [
    {
      id: "1",
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      role_id: "role1",
    },
  ],
};

const mockRoles = {
  data: [
    {
      id: "role1",
      name: "Admin",
    },
  ],
};

describe("UsersPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    (fetch as jest.Mock).mockClear();
  });

  it("should render loading state initially", () => {
    (fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <QueryClientProvider client={queryClient}>
        <UsersPage />
      </QueryClientProvider>
    );

    expect(screen.getByText("Loading users...")).toBeInTheDocument();
  });

  it("should render users when API returns data", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles,
      });

    render(
      <QueryClientProvider client={queryClient}>
        <UsersPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("should handle API errors gracefully", async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(
      <QueryClientProvider client={queryClient}>
        <UsersPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Error Loading Data")).toBeInTheDocument();
    });
  });
});
