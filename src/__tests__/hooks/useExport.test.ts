import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useExport } from "@/hooks/useExport";

// Create a simple wrapper for renderHook
const renderHookWithContainer = (hook: () => any) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const result = renderHook(hook, {
    container,
  });

  return result;
};

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
Object.defineProperty(window.URL, "createObjectURL", {
  value: mockCreateObjectURL,
});
Object.defineProperty(window.URL, "revokeObjectURL", {
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

      const { result } = renderHookWithContainer(() => useExport());

      const filters = {
        search: "john",
        role: "USER",
        status: "active" as const,
        dateRange: null,
        sortBy: "email" as const,
        sortOrder: "asc" as const,
      };

      let exportResult;
      await act(async () => {
        exportResult = await result.current.exportUsers(filters, "csv");
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/admin/users/export?format=csv&search=john&role=USER&status=active"
      );

      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

      expect(exportResult).toEqual({
        success: true,
        filename: "users.csv",
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

      const { result } = renderHook(() => useExport());

      const filters = {
        search: "",
        role: null,
        status: null,
        dateRange: null,
        sortBy: "full_name" as const,
        sortOrder: "asc" as const,
      };

      let exportResult;
      await act(async () => {
        exportResult = await result.current.exportUsers(filters, "excel");
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/admin/users/export?format=excel"
      );

      expect(exportResult).toEqual({
        success: true,
        filename: "users.xlsx",
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

      const { result } = renderHook(() => useExport());

      const dateRange = {
        from: new Date("2024-01-01"),
        to: new Date("2024-12-31"),
      };

      const filters = {
        search: "",
        role: null,
        status: null,
        dateRange,
        sortBy: "created_at" as const,
        sortOrder: "desc" as const,
      };

      await act(async () => {
        await result.current.exportUsers(filters, "csv");
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "/api/admin/users/export?format=csv&dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-12-31T00:00:00.000Z"
        )
      );
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

      const { result } = renderHook(() => useExport());

      const filters = {
        search: "",
        role: null,
        status: null,
        dateRange: null,
        sortBy: "full_name" as const,
        sortOrder: "asc" as const,
      };

      let exportResult;
      await act(async () => {
        exportResult = await result.current.exportUsers(filters, "csv");
      });

      expect(mockAnchor.download).toBe("filtered-users-2024.csv");
      expect(exportResult).toEqual({
        success: true,
        filename: "filtered-users-2024.csv",
      });
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

      const { result } = renderHook(() => useExport());

      const filters = {
        search: "",
        role: null,
        status: null,
        dateRange: null,
        sortBy: "full_name" as const,
        sortOrder: "asc" as const,
      };

      await act(async () => {
        await result.current.exportUsers(filters, "csv");
      });

      expect(mockAnchor.download).toBe("users-export.csv");
    });

    it("should handle export errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Export failed",
          }),
      });

      const { result } = renderHook(() => useExport());

      const filters = {
        search: "",
        role: null,
        status: null,
        dateRange: null,
        sortBy: "full_name" as const,
        sortOrder: "asc" as const,
      };

      await expect(
        act(async () => {
          await result.current.exportUsers(filters, "csv");
        })
      ).rejects.toThrow("Export failed");

      expect(result.current.error).toBe("Export failed");
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useExport());

      const filters = {
        search: "",
        role: null,
        status: null,
        dateRange: null,
        sortBy: "full_name" as const,
        sortOrder: "asc" as const,
      };

      await expect(
        act(async () => {
          await result.current.exportUsers(filters, "csv");
        })
      ).rejects.toThrow("Network error");

      expect(result.current.error).toBe("Network error");
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

      const { result } = renderHook(() => useExport());

      const filters = {
        search: "nonexistent",
        role: null,
        status: null,
        dateRange: null,
        sortBy: "full_name" as const,
        sortOrder: "asc" as const,
      };

      await expect(
        act(async () => {
          await result.current.exportUsers(filters, "csv");
        })
      ).rejects.toThrow("No users found matching the criteria");

      expect(result.current.error).toBe("No users found matching the criteria");
    });

    it("should handle large export files", async () => {
      // Simulate a large CSV file
      const largeData =
        "id,email,first_name,last_name\n" +
        Array.from(
          { length: 1000 },
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

      const { result } = renderHook(() => useExport());

      const filters = {
        search: "",
        role: null,
        status: null,
        dateRange: null,
        sortBy: "full_name" as const,
        sortOrder: "asc" as const,
      };

      await act(async () => {
        await result.current.exportUsers(filters, "csv");
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
              50
            )
          )
      );

      const { result } = renderHook(() => useExport());

      expect(result.current.isExporting).toBe(false);

      const filters = {
        search: "",
        role: null,
        status: null,
        dateRange: null,
        sortBy: "full_name" as const,
        sortOrder: "asc" as const,
      };

      const exportPromise = act(async () => {
        await result.current.exportUsers(filters, "csv");
      });

      // Check that it's loading during the export
      expect(result.current.isExporting).toBe(true);

      await exportPromise;

      expect(result.current.isExporting).toBe(false);
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

      const { result } = renderHook(() => useExport());

      const filters = {
        search: "",
        role: null,
        status: null,
        dateRange: null,
        sortBy: "full_name" as const,
        sortOrder: "asc" as const,
      };

      await act(async () => {
        await result.current.exportUsers(filters, "csv");
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

      const { result } = renderHook(() => useExport());

      const filters = {
        search: "",
        role: null,
        status: null,
        dateRange: null,
        sortBy: "full_name" as const,
        sortOrder: "asc" as const,
      };

      await act(async () => {
        await result.current.exportUsers(filters, "csv");
      });

      expect(mockAppendChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockAnchor);
    });

    it("should clear error state", () => {
      const { result } = renderHook(() => useExport());

      // Simulate an error state
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });
});
