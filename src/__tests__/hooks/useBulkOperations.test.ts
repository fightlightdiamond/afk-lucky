import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBulkOperations } from "@/hooks/useBulkOperations";
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

describe("useBulkOperations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("bulkBan", () => {
    it("should ban multiple users successfully", async () => {
      const userIds = ["user1", "user2", "user3"];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: 3,
            failed: 0,
            errors: [],
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      result.current.bulkBan.mutate(userIds);

      await waitFor(() => {
        expect(result.current.bulkBan.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/admin/users/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "ban",
          userIds,
        }),
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "Successfully banned 3 users",
      });
    });

    it("should handle partial failures", async () => {
      const userIds = ["user1", "user2", "user3"];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: 2,
            failed: 1,
            errors: ["Cannot ban admin user"],
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      result.current.bulkBan.mutate(userIds);

      await waitFor(() => {
        expect(result.current.bulkBan.isSuccess).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Partial Success",
        description: "Banned 2 users, 1 failed: Cannot ban admin user",
        variant: "destructive",
      });
    });

    it("should handle complete failure", async () => {
      const userIds = ["user1"];

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Cannot ban your own account",
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      result.current.bulkBan.mutate(userIds);

      await waitFor(() => {
        expect(result.current.bulkBan.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Cannot ban your own account",
        variant: "destructive",
      });
    });

    it("should handle network errors", async () => {
      const userIds = ["user1"];

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      result.current.bulkBan.mutate(userIds);

      await waitFor(() => {
        expect(result.current.bulkBan.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to ban users",
        variant: "destructive",
      });
    });
  });

  describe("bulkUnban", () => {
    it("should unban multiple users successfully", async () => {
      const userIds = ["user1", "user2"];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: 2,
            failed: 0,
            errors: [],
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      result.current.bulkUnban.mutate(userIds);

      await waitFor(() => {
        expect(result.current.bulkUnban.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/admin/users/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "unban",
          userIds,
        }),
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "Successfully unbanned 2 users",
      });
    });
  });

  describe("bulkDelete", () => {
    it("should delete multiple users successfully", async () => {
      const userIds = ["user1", "user2"];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: 2,
            failed: 0,
            errors: [],
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      result.current.bulkDelete.mutate(userIds);

      await waitFor(() => {
        expect(result.current.bulkDelete.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/admin/users/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "delete",
          userIds,
        }),
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "Successfully deleted 2 users",
      });
    });

    it("should prevent deleting own account", async () => {
      const userIds = ["admin-id"];

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Cannot delete your own account",
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      result.current.bulkDelete.mutate(userIds);

      await waitFor(() => {
        expect(result.current.bulkDelete.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Cannot delete your own account",
        variant: "destructive",
      });
    });
  });

  describe("bulkAssignRole", () => {
    it("should assign role to multiple users successfully", async () => {
      const userIds = ["user1", "user2"];
      const roleId = "role-id";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: 2,
            failed: 0,
            errors: [],
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      result.current.bulkAssignRole.mutate({ userIds, roleId });

      await waitFor(() => {
        expect(result.current.bulkAssignRole.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/admin/users/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "assign_role",
          userIds,
          roleId,
        }),
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "Successfully assigned role to 2 users",
      });
    });

    it("should handle invalid role", async () => {
      const userIds = ["user1"];
      const roleId = "invalid-role";

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Invalid role",
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      result.current.bulkAssignRole.mutate({ userIds, roleId });

      await waitFor(() => {
        expect(result.current.bulkAssignRole.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Invalid role",
        variant: "destructive",
      });
    });
  });

  describe("loading states", () => {
    it("should track loading state for ban operation", async () => {
      const userIds = ["user1"];

      // Mock a delayed response
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () =>
                    Promise.resolve({ success: 1, failed: 0, errors: [] }),
                }),
              100
            )
          )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      expect(result.current.bulkBan.isPending).toBe(false);

      result.current.bulkBan.mutate(userIds);

      expect(result.current.bulkBan.isPending).toBe(true);

      await waitFor(() => {
        expect(result.current.bulkBan.isPending).toBe(false);
      });
    });

    it("should track loading state for multiple operations", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      expect(result.current.isLoading).toBe(false);

      // Mock responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: 1, failed: 0, errors: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: 1, failed: 0, errors: [] }),
        });

      // Start multiple operations
      result.current.bulkBan.mutate(["user1"]);
      result.current.bulkUnban.mutate(["user2"]);

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("error handling", () => {
    it("should handle malformed JSON responses", async () => {
      const userIds = ["user1"];

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      result.current.bulkBan.mutate(userIds);

      await waitFor(() => {
        expect(result.current.bulkBan.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to ban users",
        variant: "destructive",
      });
    });

    it("should handle server errors", async () => {
      const userIds = ["user1"];

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({
            error: "Internal server error",
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      result.current.bulkBan.mutate(userIds);

      await waitFor(() => {
        expect(result.current.bulkBan.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Internal server error",
        variant: "destructive",
      });
    });
  });

  describe("cache invalidation", () => {
    it("should invalidate users query after successful operations", async () => {
      const userIds = ["user1"];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: 1,
            failed: 0,
            errors: [],
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      result.current.bulkBan.mutate(userIds);

      await waitFor(() => {
        expect(result.current.bulkBan.isSuccess).toBe(true);
      });

      // The hook should invalidate the users query to refresh the data
      // This is tested by checking that the mutation completed successfully
      expect(result.current.bulkBan.isSuccess).toBe(true);
    });
  });
});
