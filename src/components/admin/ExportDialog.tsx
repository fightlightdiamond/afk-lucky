"use client";

import { useState, useEffect, useRef } from "react";
import { Download, FileText, Table, Code } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ExportFormat, UserFilters, EXPORT_LIMITS } from "@/types/user";
import { focusManagement } from "@/lib/accessibility";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  filters: UserFilters;
  totalRecords: number;
  onExport: (format: ExportFormat, fields?: string[]) => Promise<void>;
}

// Available export fields with user-friendly labels
const EXPORT_FIELDS = [
  { key: "id", label: "User ID", description: "Unique identifier" },
  { key: "email", label: "Email", description: "User email address" },
  { key: "first_name", label: "First Name", description: "User's first name" },
  { key: "last_name", label: "Last Name", description: "User's last name" },
  {
    key: "full_name",
    label: "Full Name",
    description: "Combined first and last name",
  },
  {
    key: "is_active",
    label: "Active Status",
    description: "Whether user is active (true/false)",
  },
  {
    key: "status",
    label: "Status",
    description: "User status (active/inactive)",
  },
  {
    key: "activity_status",
    label: "Activity Status",
    description: "Online/offline/never",
  },
  { key: "role_name", label: "Role", description: "User's role name" },
  {
    key: "role_description",
    label: "Role Description",
    description: "Description of user's role",
  },
  {
    key: "created_at",
    label: "Created Date",
    description: "Account creation date",
  },
  { key: "updated_at", label: "Updated Date", description: "Last update date" },
  { key: "last_login", label: "Last Login", description: "Last login date" },
  { key: "last_logout", label: "Last Logout", description: "Last logout date" },
  { key: "sex", label: "Gender", description: "User's gender" },
  { key: "birthday", label: "Birthday", description: "User's birth date" },
  { key: "age", label: "Age", description: "Calculated age" },
  { key: "address", label: "Address", description: "User's address" },
  { key: "locale", label: "Locale", description: "User's language/locale" },
  {
    key: "group_id",
    label: "Group ID",
    description: "User's group identifier",
  },
  { key: "coin", label: "Coins", description: "User's coin balance" },
  {
    key: "has_avatar",
    label: "Has Avatar",
    description: "Whether user has avatar",
  },
];

// Default selected fields for different formats
const DEFAULT_FIELDS = {
  csv: [
    "email",
    "first_name",
    "last_name",
    "status",
    "role_name",
    "created_at",
    "last_login",
  ],
  excel: [
    "email",
    "first_name",
    "last_name",
    "status",
    "role_name",
    "created_at",
    "last_login",
  ],
  pdf: [
    "email",
    "first_name",
    "last_name",
    "status",
    "role_name",
    "created_at",
  ], // Fewer fields for PDF to fit on page
  json: [], // All fields for JSON
};

export function ExportDialog({
  open,
  onClose,
  filters,
  totalRecords,
  onExport,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [selectedFields, setSelectedFields] = useState<string[]>(
    DEFAULT_FIELDS.csv
  );
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Accessibility refs
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Update selected fields when format changes
  const handleFormatChange = (newFormat: ExportFormat) => {
    setFormat(newFormat);
    if (newFormat === "json") {
      setSelectedFields([]); // All fields for JSON
    } else {
      setSelectedFields(DEFAULT_FIELDS[newFormat] || DEFAULT_FIELDS.csv);
    }
  };

  // Toggle field selection
  const toggleField = (fieldKey: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey)
        ? prev.filter((f) => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  // Select all fields
  const selectAllFields = () => {
    setSelectedFields(EXPORT_FIELDS.map((f) => f.key));
  };

  // Clear all fields
  const clearAllFields = () => {
    setSelectedFields([]);
  };

  // Handle export
  const handleExport = async () => {
    if (totalRecords > EXPORT_LIMITS.MAX_RECORDS) {
      toast({
        title: "Export Limit Exceeded",
        description: `Cannot export more than ${EXPORT_LIMITS.MAX_RECORDS} records. Please apply filters to reduce the number of records.`,
        variant: "destructive",
      });
      return;
    }

    if (format !== "json" && selectedFields.length === 0) {
      toast({
        title: "No Fields Selected",
        description: "Please select at least one field to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);
      await onExport(format, format === "json" ? undefined : selectedFields);
      toast({
        title: "Export Started",
        description: `Your ${format.toUpperCase()} export is being prepared for download.`,
      });
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Get active filters summary
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.role) count++;
    if (filters.status && filters.status !== "all") count++;
    if (filters.dateRange?.from || filters.dateRange?.to) count++;
    if (filters.activityDateRange?.from || filters.activityDateRange?.to)
      count++;
    if (filters.hasAvatar !== null) count++;
    if (filters.locale) count++;
    if (filters.group_id !== null) count++;
    if (filters.activity_status) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const isOverLimit = totalRecords > EXPORT_LIMITS.MAX_RECORDS;

  // Handle dialog focus management
  useEffect(() => {
    if (open) {
      previousFocusRef.current = focusManagement.storeFocus();
    }
  }, [open]);

  const handleClose = () => {
    onClose();
    // Restore focus after a brief delay to ensure dialog is closed
    setTimeout(() => {
      focusManagement.restoreFocus(previousFocusRef.current);
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        ref={dialogRef}
        aria-describedby="export-dialog-description"
      >
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2"
            id="export-dialog-title"
          >
            <Download className="w-5 h-5" aria-hidden="true" />
            Export Users
          </DialogTitle>
          <DialogDescription id="export-dialog-description">
            Export user data with your current filters applied. Choose format
            and fields to include. {totalRecords} record
            {totalRecords === 1 ? "" : "s"} will be exported.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Records:</span>
                <Badge variant={isOverLimit ? "destructive" : "secondary"}>
                  {totalRecords.toLocaleString()}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active Filters:</span>
                <Badge variant="outline">{activeFiltersCount}</Badge>
              </div>
              {isOverLimit && (
                <div className="text-sm text-destructive">
                  ⚠️ Export limit exceeded. Maximum{" "}
                  {EXPORT_LIMITS.MAX_RECORDS.toLocaleString()} records allowed.
                  Please apply additional filters to reduce the number of
                  records.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label htmlFor="format-select">Export Format</Label>
            <Select value={format} onValueChange={handleFormatChange}>
              <SelectTrigger
                id="format-select"
                aria-label={`Export format, currently ${format.toUpperCase()}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent role="listbox" aria-label="Export format options">
                <SelectItem value="csv" role="option">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" aria-hidden="true" />
                    <div>
                      <div>CSV</div>
                      <div className="text-xs text-muted-foreground">
                        Comma-separated values, compatible with Excel
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4" />
                    <div>
                      <div>Excel</div>
                      <div className="text-xs text-muted-foreground">
                        Excel-compatible format
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    <div>
                      <div>JSON</div>
                      <div className="text-xs text-muted-foreground">
                        JavaScript Object Notation, includes all fields
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <div>
                      <div>PDF</div>
                      <div className="text-xs text-muted-foreground">
                        Portable Document Format, formatted table
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Field Selection (not for JSON) */}
          {format !== "json" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Fields to Export</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllFields}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllFields}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-md p-3">
                <legend className="sr-only">
                  Select fields to include in export
                </legend>
                {EXPORT_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-start space-x-2">
                    <Checkbox
                      id={field.key}
                      checked={selectedFields.includes(field.key)}
                      onCheckedChange={() => toggleField(field.key)}
                      aria-describedby={`${field.key}-description`}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={field.key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {field.label}
                      </label>
                      <p
                        id={`${field.key}-description`}
                        className="text-xs text-muted-foreground"
                      >
                        {field.description}
                      </p>
                    </div>
                  </div>
                ))}
              </fieldset>

              {selectedFields.length > 0 && (
                <div
                  className="text-sm text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  Selected {selectedFields.length} of {EXPORT_FIELDS.length}{" "}
                  fields
                </div>
              )}
            </div>
          )}

          {format === "json" && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <strong>JSON Export:</strong> All available fields will be
              included in the export. This format is ideal for data processing
              and includes complete user information (excluding sensitive data
              like passwords).
            </div>
          )}

          <Separator />

          {/* Security Notice */}
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
            <strong>Security Notice:</strong> Sensitive information such as
            passwords, tokens, and private keys are automatically excluded from
            all exports. Only safe, non-sensitive user data will be included.
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isExporting}
            aria-label="Cancel export and close dialog"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={
              isExporting ||
              isOverLimit ||
              (format !== "json" && selectedFields.length === 0)
            }
            aria-label={
              isExporting
                ? "Export in progress"
                : `Export ${totalRecords} record${
                    totalRecords === 1 ? "" : "s"
                  } as ${format.toUpperCase()}`
            }
            aria-describedby="export-button-description"
          >
            {isExporting ? (
              <>
                <Download
                  className="w-4 h-4 mr-2 animate-spin"
                  aria-hidden="true"
                />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
          <div id="export-button-description" className="sr-only">
            {isExporting
              ? "Export is currently in progress, please wait"
              : isOverLimit
              ? `Cannot export: ${totalRecords} records exceeds the limit of ${EXPORT_LIMITS.MAX_RECORDS}`
              : format !== "json" && selectedFields.length === 0
              ? "Cannot export: no fields selected"
              : `Ready to export ${totalRecords} record${
                  totalRecords === 1 ? "" : "s"
                } in ${format.toUpperCase()} format`}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
