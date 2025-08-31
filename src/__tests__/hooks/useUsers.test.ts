import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useBulkDeleteUsers,
} from "@/hooks/useUsers";
import { userApi } from "@/lib/api";

// Mock dependencies
vi.mock("@/lib/api", () => ({
  userApi: {
    getUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    bulkOperation: vi.fn(),
  },
}));

vi.mock("@/lib/error-handling", () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    handleSuccess: vi.fn(),
    handleWarning: vi.fn(),
  }),
  createRetryHandler: (fn: any, retries: number, delay: number) => {
    // Return a function that just calls the original function without retry logic for tests
    return (...args: any[]) => fn(...args);
  },
}));

vi.mock("@/store/userStore", () => ({
  useUserStore: () => ({
    userFilters: {
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
    },
    clearSelection: vi.fn(),
    addOptimisticUpdate: vi.fn(),
    removeOptimisticUpdate: vi.fn(),
  }),
}));

const mockUsersResponse = {
  users: [
    {
      id: "user-1",
      email: "john@example.com",
      first_name: "John",
      last_name: "Doe",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      last_login: "2024-01-15T10:00:00Z",
      last_logout: null,
      avatar: null,
      role: {
        id: "role-1",
        name: "USER",
        permissions: ["read:profile"],
        description: "Regular user",
      },
      full_name: "John Doe",
      status: "active" as const,
      activity_status: "offline" as const,
    },
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 1,
  },
  filters: {
    search: "",
    role: null,
    status: null,
    dateRange: null,
    sortBy: "created_at" as const,
    sortOrder: "desc" as const,
  },
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        retryDelay: 0,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
        retryDelay: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useUsers hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock responses
    vi.mocked(userApi.getUsers).mockResolvedValue(mockUsersResponse);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should fetch users successfully", async () => {
    vi.mocked(userApi.getUsers).mockResolvedValue(mockUsersResponse);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.users).toHaveLength(1);
    expect(result.current.data?.users[0].full_name).toBe("John Doe");
    expect(userApi.getUsers).toHaveBeenCalled();
  });

  it("should handle fetch errors", async () => {
    const error = {
      message: "Failed to fetch users",
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
    };
    vi.mocked(userApi.getUsers).mockRejectedValue(error);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    // Wait for the query to settle (either success or error)
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 }
    );

    // Check that it's in error state
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(error);
  });

  it("should use provided params for filtering", async () => {
    const params = {
      search: "john",
      role: "USER",
      status: "active" as const,
      page: 1,
      pageSize: 20,
    };

    vi.mocked(userApi.getUsers).mockResolvedValue(mockUsersResponse);

    const { result } = renderHook(() => useUsers(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(userApi.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "john",
        role: "USER",
        status: "active",
        page: 1,
        pageSize: 20,
      })
    );
  });
});

describe("useCreateUser hook", () => {
  it("should create user successfully", async () => {
    const newUser = {
      id: "new-user",
      email: "new@example.com",
      first_name: "New",
      last_name: "User",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      last_login: null,
      last_logout: null,
      avatar: null,
      role: null,
      full_name: "New User",
      display_name: "New User",
      status: "active" as const,
      activity_status: "never" as const,
    };

    vi.mocked(userApi.createUser).mockResolvedValue(newUser);

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    const userData = {
      email: "new@example.com",
      first_name: "New",
      last_name: "User",
      password: "password123",
    };

    result.current.mutate(userData);

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 }
    );

    expect(result.current.isSuccess).toBe(true);
    expect(userApi.createUser).toHaveBeenCalledWith(userData);
  });

  it("should handle create user errors", async () => {
    const error = new Error("Email already exists");
    vi.mocked(userApi.createUser).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    const userData = {
      email: "existing@example.com",
      first_name: "Test",
      last_name: "User",
      password: "password123",
    };

    result.current.mutate(userData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});

describe("useUpdateUser hook", () => {
  it("should update user successfully", async () => {
    const updatedUser = {
      ...mockUsersResponse.users[0],
      first_name: "Updated",
      full_name: "Updated Doe",
    };

    const mockResponse = { user: updatedUser };
    vi.mocked(userApi.updateUser).mockResolvedValue(updatedUser);

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createWrapper(),
    });

    const updateData = {
      id: "user-1",
      data: { first_name: "Updated" },
    };

    result.current.mutate(updateData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(userApi.updateUser).toHaveBeenCalledWith("user-1", {
      first_name: "Updated",
    });
  });

  it("should handle update user errors", async () => {
    const error = new Error("User not found");
    vi.mocked(userApi.updateUser).mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createWrapper(),
    });

    const updateData = {
      id: "nonexistent-user",
      data: { first_name: "Updated" },
    };

    result.current.mutate(updateData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});

describe("useDeleteUser hook", () => {
  it("should delete user successfully", async () => {
    vi.mocked(userApi.deleteUser).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("user-1");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(userApi.deleteUser).toHaveBeenCalledWith("user-1");
  });

  it("should handle delete user errors", async () => {
    const error = new Error("Cannot delete user");
    vi.mocked(userApi.deleteUser).mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("user-1");

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});

describe("useBulkDeleteUsers hook", () => {
  it("should bulk delete users successfully", async () => {
    const mockBulkResult = {
      success: 2,
      failed: 0,
      errors: [],
    };
    vi.mocked(userApi.bulkOperation).mockResolvedValue(mockBulkResult);

    const { result } = renderHook(() => useBulkDeleteUsers(), {
      wrapper: createWrapper(),
    });

    const userIds = ["user-1", "user-2"];
    result.current.mutate(userIds);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(userApi.bulkOperation).toHaveBeenCalledWith({
      operation: "delete",
      userIds,
    });
  });

  it("should handle partial failures in bulk delete", async () => {
    const mockBulkResult = {
      success: 1,
      failed: 1,
      errors: ["Cannot delete user-2"],
    };
    vi.mocked(userApi.bulkOperation).mockResolvedValue(mockBulkResult);

    const { result } = renderHook(() => useBulkDeleteUsers(), {
      wrapper: createWrapper(),
    });

    const userIds = ["user-1", "user-2"];
    result.current.mutate(userIds);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(userApi.bulkOperation).toHaveBeenCalledWith({
      operation: "delete",
      userIds,
    });
  });
});
