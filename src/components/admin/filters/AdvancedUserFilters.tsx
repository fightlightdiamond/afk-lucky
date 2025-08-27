"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { UserFilters } from "@/types/user";
import {
  SearchInput,
  RoleFilter,
  StatusFilter,
  DateRangeFilter,
  FilterPresets,
  type StatusFilterValue,
  type DateRange,
} from "./index";

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface AdvancedUserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  roles: Role[];
  isLoading?: boolean;
  showPresets?: boolean;
  className?: string;
}

export function AdvancedUserFilters({
  filters,
  onFiltersChange,
  roles,
  isLoading = false,
  showPresets = true,
  className = "",
}: AdvancedUserFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleFilterChange = (key: keyof UserFilters, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (search: string) => {
    handleFilterChange("search", search);
  };

  const handleRoleChange = (roleIds: string[]) => {
    // For single role selection, take the first role or null
    const roleId = roleIds.length > 0 ? roleIds[0] : null;
    handleFilterChange("role", roleId);
  };

  const handleStatusChange = (status: StatusFilterValue) => {
    const statusValue = status === "all" ? null : status;
    handleFilterChange("status", statusValue);
  };

  const handleDateRangeChange = (dateRange: DateRange | null) => {
    handleFilterChange("dateRange", dateRange);
  };

  const handleActivityDateRangeChange = (dateRange: DateRange | null) => {
    handleFilterChange("activityDateRange", dateRange);
  };

  const handlePresetSelect = (presetFilters: Partial<UserFilters>) => {
    const newFilters = { ...filters, ...presetFilters };
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: UserFilters = {
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
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.role) count++;
    if (filters.status && filters.status !== "all") count++;
    if (filters.dateRange?.from || filters.dateRange?.to) count++;
    if (filters.activityDateRange?.from || filters.activityDateRange?.to)
      count++;
    if (filters.hasAvatar !== null) count++;
    if (filters.activity_status) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Date range presets
  const datePresets = [
    {
      label: "Last 7 days",
      value: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    },
    {
      label: "Last 30 days",
      value: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    },
    {
      label: "Last 90 days",
      value: {
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    },
    {
      label: "This year",
      value: {
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
      },
    },
  ];

  const currentStatus: StatusFilterValue =
    filters.status === null ? "all" : filters.status;
  const selectedRoles = filters.role ? [filters.role] : [];

  return (
    <Card className={`mb-6 ${className}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search and Filter Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <SearchInput
                value={filters.search}
                onChange={handleSearchChange}
                disabled={isLoading}
              />
            </div>

            <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
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
                className="w-96 max-h-[600px] overflow-y-auto"
                align="end"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Advanced Filters</h4>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-auto p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="border-t" />

                  {/* Role Filter */}
                  <RoleFilter
                    selectedRoles={selectedRoles}
                    onChange={handleRoleChange}
                    roles={roles}
                    disabled={isLoading}
                  />

                  {/* Status Filter */}
                  <StatusFilter
                    value={currentStatus}
                    onChange={handleStatusChange}
                    disabled={isLoading}
                  />

                  {/* Creation Date Range */}
                  <DateRangeFilter
                    value={filters.dateRange}
                    onChange={handleDateRangeChange}
                    label="Creation Date Range"
                    placeholder="Select creation date range"
                    disabled={isLoading}
                    presets={datePresets}
                  />

                  {/* Activity Date Range */}
                  <DateRangeFilter
                    value={filters.activityDateRange}
                    onChange={handleActivityDateRangeChange}
                    label="Last Login Date Range"
                    placeholder="Select activity date range"
                    disabled={isLoading}
                    presets={datePresets}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Filter Presets */}
          {showPresets && (
            <>
              <div className="border-t" />
              <FilterPresets
                onPresetSelect={handlePresetSelect}
                currentFilters={filters}
                disabled={isLoading}
              />
            </>
          )}

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <>
              <div className="border-t" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Filters:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-1 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {filters.search}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleFilterChange("search", "")}
                      />
                    </Badge>
                  )}
                  {filters.role && (
                    <Badge variant="secondary" className="gap-1">
                      Role: {roles.find((r) => r.id === filters.role)?.name}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleFilterChange("role", null)}
                      />
                    </Badge>
                  )}
                  {filters.status && filters.status !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {filters.status}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleFilterChange("status", null)}
                      />
                    </Badge>
                  )}
                  {filters.activity_status && (
                    <Badge variant="secondary" className="gap-1">
                      Activity: {filters.activity_status}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() =>
                          handleFilterChange("activity_status", null)
                        }
                      />
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
