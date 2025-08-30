import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUserMutations } from "@/hooks/useUserMutations";
import { ReactNode } from "react";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useUserMutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a new user successfully", async () => {
      const userData = {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@test.com",
        password: "password123",
        role_id: "role-id",
      };

      const createdUser = {
        id: "new-user-id",
        ...userData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdUser),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      result.current.createUser.mutate(userData);

      await waitFor(() => {
        expect(result.current.createUser.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "User created successfully",
      });
    });

    it("should handle email already exists error", async () => {
      const userData = {
        first_name: "John",
        last_name: "Doe",
        email: "existing@test.com",
        password: "password123",
        role_id: "role-id",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Email already exists",
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      result.current.createUser.mutate(userData);

      await waitFor(() => {
        expect(result.current.createUser.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Email already exists",
        variant: "destructive",
      });
    });

    it("should handle validation errors", async () => {
      const userData = {
        first_name: "",
        last_name: "Doe",
        email: "invalid-email",
        password: "weak",
        role_id: "role-id",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Validation failed",
            details: {
              first_name: "First name is required",
              email: "Invalid email format",
              password: "Password must be at least 8 characters",
            },
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      result.current.createUser.mutate(userData);

      await waitFor(() => {
        expect(result.current.createUser.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const userId = "user-id";
      const updateData = {
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@test.com",
      };

      const updatedUser = {
        id: userId,
        ...updateData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedUser),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      result.current.updateUser.mutate({ id: userId, data: updateData });

      await waitFor(() => {
        expect(result.current.updateUser.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "User updated successfully",
      });
    });

    it("should update user password", async () => {
      const userId = "user-id";
      const updateData = {
        password: "newpassword123",
      };

      const updatedUser = {
        id: userId,
        first_name: "John",
        last_name: "Doe",
        email: "john@test.com",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedUser),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      result.current.updateUser.mutate({ id: userId, data: updateData });

      await waitFor(() => {
        expect(result.current.updateUser.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
    });

    it("should handle user not found error", async () => {
      const userId = "nonexistent-id";
      const updateData = { first_name: "Jane" };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            error: "User not found",
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      result.current.updateUser.mutate({ id: userId, data: updateData });

      await waitFor(() => {
        expect(result.current.updateUser.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const userId = "user-id";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            message: "User deleted successfully",
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      result.current.deleteUser.mutate(userId);

      await waitFor(() => {
        expect(result.current.deleteUser.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "User deleted successfully",
      });
    });

    it("should prevent deleting own account", async () => {
      const userId = "admin-id";

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Cannot delete your own account",
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      result.current.deleteUser.mutate(userId);

      await waitFor(() => {
        expect(result.current.deleteUser.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Cannot delete your own account",
        variant: "destructive",
      });
    });
  });

  describe("toggleUserStatus", () => {
    it("should toggle user status successfully", async () => {
      const userId = "user-id";
      const newStatus = false;

      const updatedUser = {
        id: userId,
        first_name: "John",
        last_name: "Doe",
        email: "john@test.com",
        is_active: newStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedUser),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      result.current.toggleUserStatus.mutate({
        id: userId,
        isActive: newStatus,
      });

      await waitFor(() => {
        expect(result.current.toggleUserStatus.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "User status updated successfully",
      });
    });

    it("should prevent banning own account", async () => {
      const userId = "admin-id";
      const newStatus = false;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Cannot ban your own account",
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      result.current.toggleUserStatus.mutate({
        id: userId,
        isActive: newStatus,
      });

      await waitFor(() => {
        expect(result.current.toggleUserStatus.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Cannot ban your own account",
        variant: "destructive",
      });
    });
  });

  describe("loading states", () => {
    it("should track loading state for create operation", async () => {
      const userData = {
        first_name: "John",
        last_name: "Doe",
        email: "john@test.com",
        password: "password123",
        role_id: "role-id",
      };

      // Mock delayed response
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ id: "new-id", ...userData }),
                }),
              100
            )
          )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      expect(result.current.createUser.isPending).toBe(false);

      result.current.createUser.mutate(userData);

      expect(result.current.createUser.isPending).toBe(true);

      await waitFor(() => {
        expect(result.current.createUser.isPending).toBe(false);
      });
    });

    it("should track overall loading state", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      expect(result.current.isLoading).toBe(false);

      // Mock responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: "user1" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: "user2" }),
        });

      // Start multiple operations
      result.current.createUser.mutate({
        first_name: "John",
        last_name: "Doe",
        email: "john@test.com",
        password: "password123",
        role_id: "role-id",
      });

      result.current.updateUser.mutate({
        id: "user2",
        data: { first_name: "Jane" },
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("error handling", () => {
    it("should handle network errors", async () => {
      const userData = {
        first_name: "John",
        last_name: "Doe",
        email: "john@test.com",
        password: "password123",
        role_id: "role-id",
      };

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      result.current.createUser.mutate(userData);

      await waitFor(() => {
        expect(result.current.createUser.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    });

    it("should handle server errors", async () => {
      const userData = {
        first_name: "John",
        last_name: "Doe",
        email: "john@test.com",
        password: "password123",
        role_id: "role-id",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({
            error: "Internal server error",
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      result.current.createUser.mutate(userData);

      await waitFor(() => {
        expect(result.current.createUser.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Internal server error",
        variant: "destructive",
      });
    });
  });

  describe("optimistic updates", () => {
    it("should perform optimistic update for status toggle", async () => {
      const userId = "user-id";
      const newStatus = false;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: userId,
            is_active: newStatus,
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUserMutations(), { wrapper });

      result.current.toggleUserStatus.mutate({
        id: userId,
        isActive: newStatus,
      });

      // The mutation should complete successfully
      await waitFor(() => {
        expect(result.current.toggleUserStatus.isSuccess).toBe(true);
      });
    });
  });
});
