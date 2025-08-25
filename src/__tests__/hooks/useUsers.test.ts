import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useBulkDeleteUsers,
} from "@/hooks/useUsers";
import { userApi } from "@/lib/api";
import { toast } from "sonner";

// Mock dependencies
vi.mock("@/lib/api");
vi.mock("sonner");
vi.mock("@/store/userStore", () => ({
  useUserStore: () => ({
    userFilters: {
      search: "",
      role: null,
      status: null,
      dateRange: null,
      sortBy: "created_at",
      sortOrder: "desc",
    },
    clearSelection: vi.fn(),
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
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useUsers hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should fetch users successfully", async () => {
    (userApi.getUsers as any).mockResolvedValue(mockUsersResponse);

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
    const error = new Error("Failed to fetch users");
    (userApi.getUsers as any).mockRejectedValue(error);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });

  it("should apply client-side filtering", async () => {
    const mockStore = {
      userFilters: {
        search: "john",
        role: null,
        status: null,
        dateRange: null,
        sortBy: "created_at",
        sortOrder: "desc",
      },
      clearSelection: vi.fn(),
    };

    vi.mocked(require("@/store/userStore").useUserStore).mockReturnValue(
      mockStore
    );
    (userApi.getUsers as any).mockResolvedValue(mockUsersResponse);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.users).toHaveLength(1);
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
      status: "active" as const,
      activity_status: "never" as const,
    };

    (userApi.createUser as any).mockResolvedValue(newUser);

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

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(userApi.createUser).toHaveBeenCalledWith(userData);
    expect(toast.success).toHaveBeenCalledWith("Tạo người dùng thành công!");
  });

  it("should handle create user errors", async () => {
    const error = new Error("Email already exists");
    (userApi.createUser as any).mockRejectedValue(error);

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

    expect(toast.error).toHaveBeenCalledWith("Email already exists");
  });
});

describe("useUpdateUser hook", () => {
  it("should update user successfully", async () => {
    const updatedUser = {
      ...mockUsersResponse.users[0],
      first_name: "Updated",
      full_name: "Updated Doe",
    };

    (userApi.updateUser as any).mockResolvedValue(updatedUser);

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
    expect(toast.success).toHaveBeenCalledWith(
      "Cập nhật người dùng thành công!"
    );
  });

  it("should handle update user errors", async () => {
    const error = new Error("User not found");
    (userApi.updateUser as any).mockRejectedValue(error);

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

    expect(toast.error).toHaveBeenCalledWith("User not found");
  });
});

describe("useDeleteUser hook", () => {
  it("should delete user successfully", async () => {
    (userApi.deleteUser as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("user-1");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(userApi.deleteUser).toHaveBeenCalledWith("user-1");
    expect(toast.success).toHaveBeenCalledWith("Xóa người dùng thành công!");
  });

  it("should handle delete user errors", async () => {
    const error = new Error("Cannot delete user");
    (userApi.deleteUser as any).mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("user-1");

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith("Cannot delete user");
  });
});

describe("useBulkDeleteUsers hook", () => {
  it("should bulk delete users successfully", async () => {
    (userApi.deleteUser as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useBulkDeleteUsers(), {
      wrapper: createWrapper(),
    });

    const userIds = ["user-1", "user-2"];
    result.current.mutate(userIds);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(userApi.deleteUser).toHaveBeenCalledTimes(2);
    expect(userApi.deleteUser).toHaveBeenCalledWith("user-1");
    expect(userApi.deleteUser).toHaveBeenCalledWith("user-2");
    expect(toast.success).toHaveBeenCalledWith("Đã xóa 2 người dùng!");
  });

  it("should handle partial failures in bulk delete", async () => {
    (userApi.deleteUser as any)
      .mockResolvedValueOnce(undefined) // user-1 success
      .mockRejectedValueOnce(new Error("Cannot delete user-2")); // user-2 fails

    const { result } = renderHook(() => useBulkDeleteUsers(), {
      wrapper: createWrapper(),
    });

    const userIds = ["user-1", "user-2"];
    result.current.mutate(userIds);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(userApi.deleteUser).toHaveBeenCalledTimes(2);
    expect(toast.error).toHaveBeenCalled();
  });
});
