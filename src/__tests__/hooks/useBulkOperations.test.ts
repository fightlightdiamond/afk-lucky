import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useBulkOperations } from "@/hooks/useBulkOperations";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useBulkOperations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUsers = [
    {
      id: "user1",
      email: "user1@example.com",
      first_name: "User",
      last_name: "One",
      full_name: "User One",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      status: "active" as const,
      activity_status: "online" as const,
      role: null,
    },
    {
      id: "user2",
      email: "user2@example.com",
      first_name: "User",
      last_name: "Two",
      full_name: "User Two",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      status: "active" as const,
      activity_status: "online" as const,
      role: null,
    },
  ];

  describe("startBulkOperation", () => {
    it("should start a bulk ban operation", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      act(() => {
        result.current.startBulkOperation("ban", mockUsers);
      });

      expect(result.current.isConfirmDialogOpen).toBe(true);
      expect(result.current.currentOperation).toBe("ban");
      expect(result.current.selectedUsers).toEqual(mockUsers);
    });

    it("should execute bulk operation successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: 2,
            failed: 0,
            total: 2,
            skipped: 0,
            errors: [],
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      // Start the operation
      act(() => {
        result.current.startBulkOperation("ban", mockUsers);
      });

      // Confirm the operation
      act(() => {
        result.current.confirmOperation();
      });

      await waitFor(() => {
        expect(result.current.isResultDialogOpen).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/admin/users/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "ban",
          userIds: ["user1", "user2"],
        }),
      });

      expect(result.current.result?.success).toBe(2);
    });

    it("should handle operation errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Cannot ban your own account",
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      // Start the operation
      act(() => {
        result.current.startBulkOperation("ban", [mockUsers[0]]);
      });

      // Confirm the operation
      act(() => {
        result.current.confirmOperation();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe("dialog controls", () => {
    it("should control dialog states", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      // Start operation opens confirm dialog
      act(() => {
        result.current.startBulkOperation("delete", mockUsers);
      });

      expect(result.current.isConfirmDialogOpen).toBe(true);

      // Close confirm dialog
      act(() => {
        result.current.closeConfirmDialog();
      });

      expect(result.current.isConfirmDialogOpen).toBe(false);
    });
  });

  describe("loading states", () => {
    it("should track loading state", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });

  describe("operation types", () => {
    it("should support different operation types", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      // Test delete operation
      act(() => {
        result.current.startBulkOperation("delete", mockUsers);
      });

      expect(result.current.currentOperation).toBe("delete");

      // Test assign_role operation
      const mockRole = {
        id: "role-1",
        name: "ADMIN",
        permissions: ["user:read", "user:write"],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      act(() => {
        result.current.startBulkOperation("assign_role", mockUsers, mockRole);
      });

      expect(result.current.currentOperation).toBe("assign_role");
      expect(result.current.selectedRole).toEqual(mockRole);
    });
  });

  describe("callbacks", () => {
    it("should call success callback", async () => {
      const onSuccess = vi.fn();
      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations({ onSuccess }), {
        wrapper,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: 1,
            failed: 0,
            total: 1,
            skipped: 0,
            errors: [],
          }),
      });

      act(() => {
        result.current.startBulkOperation("ban", [mockUsers[0]]);
      });

      act(() => {
        result.current.confirmOperation();
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it("should call error callback", async () => {
      const onError = vi.fn();
      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkOperations({ onError }), {
        wrapper,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Operation failed",
          }),
      });

      act(() => {
        result.current.startBulkOperation("ban", [mockUsers[0]]);
      });

      act(() => {
        result.current.confirmOperation();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });
});
