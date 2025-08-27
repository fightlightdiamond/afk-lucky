"use client";

import { useState, useCallback } from "react";
import { ExportFormat, UserFilters } from "@/types/user";

interface UseExportOptions {
  baseUrl?: string;
}

export function useExport({
  baseUrl = "/api/admin/users/export",
}: UseExportOptions = {}) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportUsers = useCallback(
    async (filters: UserFilters, format: ExportFormat, fields?: string[]) => {
      try {
        setIsExporting(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();

        // Add format
        params.append("format", format);

        // Add fields if specified
        if (fields && fields.length > 0) {
          params.append("fields", fields.join(","));
        }

        // Add filter parameters
        if (filters.search) {
          params.append("search", filters.search);
        }

        if (filters.role) {
          params.append("role", filters.role);
        }

        if (filters.status && filters.status !== "all") {
          params.append("status", filters.status);
        }

        if (filters.dateRange?.from) {
          params.append("dateFrom", filters.dateRange.from.toISOString());
        }

        if (filters.dateRange?.to) {
          params.append("dateTo", filters.dateRange.to.toISOString());
        }

        if (filters.activityDateRange?.from) {
          params.append(
            "activityDateFrom",
            filters.activityDateRange.from.toISOString()
          );
        }

        if (filters.activityDateRange?.to) {
          params.append(
            "activityDateTo",
            filters.activityDateRange.to.toISOString()
          );
        }

        if (filters.hasAvatar !== null && filters.hasAvatar !== undefined) {
          params.append("hasAvatar", filters.hasAvatar.toString());
        }

        if (filters.locale) {
          params.append("locale", filters.locale);
        }

        if (filters.group_id !== null && filters.group_id !== undefined) {
          params.append("group_id", filters.group_id.toString());
        }

        if (filters.activity_status) {
          params.append("activity_status", filters.activity_status);
        }

        // Make the request
        const response = await fetch(`${baseUrl}?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Export failed with status ${response.status}`
          );
        }

        // Get the filename from the response headers
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = `users-export.${format}`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create temporary download link
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, filename };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Export failed";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsExporting(false);
      }
    },
    [baseUrl]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    exportUsers,
    isExporting,
    error,
    clearError,
  };
}
