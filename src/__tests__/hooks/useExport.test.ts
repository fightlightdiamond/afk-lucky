import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useExport } from "@/hooks/useExport";
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

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
Object.defineProperty(URL, "createObjectURL", {
  value: mockCreateObjectURL,
});
Object.defineProperty(URL, "revokeObjectURL", {
  value: mockRevokeObjectURL,
});

// Mock document.createElement and click
const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockCreateElement = vi.fn(() => ({
  href: "",
  download: "",
  click: mockClick,
}));

Object.defineProperty(document, "createElement", {
  value: mockCreateElement,
});

Object.defineProperty(document.body, "appendChild", {
  value: mockAppendChild,
});

Object.defineProperty(document.body, "removeChild", {
  value: mockRemoveChild,
});

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

describe("useExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL.mockReturnValue("blob:mock-url");
  });

  describe("exportUsers", () => {
    it("should export users as CSV successfully", async () => {
      const csvData = "id,email,first_name,last_name\n1,john@test.com,John,Doe";
      const mockBlob = new Blob([csvData], { type: "text/csv" });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        headers: new Headers({
          "content-disposition": 'attachment; filename="users.csv"',
        }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useExport(), { wrapper });

      const filters = {
        search: "john",
        role: "USER",
        status: "active" as const,
        dateRange: null,
        sortBy: "email" as const,
        sortOrder: "asc" as const,
      };

      result.current.exportUsers.mutate({
        format: "csv",
        filters,
      });

      await waitFor(() => {
        expect(result.current.exportUsers.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/admin/users/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format: "csv",
          filters,
        }),
      });

      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "Users exported successfully",
      });
    });

    it("should export users as Excel successfully", async () => {
      const excelData = new ArrayBuffer(8);
      const mockBlob = new Blob([excelData], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        headers: new Headers({
          "content-disposition": 'attachment; filename="users.xlsx"',
        }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useExport(), { wrapper });

      result.current.exportUsers.mutate({
        format: "excel",
        filters: {
          search: "",
          role: null,
          status: null,
          dateRange: null,
          sortBy: "full_name",
          sortOrder: "asc",
        },
      });

      await waitFor(() => {
        expect(result.current.exportUsers.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/admin/users/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format: "excel",
          filters: {
            search: "",
            role: null,
            status: null,
            dateRange: null,
            sortBy: "full_name",
            sortOrder: "asc",
          },
        }),
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "Users exported successfully",
      });
    });

    it("should handle export with date range filters", async () => {
      const csvData = "id,email,first_name,last_name\n1,john@test.com,John,Doe";
      const mockBlob = new Blob([csvData], { type: "text/csv" });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        headers: new Headers({
          "content-disposition": 'attachment; filename="users.csv"',
        }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useExport(), { wrapper });

      const dateRange = {
        from: new Date("2024-01-01"),
        to: new Date("2024-12-31"),
      };

      result.current.exportUsers.mutate({
        format: "csv",
        filters: {
          search: "",
          role: null,
          status: null,
          dateRange,
          sortBy: "created_at",
          sortOrder: "desc",
        },
      });

      await waitFor(() => {
        expect(result.current.exportUsers.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/admin/users/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format: "csv",
          filters: {
            search: "",
            role: null,
            status: null,
            dateRange,
            sortBy: "created_at",
            sortOrder: "desc",
          },
        }),
      });
    });

    it("should extract filename from content-disposition header", async () => {
      const csvData = "id,email,first_name,last_name\n1,john@test.com,John,Doe";
      const mockBlob = new Blob([csvData], { type: "text/csv" });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        headers: new Headers({
          "content-disposition":
            'attachment; filename="filtered-users-2024.csv"',
        }),
      });

      const mockAnchor = {
        href: "",
        download: "",
        click: mockClick,
      };
      mockCreateElement.mockReturnValueOnce(mockAnchor);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useExport(), { wrapper });

      result.current.exportUsers.mutate({
        format: "csv",
        filters: {
          search: "",
          role: null,
          status: null,
          dateRange: null,
          sortBy: "full_name",
          sortOrder: "asc",
        },
      });

      await waitFor(() => {
        expect(result.current.exportUsers.isSuccess).toBe(true);
      });

      expect(mockAnchor.download).toBe("filtered-users-2024.csv");
    });

    it("should use default filename when content-disposition is missing", async () => {
      const csvData = "id,email,first_name,last_name\n1,john@test.com,John,Doe";
      const mockBlob = new Blob([csvData], { type: "text/csv" });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        headers: new Headers(),
      });

      const mockAnchor = {
        href: "",
        download: "",
        click: mockClick,
      };
      mockCreateElement.mockReturnValueOnce(mockAnchor);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useExport(), { wrapper });

      result.current.exportUsers.mutate({
        format: "csv",
        filters: {
          search: "",
          role: null,
          status: null,
          dateRange: null,
          sortBy: "full_name",
          sortOrder: "asc",
        },
      });

      await waitFor(() => {
        expect(result.current.exportUsers.isSuccess).toBe(true);
      });

      expect(mockAnchor.download).toBe("users.csv");
    });

    it("should handle export errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Export failed",
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useExport(), { wrapper });

      result.current.exportUsers.mutate({
        format: "csv",
        filters: {
          search: "",
          role: null,
          status: null,
          dateRange: null,
          sortBy: "full_name",
          sortOrder: "asc",
        },
      });

      await waitFor(() => {
        expect(result.current.exportUsers.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Export failed",
        variant: "destructive",
      });
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useExport(), { wrapper });

      result.current.exportUsers.mutate({
        format: "csv",
        filters: {
          search: "",
          role: null,
          status: null,
          dateRange: null,
          sortBy: "full_name",
          sortOrder: "asc",
        },
      });

      await waitFor(() => {
        expect(result.current.exportUsers.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to export users",
        variant: "destructive",
      });
    });

    it("should handle empty export results", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            error: "No users found matching the criteria",
          }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useExport(), { wrapper });

      result.current.exportUsers.mutate({
        format: "csv",
        filters: {
          search: "nonexistent",
          role: null,
          status: null,
          dateRange: null,
          sortBy: "full_name",
          sortOrder: "asc",
        },
      });

      await waitFor(() => {
        expect(result.current.exportUsers.isError).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "No users found matching the criteria",
        variant: "destructive",
      });
    });

    it("should handle large export files", async () => {
      // Simulate a large CSV file
      const largeData =
        "id,email,first_name,last_name\n" +
        Array.from(
          { length: 10000 },
          (_, i) => `${i},user${i}@test.com,User,${i}`
        ).join("\n");

      const mockBlob = new Blob([largeData], { type: "text/csv" });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        headers: new Headers({
          "content-disposition": 'attachment; filename="large-export.csv"',
        }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useExport(), { wrapper });

      result.current.exportUsers.mutate({
        format: "csv",
        filters: {
          search: "",
          role: null,
          status: null,
          dateRange: null,
          sortBy: "full_name",
          sortOrder: "asc",
        },
      });

      await waitFor(() => {
        expect(result.current.exportUsers.isSuccess).toBe(true);
      });

      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });

  describe("loading states", () => {
    it("should track loading state during export", async () => {
      const csvData = "id,email,first_name,last_name\n1,john@test.com,John,Doe";
      const mockBlob = new Blob([csvData], { type: "text/csv" });

      // Mock delayed response
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  blob: () => Promise.resolve(mockBlob),
                  headers: new Headers({
                    "content-disposition": 'attachment; filename="users.csv"',
                  }),
                }),
              100
            )
          )
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useExport(), { wrapper });

      expect(result.current.exportUsers.isPending).toBe(false);

      result.current.exportUsers.mutate({
        format: "csv",
        filters: {
          search: "",
          role: null,
          status: null,
          dateRange: null,
          sortBy: "full_name",
          sortOrder: "asc",
        },
      });

      expect(result.current.exportUsers.isPending).toBe(true);

      await waitFor(() => {
        expect(result.current.exportUsers.isPending).toBe(false);
      });
    });

    it("should provide isLoading convenience property", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useExport(), { wrapper });

      expect(result.current.isLoading).toBe(false);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(new Blob()),
        headers: new Headers(),
      });

      result.current.exportUsers.mutate({
        format: "csv",
        filters: {
          search: "",
          role: null,
          status: null,
          dateRange: null,
          sortBy: "full_name",
          sortOrder: "asc",
        },
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("cleanup", () => {
    it("should cleanup blob URL after download", async () => {
      const csvData = "id,email,first_name,last_name\n1,john@test.com,John,Doe";
      const mockBlob = new Blob([csvData], { type: "text/csv" });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        headers: new Headers({
          "content-disposition": 'attachment; filename="users.csv"',
        }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useExport(), { wrapper });

      result.current.exportUsers.mutate({
        format: "csv",
        filters: {
          search: "",
          role: null,
          status: null,
          dateRange: null,
          sortBy: "full_name",
          sortOrder: "asc",
        },
      });

      await waitFor(() => {
        expect(result.current.exportUsers.isSuccess).toBe(true);
      });

      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("should cleanup DOM elements after download", async () => {
      const csvData = "id,email,first_name,last_name\n1,john@test.com,John,Doe";
      const mockBlob = new Blob([csvData], { type: "text/csv" });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        headers: new Headers({
          "content-disposition": 'attachment; filename="users.csv"',
        }),
      });

      const mockAnchor = {
        href: "",
        download: "",
        click: mockClick,
      };
      mockCreateElement.mockReturnValueOnce(mockAnchor);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useExport(), { wrapper });

      result.current.exportUsers.mutate({
        format: "csv",
        filters: {
          search: "",
          role: null,
          status: null,
          dateRange: null,
          sortBy: "full_name",
          sortOrder: "asc",
        },
      });

      await waitFor(() => {
        expect(result.current.exportUsers.isSuccess).toBe(true);
      });

      expect(mockAppendChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockAnchor);
    });
  });
});
