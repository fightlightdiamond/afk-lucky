"use client";

import { useState } from "react";
import { ExportDialog } from "@/components/admin/ExportDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserFilters, ExportFormat } from "@/types/user";
import { useExport } from "@/hooks/useExport";
import { useToast } from "@/hooks/use-toast";

const mockFilters: UserFilters = {
  search: "john",
  role: "user",
  status: "active",
  dateRange: null,
  activityDateRange: null,
  sortBy: "created_at",
  sortOrder: "desc",
  hasAvatar: null,
  locale: null,
  group_id: null,
  activity_status: null,
};

export default function TestExportPage() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { exportUsers, isExporting, error } = useExport();
  const { toast } = useToast();

  const handleExport = async (format: ExportFormat, fields?: string[]) => {
    try {
      await exportUsers(mockFilters, format, fields);
      toast({
        title: "Export Successful",
        description: `Users exported successfully as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description:
          error instanceof Error ? error.message : "Failed to export users",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Export Functionality</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This page is for testing the export functionality.</p>

          <div className="space-y-2">
            <h3 className="font-semibold">Current Mock Filters:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              <li>Search: "{mockFilters.search}"</li>
              <li>Role: {mockFilters.role}</li>
              <li>Status: {mockFilters.status}</li>
            </ul>
          </div>

          <Button
            onClick={() => setIsExportDialogOpen(true)}
            disabled={isExporting}
          >
            {isExporting ? "Exporting..." : "Test Export"}
          </Button>

          {error && <div className="text-red-600 text-sm">Error: {error}</div>}

          <ExportDialog
            open={isExportDialogOpen}
            onClose={() => setIsExportDialogOpen(false)}
            filters={mockFilters}
            totalRecords={150} // Mock total
            onExport={handleExport}
          />
        </CardContent>
      </Card>
    </div>
  );
}
