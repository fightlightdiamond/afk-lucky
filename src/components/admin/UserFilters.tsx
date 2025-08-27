"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, Calendar, Activity, Download } from "lucide-react";
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
import { UserFilters as UserFiltersType, ExportFormat } from "@/types/user";
import { ExportDialog } from "./ExportDialog";

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
  roles: Array<{ id: string; name: string }>;
  isLoading?: boolean;
  totalRecords?: number;
  onExport?: (format: ExportFormat, fields?: string[]) => Promise<void>;
}

export function UserFilters({
  filters,
  onFiltersChange,
  roles,
  isLoading = false,
  totalRecords = 0,
  onExport,
}: UserFiltersProps) {
  const [localFilters, setLocalFilters] = useState<UserFiltersType>(filters);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isActivityDateRangeOpen, setIsActivityDateRangeOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

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
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users by name, email..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="relative">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 px-1.5 py-0.5 text-xs"
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 max-h-[600px] overflow-y-auto"
                  align="end"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filters</h4>
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="h-auto p-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Role Filter */}
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select
                        value={localFilters.role || "all"}
                        onValueChange={(value) =>
                          handleFilterChange(
                            "role",
                            value === "all" ? null : value
                          )
                        }
                      >
                        <SelectTrigger>
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
                      <Label>Status</Label>
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
                        <SelectTrigger>
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
                          <SelectItem value="never">Never logged in</SelectItem>
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
                                format(localFilters.dateRange.from, "LLL dd, y")
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
                              localFilters.activityDateRange?.from || undefined
                            }
                            selected={{
                              from:
                                localFilters.activityDateRange?.from ||
                                undefined,
                              to:
                                localFilters.activityDateRange?.to || undefined,
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

              {/* Export Button */}
              {onExport && (
                <Button
                  variant="outline"
                  onClick={() => setIsExportDialogOpen(true)}
                  disabled={isLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {searchValue && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchValue}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => {
                      setSearchValue("");
                      const newFilters = { ...localFilters, search: "" };
                      setLocalFilters(newFilters);
                      onFiltersChange(newFilters);
                    }}
                  />
                </Badge>
              )}
              {localFilters.role && (
                <Badge variant="secondary" className="gap-1">
                  Role: {roles.find((r) => r.id === localFilters.role)?.name}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange("role", null)}
                  />
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
