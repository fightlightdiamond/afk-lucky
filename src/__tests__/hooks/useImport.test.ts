import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useImportPreview,
  useImportUsers,
  validateImportFile,
} from "@/hooks/useImport";

// Mock fetch
global.fetch = vi.fn();

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

describe("useImport hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateImportFile", () => {
    it("validates file size", () => {
      const largeFile = new File(["x".repeat(11 * 1024 * 1024)], "test.csv", {
        type: "text/csv",
      });

      const result = validateImportFile(largeFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("10MB limit");
    });

    it("validates file type", () => {
      const invalidFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });

      const result = validateImportFile(invalidFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Unsupported file format");
    });

    it("accepts valid CSV files", () => {
      const validFile = new File(["content"], "test.csv", {
        type: "text/csv",
      });

      const result = validateImportFile(validFile);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("accepts valid Excel files", () => {
      const validFile = new File(["content"], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const result = validateImportFile(validFile);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("useImportPreview", () => {
    it("makes preview request", async () => {
      const mockResponse = {
        success: true,
        preview: {
          headers: ["email", "first_name", "last_name"],
          rows: [
            {
              email: "test@example.com",
              first_name: "Test",
              last_name: "User",
            },
          ],
          totalRows: 1,
          previewRows: 1,
        },
        validation: {
          validRows: 1,
          invalidRows: 0,
          errors: [],
          warnings: [],
        },
        suggestedMapping: {
          email: "email",
          first_name: "first_name",
          last_name: "last_name",
        },
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { result } = renderHook(() => useImportPreview(), {
        wrapper: createWrapper(),
      });

      const file = new File(["content"], "test.csv", { type: "text/csv" });

      result.current.mutate({ file });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith("/api/admin/users/import/preview", {
        method: "POST",
        body: expect.any(FormData),
      });
    });
  });

  describe("useImportUsers", () => {
    it("makes import request", async () => {
      const mockResponse = {
        success: true,
        summary: {
          totalRows: 1,
          validRows: 1,
          invalidRows: 0,
          created: 1,
          updated: 0,
          skipped: 0,
          errors: 0,
        },
        errors: [],
        warnings: [],
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { result } = renderHook(() => useImportUsers(), {
        wrapper: createWrapper(),
      });

      const file = new File(["content"], "test.csv", { type: "text/csv" });
      const options = {
        skipDuplicates: false,
        updateExisting: false,
        validateOnly: false,
        skipInvalidRows: true,
      };

      result.current.mutate({ file, options });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith("/api/admin/users/import", {
        method: "POST",
        body: expect.any(FormData),
      });
    });
  });
});
