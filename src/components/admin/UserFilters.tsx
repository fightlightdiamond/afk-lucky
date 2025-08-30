"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  X,
  Calendar,
  Activity,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import {
  UserFilters as UserFiltersType,
  ExportFormat,
  Role,
} from "@/types/user";
import { ExportDialog } from "./ExportDialog";
import { ImportDialog } from "./ImportDialog";
import { ariaLabels, screenReader, focusManagement } from "@/lib/accessibility";

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
  roles: Array<{ id: string; name: string }>;
  isLoading?: boolean;
  totalRecords?: number;
  onExport?: (format: ExportFormat, fields?: string[]) => Promise<void>;
  onImport?: () => void;
}

export function UserFilters({
  filters,
  onFiltersChange,
  roles,
  isLoading = false,
  totalRecords = 0,
  onExport,
  onImport,
}: UserFiltersProps) {
  const [localFilters, setLocalFilters] = useState<UserFiltersType>(filters);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isActivityDateRangeOpen, setIsActivityDateRangeOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Accessibility refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse filters on mobile by default
      if (mobile && !isFiltersCollapsed) {
        setIsFiltersCollapsed(true);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, [isFiltersCollapsed]);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Debounced search to avoid too many API calls
  const [searchValue, setSearchValue] = useState(localFilters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== localFilters.search) {
        const newFilters = { ...localFilters, search: searchValue };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchValue, localFilters, onFiltersChange]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleFilterChange = (key: keyof UserFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);

    // Announce filter changes to screen readers
    screenReader.announceFilterChange(
      key.replace(/([A-Z])/g, " $1").toLowerCase(),
      value ? String(value) : null
    );
  };

  const handleDateRangeChange = (
    type: "dateRange" | "activityDateRange",
    field: "from" | "to",
    date: Date | null
  ) => {
    const currentRange = localFilters[type] || { from: null, to: null };
    const newRange = { ...currentRange, [field]: date };
    const newFilters = { ...localFilters, [type]: newRange };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: UserFiltersType = {
      search: "",
      role: null,
      status: null,
      dateRange: null,
      activityDateRange: null,
      sortBy: "created_at",
      sortOrder: "desc",
      hasAvatar: null,
      locale: null,
      group_id: null,
      activity_status: null,
    };
    setSearchValue(""); // Clear search value too
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);

    // Announce filter clearing
    screenReader.announceFilterChange("All filters", null);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.role) count++;
    if (localFilters.status && localFilters.status !== "all") count++;
    if (localFilters.dateRange?.from || localFilters.dateRange?.to) count++;
    if (
      localFilters.activityDateRange?.from ||
      localFilters.activityDateRange?.to
    )
      count++;
    if (localFilters.hasAvatar !== null) count++;
    if (localFilters.locale) count++;
    if (localFilters.group_id !== null) count++;
    if (localFilters.activity_status) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4" role="search" aria-label="User filters">
          {/* Search Bar and Mobile Toggle */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"
                aria-hidden="true"
              />
              <Input
                ref={searchInputRef}
                placeholder="Search users by name, email..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                aria-label={ariaLabels.filter.search(
                  !!searchValue,
                  searchValue
                )}
                aria-describedby="search-description"
              />
              <div id="search-description" className="sr-only">
                Search through users by their name, email address, or other
                identifying information. Results will update automatically as
                you type.
              </div>
            </div>

            {/* Mobile: Collapsible filters toggle */}
            {isMobile ? (
              <Button
                variant="outline"
                onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
                className="relative min-w-[100px]"
                aria-label={`${isFiltersCollapsed ? "Show" : "Hide"} filters${
                  activeFiltersCount > 0
                    ? `, ${activeFiltersCount} filter${
                        activeFiltersCount === 1 ? "" : "s"
                      } active`
                    : ""
                }`}
                aria-expanded={!isFiltersCollapsed}
              >
                <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 px-1.5 py-0.5 text-xs"
                    aria-label={`${activeFiltersCount} active filter${
                      activeFiltersCount === 1 ? "" : "s"
                    }`}
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      ref={filtersButtonRef}
                      variant="outline"
                      className="relative"
                      aria-label={`Open filters menu${
                        activeFiltersCount > 0
                          ? `, ${activeFiltersCount} filter${
                              activeFiltersCount === 1 ? "" : "s"
                            } active`
                          : ""
                      }`}
                      aria-haspopup="dialog"
                      aria-expanded={false}
                    >
                      <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-2 px-1.5 py-0.5 text-xs"
                          aria-label={`${activeFiltersCount} active filter${
                            activeFiltersCount === 1 ? "" : "s"
                          }`}
                        >
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-80 max-h-[600px] overflow-y-auto"
                    align="end"
                    role="dialog"
                    aria-label="Filter options"
                    onOpenAutoFocus={(e) => {
                      previousFocusRef.current = focusManagement.storeFocus();
                    }}
                    onCloseAutoFocus={(e) => {
                      e.preventDefault();
                      focusManagement.restoreFocus(previousFocusRef.current);
                    }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium" id="filters-heading">
                          Filters
                        </h4>
                        {activeFiltersCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-auto p-1"
                            aria-label="Clear all filters"
                          >
                            <X className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        )}
                      </div>

                      {/* Role Filter */}
                      <div className="space-y-2">
                        <Label htmlFor="role-filter">Role</Label>
                        <Select
                          value={localFilters.role || "all"}
                          onValueChange={(value) =>
                            handleFilterChange(
                              "role",
                              value === "all" ? null : value
                            )
                          }
                        >
                          <SelectTrigger
                            id="role-filter"
                            aria-label={ariaLabels.filter.role(
                              localFilters.role
                                ? roles.find((r) => r.id === localFilters.role)
                                    ?.name
                                : undefined
                            )}
                          >
                            <SelectValue placeholder="All roles" />
                          </SelectTrigger>
                          <SelectContent
                            role="listbox"
                            aria-label="Role options"
                          >
                            <SelectItem value="all" role="option">
                              All roles
                            </SelectItem>
                            {roles.map((role) => (
                              <SelectItem
                                key={role.id}
                                value={role.id}
                                role="option"
                              >
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Status Filter */}
                      <div className="space-y-2">
                        <Label htmlFor="status-filter">Status</Label>
                        <Select
                          value={localFilters.status || "all"}
                          onValueChange={(value) =>
                            handleFilterChange(
                              "status",
                              value === "all"
                                ? null
                                : (value as "active" | "inactive")
                            )
                          }
                        >
                          <SelectTrigger
                            id="status-filter"
                            aria-label={ariaLabels.filter.status(
                              localFilters.status || undefined
                            )}
                          >
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent
                            role="listbox"
                            aria-label="Status options"
                          >
                            <SelectItem value="all" role="option">
                              All statuses
                            </SelectItem>
                            <SelectItem value="active" role="option">
                              Active
                            </SelectItem>
                            <SelectItem value="inactive" role="option">
                              Inactive
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Activity Status Filter */}
                      <div className="space-y-2">
                        <Label>Activity Status</Label>
                        <Select
                          value={localFilters.activity_status || "all"}
                          onValueChange={(value) =>
                            handleFilterChange(
                              "activity_status",
                              value === "all"
                                ? null
                                : (value as "online" | "offline" | "never")
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All activity statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              All activity statuses
                            </SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                            <SelectItem value="never">
                              Never logged in
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Avatar Filter */}
                      <div className="space-y-2">
                        <Label>Avatar</Label>
                        <Select
                          value={
                            localFilters.hasAvatar === null
                              ? "all"
                              : localFilters.hasAvatar
                              ? "yes"
                              : "no"
                          }
                          onValueChange={(value) =>
                            handleFilterChange(
                              "hasAvatar",
                              value === "all" ? null : value === "yes"
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All users" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All users</SelectItem>
                            <SelectItem value="yes">Has avatar</SelectItem>
                            <SelectItem value="no">No avatar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Creation Date Range */}
                      <div className="space-y-2">
                        <Label>Creation Date Range</Label>
                        <Popover
                          open={isDateRangeOpen}
                          onOpenChange={setIsDateRangeOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {localFilters.dateRange?.from ? (
                                localFilters.dateRange.to ? (
                                  <>
                                    {format(
                                      localFilters.dateRange.from,
                                      "LLL dd, y"
                                    )}{" "}
                                    -{" "}
                                    {format(
                                      localFilters.dateRange.to,
                                      "LLL dd, y"
                                    )}
                                  </>
                                ) : (
                                  format(
                                    localFilters.dateRange.from,
                                    "LLL dd, y"
                                  )
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="range"
                              defaultMonth={
                                localFilters.dateRange?.from || undefined
                              }
                              selected={{
                                from: localFilters.dateRange?.from || undefined,
                                to: localFilters.dateRange?.to || undefined,
                              }}
                              onSelect={(range) => {
                                handleDateRangeChange(
                                  "dateRange",
                                  "from",
                                  range?.from || null
                                );
                                handleDateRangeChange(
                                  "dateRange",
                                  "to",
                                  range?.to || null
                                );
                                if (range?.from && range?.to) {
                                  setIsDateRangeOpen(false);
                                }
                              }}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Activity Date Range */}
                      <div className="space-y-2">
                        <Label>Last Login Date Range</Label>
                        <Popover
                          open={isActivityDateRangeOpen}
                          onOpenChange={setIsActivityDateRangeOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <Activity className="mr-2 h-4 w-4" />
                              {localFilters.activityDateRange?.from ? (
                                localFilters.activityDateRange.to ? (
                                  <>
                                    {format(
                                      localFilters.activityDateRange.from,
                                      "LLL dd, y"
                                    )}{" "}
                                    -{" "}
                                    {format(
                                      localFilters.activityDateRange.to,
                                      "LLL dd, y"
                                    )}
                                  </>
                                ) : (
                                  format(
                                    localFilters.activityDateRange.from,
                                    "LLL dd, y"
                                  )
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="range"
                              defaultMonth={
                                localFilters.activityDateRange?.from ||
                                undefined
                              }
                              selected={{
                                from:
                                  localFilters.activityDateRange?.from ||
                                  undefined,
                                to:
                                  localFilters.activityDateRange?.to ||
                                  undefined,
                              }}
                              onSelect={(range) => {
                                handleDateRangeChange(
                                  "activityDateRange",
                                  "from",
                                  range?.from || null
                                );
                                handleDateRangeChange(
                                  "activityDateRange",
                                  "to",
                                  range?.to || null
                                );
                                if (range?.from && range?.to) {
                                  setIsActivityDateRangeOpen(false);
                                }
                              }}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Import Button */}
                {onImport && (
                  <Button
                    variant="outline"
                    onClick={() => setIsImportDialogOpen(true)}
                    disabled={isLoading}
                    aria-label="Import users from file"
                    aria-describedby="import-description"
                    className="hidden sm:flex"
                  >
                    <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                    <span className="hidden md:inline">Import</span>
                    <span id="import-description" className="sr-only">
                      Open dialog to import users from CSV or Excel file
                    </span>
                  </Button>
                )}

                {/* Export Button */}
                {onExport && (
                  <Button
                    variant="outline"
                    onClick={() => setIsExportDialogOpen(true)}
                    disabled={isLoading}
                    aria-label={`Export ${totalRecords} user${
                      totalRecords === 1 ? "" : "s"
                    }`}
                    aria-describedby="export-description"
                    className="hidden sm:flex"
                  >
                    <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                    <span className="hidden md:inline">Export</span>
                    <span id="export-description" className="sr-only">
                      Export filtered user data to CSV, Excel, or other formats
                    </span>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Mobile: Collapsible Filters Section */}
          {isMobile && !isFiltersCollapsed && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Filter Options</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto p-1 text-xs"
                    aria-label="Clear all filters"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* Mobile Filter Grid */}
              <div className="grid grid-cols-1 gap-4">
                {/* Role Filter */}
                <div className="space-y-2">
                  <Label htmlFor="mobile-role-filter" className="text-sm">
                    Role
                  </Label>
                  <Select
                    value={localFilters.role || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("role", value === "all" ? null : value)
                    }
                  >
                    <SelectTrigger id="mobile-role-filter" className="h-11">
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label htmlFor="mobile-status-filter" className="text-sm">
                    Status
                  </Label>
                  <Select
                    value={localFilters.status || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "status",
                        value === "all"
                          ? null
                          : (value as "active" | "inactive")
                      )
                    }
                  >
                    <SelectTrigger id="mobile-status-filter" className="h-11">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Activity Status Filter */}
                <div className="space-y-2">
                  <Label className="text-sm">Activity Status</Label>
                  <Select
                    value={localFilters.activity_status || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "activity_status",
                        value === "all"
                          ? null
                          : (value as "online" | "offline" | "never")
                      )
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="All activity statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All activity statuses</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="never">Never logged in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mobile Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {onImport && (
                    <Button
                      variant="outline"
                      onClick={() => setIsImportDialogOpen(true)}
                      disabled={isLoading}
                      className="h-11"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                  )}
                  {onExport && (
                    <Button
                      variant="outline"
                      onClick={() => setIsExportDialogOpen(true)}
                      disabled={isLoading}
                      className="h-11"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div
              className="flex flex-wrap gap-2"
              role="region"
              aria-label="Active filters"
            >
              {searchValue && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchValue}
                  <button
                    className="w-3 h-3 cursor-pointer hover:bg-muted rounded-sm p-0 border-0 bg-transparent"
                    onClick={() => {
                      setSearchValue("");
                      const newFilters = { ...localFilters, search: "" };
                      setLocalFilters(newFilters);
                      onFiltersChange(newFilters);
                    }}
                    aria-label={`Remove search filter: ${searchValue}`}
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </Badge>
              )}
              {localFilters.role && (
                <Badge variant="secondary" className="gap-1">
                  Role: {roles.find((r) => r.id === localFilters.role)?.name}
                  <button
                    className="w-3 h-3 cursor-pointer hover:bg-muted rounded-sm p-0 border-0 bg-transparent"
                    onClick={() => handleFilterChange("role", null)}
                    aria-label={`Remove role filter: ${
                      roles.find((r) => r.id === localFilters.role)?.name
                    }`}
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </Badge>
              )}
              {localFilters.status && localFilters.status !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {localFilters.status}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange("status", null)}
                  />
                </Badge>
              )}
              {localFilters.activity_status && (
                <Badge variant="secondary" className="gap-1">
                  Activity: {localFilters.activity_status}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange("activity_status", null)}
                  />
                </Badge>
              )}
              {localFilters.hasAvatar !== null && (
                <Badge variant="secondary" className="gap-1">
                  Avatar: {localFilters.hasAvatar ? "Yes" : "No"}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange("hasAvatar", null)}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Import Dialog */}
      {onImport && (
        <ImportDialog
          open={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          roles={roles as Role[]}
        />
      )}

      {/* Export Dialog */}
      {onExport && (
        <ExportDialog
          open={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          filters={localFilters}
          totalRecords={totalRecords}
          onExport={onExport}
        />
      )}
    </Card>
  );
}
