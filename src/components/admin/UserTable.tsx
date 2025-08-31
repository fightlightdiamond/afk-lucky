"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
  Shield,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PermissionBadge } from "@/components/admin/PermissionBadge";
import { UserStatusBadge } from "@/components/admin/UserStatusBadge";
import { UserStatusManager } from "@/components/admin/UserStatusManager";
import { UserActivityDetail } from "@/components/admin/UserActivityDetail";
import { User, UserFilters, SortableUserField, UserStatus } from "@/types/user";
import { formatDistanceToNow } from "date-fns";

// Helper function to safely format dates
const safeFormatDistanceToNow = (dateString: string | null | undefined) => {
  if (!dateString) return "Never";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "Invalid date";
  }
};
import { cn } from "@/lib/utils";
import {
  TableLoading,
  EmptyState,
  LoadingStateWrapper,
} from "@/components/ui/loading";
import { useErrorHandler } from "@/lib/error-handling";
import {
  ariaLabels,
  screenReader,
  keyboardNavigation,
  focusManagement,
} from "@/lib/accessibility";
import { useResponsive, touchFriendlyClasses } from "@/hooks/useResponsive";

interface UserTableProps {
  users: User[];
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onStatusChange?: (
    userId: string,
    newStatus: UserStatus,
    reason?: string
  ) => Promise<void>;
  isLoading?: boolean;
  // Selection props
  selectedUsers?: Set<string>;
  onUserSelection?: (userId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  // Responsive props
  isMobile?: boolean;
}

interface SortableHeaderProps {
  field: SortableUserField;
  label: string;
  filters: UserFilters;
  onSort: (field: SortableUserField) => void;
}

function SortableHeader({
  field,
  label,
  filters,
  onSort,
}: SortableHeaderProps) {
  const isActive = filters?.sortBy === field;
  const direction = filters?.sortOrder;

  const getSortIcon = () => {
    if (!isActive) {
      return (
        <ChevronsUpDown className="w-4 h-4 text-muted-foreground opacity-50" />
      );
    }
    return direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-primary" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary" />
    );
  };

  const ariaLabel = ariaLabels.sortButton(
    label,
    filters?.sortBy,
    filters?.sortOrder
  );
  const sortDescription = isActive
    ? `Currently sorted by ${label} in ${
        direction === "asc" ? "ascending" : "descending"
      } order`
    : `Not currently sorted by ${label}`;

  return (
    <Button
      variant="ghost"
      className={cn(
        "h-auto p-0 font-medium hover:bg-transparent hover:text-primary transition-colors",
        isActive && "text-primary"
      )}
      onClick={() => onSort(field)}
      aria-label={ariaLabel}
      aria-describedby={`sort-${field}-description`}
    >
      <span className="flex items-center gap-2">
        {label}
        {getSortIcon()}
      </span>
      <span id={`sort-${field}-description`} className="sr-only">
        {sortDescription}
      </span>
    </Button>
  );
}

function ActivityStatusBadge({ user }: { user: User }) {
  const getActivityInfo = () => {
    switch (user.activity_status) {
      case "online":
        return {
          variant: "default" as const,
          label: "Online",
          displayLabel: "Online",
          icon: (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          ),
          tooltipContent: (
            <div className="space-y-1">
              <p className="font-medium">Currently Online</p>
              {user.last_login && (
                <p className="text-xs">
                  Last login: {new Date(user.last_login).toLocaleString()}
                </p>
              )}
            </div>
          ),
        };
      case "offline":
        return {
          variant: "secondary" as const,
          label: user.last_login
            ? `Last seen ${safeFormatDistanceToNow(user.last_login)}`
            : "Offline",
          displayLabel: "Offline",
          icon: <div className="w-2 h-2 bg-gray-400 rounded-full" />,
          tooltipContent: (
            <div className="space-y-1">
              <p className="font-medium">Offline</p>
              {user.last_login ? (
                <>
                  <p className="text-xs">
                    Last login: {new Date(user.last_login).toLocaleString()}
                  </p>
                  <p className="text-xs">
                    {safeFormatDistanceToNow(user.last_login)}
                  </p>
                </>
              ) : (
                <p className="text-xs">No recent activity</p>
              )}
            </div>
          ),
        };
      case "never":
        return {
          variant: "outline" as const,
          label: "Never logged in",
          displayLabel: "Never",
          icon: <div className="w-2 h-2 bg-red-400 rounded-full" />,
          tooltipContent: (
            <div className="space-y-1">
              <p className="font-medium">Never logged in</p>
              <p className="text-xs">
                Account created: {new Date(user.created_at).toLocaleString()}
              </p>
              <p className="text-xs text-amber-600">
                User has never accessed the system
              </p>
            </div>
          ),
        };
      default:
        return {
          variant: "secondary" as const,
          label: "Unknown",
          displayLabel: "Unknown",
          icon: <div className="w-2 h-2 bg-gray-400 rounded-full" />,
          tooltipContent: <p>Activity status unknown</p>,
        };
    }
  };

  const { variant, displayLabel, icon, tooltipContent } = getActivityInfo();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className="gap-1.5 cursor-help">
            {icon}
            {displayLabel}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Hook to detect mobile screen size with multiple breakpoints
function useResponsiveBreakpoints() {
  const [breakpoints, setBreakpoints] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setBreakpoints({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    checkBreakpoints();
    window.addEventListener("resize", checkBreakpoints);

    return () => window.removeEventListener("resize", checkBreakpoints);
  }, []);

  return breakpoints;
}

// Hook to detect mobile screen size (backward compatibility)
function useIsMobile() {
  const { isMobile } = useResponsiveBreakpoints();
  return isMobile;
}

export function UserTable({
  users,
  filters,
  onFiltersChange,
  onEdit,
  onDelete,
  onToggleStatus,
  onStatusChange,
  isLoading = false,
  selectedUsers = new Set(),
  onUserSelection,
  onSelectAll,
  isMobile: isMobileProp,
}: UserTableProps) {
  // Debug log to check if filters is passed correctly
  console.log("UserTable filters:", filters);

  // Use hook to detect mobile if not provided as prop
  const { isMobile: detectedIsMobile, isTablet } = useResponsive();
  const isMobile = isMobileProp ?? detectedIsMobile;

  // Accessibility state
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  const tableRef = useRef<HTMLTableElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  const handleSort = (field: SortableUserField) => {
    if (!filters) return;

    const newOrder =
      filters.sortBy === field && filters.sortOrder === "asc" ? "desc" : "asc";

    onFiltersChange({
      ...filters,
      sortBy: field,
      sortOrder: newOrder,
    });

    // Announce sort change to screen readers
    screenReader.announceFilterChange(
      `Sort by ${field}`,
      `${field} ${newOrder === "asc" ? "ascending" : "descending"}`
    );
  };

  // Selection logic
  const isAllSelected = useMemo(() => {
    if (users.length === 0) return false;
    return users.every((user) => selectedUsers.has(user.id));
  }, [users, selectedUsers]);

  const isIndeterminate = useMemo(() => {
    if (users.length === 0) return false;
    const selectedCount = users.filter((user) =>
      selectedUsers.has(user.id)
    ).length;
    return selectedCount > 0 && selectedCount < users.length;
  }, [users, selectedUsers]);

  const handleSelectAll = (checked: boolean) => {
    if (onSelectAll) {
      onSelectAll(checked);
      // Announce selection change
      screenReader.announceSelection(checked ? users.length : 0, users.length);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (onUserSelection) {
      onUserSelection(userId, checked);
      // Announce individual selection change
      const selectedCount =
        Array.from(selectedUsers).length + (checked ? 1 : -1);
      screenReader.announceSelection(selectedCount, users.length);
    }
  };

  // Keyboard navigation for table rows
  const handleTableKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (users.length === 0) return;

      keyboardNavigation.handleArrowNavigation(
        event.nativeEvent,
        focusedRowIndex,
        users.length,
        (newIndex) => {
          setFocusedRowIndex(newIndex);
          const row = rowRefs.current[newIndex];
          if (row) {
            row.focus();
          }
        },
        "vertical"
      );

      // Handle Enter key to select/deselect user
      if (event.key === "Enter" && focusedRowIndex >= 0 && onUserSelection) {
        event.preventDefault();
        const user = users[focusedRowIndex];
        const isSelected = selectedUsers.has(user.id);
        handleSelectUser(user.id, !isSelected);
      }
    },
    [focusedRowIndex, users, selectedUsers, onUserSelection]
  );

  const getUserInitials = (user: User) => {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(
      0
    )}`.toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Mobile card component for better mobile UX
  const MobileUserCard = ({ user, index }: { user: User; index: number }) => {
    const isSelected = selectedUsers.has(user.id);
    const isFocused = focusedRowIndex === index;

    return (
      <div
        className={cn(
          "border rounded-lg p-4 space-y-3 bg-card hover:bg-muted/50 transition-colors",
          isSelected && "bg-muted/30 border-primary/50",
          isFocused && "ring-2 ring-primary ring-inset"
        )}
        role="article"
        tabIndex={isFocused ? 0 : -1}
        aria-selected={isSelected}
        aria-label={`User ${user.full_name}, ${user.email}${
          isSelected ? ", selected" : ""
        }`}
        onFocus={() => setFocusedRowIndex(index)}
      >
        {/* Header with avatar, name, and selection */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {onUserSelection && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) =>
                  handleSelectUser(user.id, !!checked)
                }
                aria-label={`Select ${user.full_name} (${user.email})`}
                className="mt-1 flex-shrink-0"
              />
            )}
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage
                src={user.avatar || undefined}
                alt={`${user.full_name}'s avatar`}
              />
              <AvatarFallback className="text-sm font-medium">
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base truncate">
                {user.full_name}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {user.email}
              </div>
              {user.age && (
                <div className="text-xs text-muted-foreground">
                  Age: {user.age}
                </div>
              )}
            </div>
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 w-10 p-0 flex-shrink-0"
                aria-label={`Actions for ${user.full_name}`}
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                Actions for {user.full_name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <PermissionGuard requiredPermissions={["user:update"]}>
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit user
                </DropdownMenuItem>
              </PermissionGuard>
              <PermissionGuard requiredPermissions={["user:update"]}>
                <DropdownMenuItem
                  onClick={() => onToggleStatus(user.id, user.is_active)}
                >
                  {user.is_active ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
              </PermissionGuard>
              <DropdownMenuSeparator />
              <PermissionGuard requiredPermissions={["user:delete"]}>
                <DropdownMenuItem
                  onClick={() => onDelete(user.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete user
                </DropdownMenuItem>
              </PermissionGuard>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status and role badges */}
        <div className="flex flex-wrap gap-2">
          {onStatusChange ? (
            <UserStatusManager
              user={user}
              onStatusChange={onStatusChange}
              size="sm"
            />
          ) : (
            <UserStatusBadge user={user} size="sm" />
          )}

          {user.role && (
            <Badge variant="outline" className="gap-1 text-xs">
              <Shield className="w-3 h-3" />
              {user.role.name}
            </Badge>
          )}

          <ActivityStatusBadge user={user} />
        </div>

        {/* Additional info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Created</div>
            <div className="font-medium">{formatDate(user.created_at)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Last Login</div>
            <div className="font-medium">
              {user.last_login ? formatDate(user.last_login) : "Never"}
            </div>
          </div>
        </div>

        {/* Permissions preview for roles */}
        {user.role && user.role.permissions.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-1">
              Permissions
            </div>
            <div className="flex flex-wrap gap-1">
              {user.role.permissions.slice(0, 3).map((permission) => (
                <PermissionBadge
                  key={permission}
                  permission={permission}
                  className="text-xs"
                />
              ))}
              {user.role.permissions.length > 3 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="text-xs cursor-help"
                      >
                        +{user.role.permissions.length - 3}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        {user.role.permissions.slice(3).map((permission) => (
                          <div key={permission} className="text-xs">
                            {permission}
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Use LoadingStateWrapper for better loading and empty states
  return (
    <LoadingStateWrapper
      isLoading={isLoading}
      isEmpty={!isLoading && users.length === 0}
      loadingComponent={
        isMobile ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 space-y-3 animate-pulse"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-muted rounded w-16" />
                  <div className="h-6 bg-muted rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <TableLoading rows={5} columns={onUserSelection ? 7 : 6} />
          </div>
        )
      }
      emptyComponent={
        <div className="rounded-md border p-8">
          <EmptyState
            title="No users found"
            description="No users match your current filters. Try adjusting your search criteria."
          />
        </div>
      }
      className={isMobile ? "" : "rounded-md border"}
    >
      {isMobile ? renderMobileCards() : renderTable()}
    </LoadingStateWrapper>
  );

  function renderMobileCards() {
    return (
      <div
        className="space-y-4"
        role="list"
        aria-label="Users list"
        onKeyDown={handleTableKeyDown}
      >
        {/* Select all header for mobile */}
        {onUserSelection && users.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isAllSelected || isIndeterminate}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                aria-label={
                  isAllSelected
                    ? "Deselect all users"
                    : isIndeterminate
                    ? `Select all users (${
                        users.filter((u) => selectedUsers.has(u.id)).length
                      } of ${users.length} currently selected)`
                    : "Select all users"
                }
                className={cn(
                  isIndeterminate &&
                    !isAllSelected &&
                    "data-[state=checked]:bg-primary"
                )}
              />
              <span className="text-sm font-medium">
                {isAllSelected
                  ? `All ${users.length} users selected`
                  : isIndeterminate
                  ? `${
                      users.filter((u) => selectedUsers.has(u.id)).length
                    } of ${users.length} selected`
                  : "Select all users"}
              </span>
              {isIndeterminate && !isAllSelected && (
                <Minus className="w-3 h-3 text-primary" />
              )}
            </div>
          </div>
        )}

        {users.map((user, index) => (
          <MobileUserCard key={user.id} user={user} index={index} />
        ))}
      </div>
    );
  }

  function renderTable() {
    return (
      <Table
        ref={tableRef}
        role="table"
        aria-label="Users table"
        aria-describedby="table-description"
        onKeyDown={handleTableKeyDown}
      >
        <div id="table-description" className="sr-only">
          Table showing {users.length} users with columns for selection, user
          information, role, status, activity, creation date, and actions. Use
          arrow keys to navigate rows, Enter to select users, and Tab to
          navigate to actions.
        </div>
        <TableHeader>
          <TableRow role="row">
            {onUserSelection && (
              <TableHead className="w-[50px]" role="columnheader">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center relative">
                        <Checkbox
                          checked={isAllSelected || isIndeterminate}
                          onCheckedChange={(checked) =>
                            handleSelectAll(!!checked)
                          }
                          aria-label={
                            isAllSelected
                              ? "Deselect all users"
                              : isIndeterminate
                              ? `Select all users (${
                                  users.filter((u) => selectedUsers.has(u.id))
                                    .length
                                } of ${users.length} currently selected)`
                              : "Select all users"
                          }
                          aria-describedby="select-all-description"
                          className={cn(
                            isIndeterminate &&
                              !isAllSelected &&
                              "data-[state=checked]:bg-primary"
                          )}
                        />
                        <div id="select-all-description" className="sr-only">
                          {isAllSelected
                            ? `All ${users.length} users are selected`
                            : isIndeterminate
                            ? `${
                                users.filter((u) => selectedUsers.has(u.id))
                                  .length
                              } of ${users.length} users are selected`
                            : "No users are selected"}
                        </div>
                        {isIndeterminate && !isAllSelected && (
                          <Minus className="absolute w-3 h-3 text-primary-foreground pointer-events-none" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isAllSelected
                          ? "Deselect all users"
                          : isIndeterminate
                          ? "Select all users"
                          : "Select all users"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
            )}
            <TableHead role="columnheader">
              <SortableHeader
                field="full_name"
                label="User"
                filters={filters}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead
              className={cn(isMobile && "hidden sm:table-cell")}
              role="columnheader"
            >
              <SortableHeader
                field="role"
                label="Role"
                filters={filters}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead role="columnheader">
              <SortableHeader
                field="status"
                label="Status"
                filters={filters}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead
              className={cn(isMobile && "hidden md:table-cell")}
              role="columnheader"
            >
              <SortableHeader
                field="activity_status"
                label="Activity"
                filters={filters}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead
              className={cn(isMobile && "hidden lg:table-cell")}
              role="columnheader"
            >
              <SortableHeader
                field="created_at"
                label="Created"
                filters={filters}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="w-[100px]" role="columnheader">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user, index) => {
              const isSelected = selectedUsers.has(user.id);
              const isFocused = focusedRowIndex === index;
              return (
                <TableRow
                  key={user.id}
                  ref={(el) => (rowRefs.current[index] = el)}
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    isSelected && "bg-muted/30",
                    isFocused && "ring-2 ring-primary ring-inset"
                  )}
                  role="row"
                  tabIndex={isFocused ? 0 : -1}
                  aria-selected={isSelected}
                  aria-label={`User ${user.full_name}, ${user.email}${
                    isSelected ? ", selected" : ""
                  }`}
                  onFocus={() => setFocusedRowIndex(index)}
                >
                  {onUserSelection && (
                    <TableCell role="cell">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectUser(user.id, !!checked)
                          }
                          aria-label={`Select ${user.full_name} (${user.email})`}
                          aria-describedby={`user-${user.id}-description`}
                        />
                        <div
                          id={`user-${user.id}-description`}
                          className="sr-only"
                        >
                          {user.full_name}, {user.email},{" "}
                          {user.role?.name || "No role"},{" "}
                          {user.is_active ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </TableCell>
                  )}
                  <TableCell role="cell">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        className="w-10 h-10"
                        role="img"
                        aria-label={`Avatar for ${user.full_name}`}
                      >
                        <AvatarImage
                          src={user.avatar || undefined}
                          alt={`${user.full_name}'s avatar`}
                        />
                        <AvatarFallback
                          className="text-sm font-medium"
                          aria-label={`Initials for ${user.full_name}`}
                        >
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        {user.age && (
                          <div className="text-xs text-muted-foreground">
                            Age: {user.age}
                          </div>
                        )}
                        {/* Mobile-only: Show role and activity inline */}
                        {isMobile && (
                          <div className="flex flex-wrap gap-2 sm:hidden">
                            {user.role && (
                              <Badge
                                variant="outline"
                                className="gap-1 text-xs"
                              >
                                <Shield className="w-2 h-2" />
                                {user.role.name}
                              </Badge>
                            )}
                            <ActivityStatusBadge user={user} />
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(isMobile && "hidden sm:table-cell")}
                    role="cell"
                  >
                    {user.role ? (
                      <div className="space-y-2">
                        <Badge
                          variant="outline"
                          className="gap-1"
                          aria-label={`Role: ${user.role.name}`}
                        >
                          <Shield className="w-3 h-3" aria-hidden="true" />
                          {user.role.name}
                        </Badge>
                        <div className="flex flex-wrap gap-1">
                          {user.role.permissions
                            .slice(0, 2)
                            .map((permission) => (
                              <PermissionBadge
                                key={permission}
                                permission={permission}
                                className="text-xs"
                              />
                            ))}
                          {user.role.permissions.length > 2 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs cursor-help"
                                    aria-label={`${
                                      user.role.permissions.length - 2
                                    } additional permissions`}
                                  >
                                    +{user.role.permissions.length - 2}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    {user.role.permissions
                                      .slice(2)
                                      .map((permission) => (
                                        <div
                                          key={permission}
                                          className="text-xs"
                                        >
                                          {permission}
                                        </div>
                                      ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="secondary" aria-label="No role assigned">
                        No Role
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell role="cell">
                    {onStatusChange ? (
                      <UserStatusManager
                        user={user}
                        onStatusChange={onStatusChange}
                        size="sm"
                      />
                    ) : (
                      <UserStatusBadge user={user} size="sm" />
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(isMobile && "hidden md:table-cell")}
                    role="cell"
                  >
                    <div className="flex items-center gap-2">
                      <ActivityStatusBadge user={user} />
                      <UserActivityDetail
                        user={user}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            aria-label={`View activity details for ${user.full_name}`}
                          >
                            <Eye className="h-3 w-3" aria-hidden="true" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(isMobile && "hidden lg:table-cell")}
                    role="cell"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="text-sm cursor-help"
                            aria-label={`Created on ${formatDateTime(
                              user.created_at
                            )}`}
                          >
                            {formatDate(user.created_at)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{formatDateTime(user.created_at)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell role="cell">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          aria-label={`Actions for ${user.full_name}`}
                          aria-haspopup="menu"
                        >
                          <span className="sr-only">
                            Open actions menu for {user.full_name}
                          </span>
                          <MoreHorizontal
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        role="menu"
                        aria-label={`Actions for ${user.full_name}`}
                      >
                        <DropdownMenuLabel>
                          Actions for {user.full_name}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <PermissionGuard requiredPermissions={["user:update"]}>
                          <DropdownMenuItem
                            onClick={() => onEdit(user)}
                            role="menuitem"
                            aria-label={`Edit ${user.full_name}`}
                          >
                            <Pencil
                              className="mr-2 h-4 w-4"
                              aria-hidden="true"
                            />
                            Edit user
                          </DropdownMenuItem>
                        </PermissionGuard>
                        <PermissionGuard requiredPermissions={["user:update"]}>
                          <DropdownMenuItem
                            onClick={() =>
                              onToggleStatus(user.id, user.is_active)
                            }
                            role="menuitem"
                            aria-label={
                              user.is_active
                                ? `Deactivate ${user.full_name}`
                                : `Activate ${user.full_name}`
                            }
                          >
                            {user.is_active ? (
                              <>
                                <EyeOff
                                  className="mr-2 h-4 w-4"
                                  aria-hidden="true"
                                />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye
                                  className="mr-2 h-4 w-4"
                                  aria-hidden="true"
                                />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </PermissionGuard>
                        <DropdownMenuSeparator />
                        <PermissionGuard requiredPermissions={["user:delete"]}>
                          <DropdownMenuItem
                            onClick={() => onDelete(user.id)}
                            className="text-destructive focus:text-destructive"
                            role="menuitem"
                            aria-label={`Delete ${user.full_name} (this action cannot be undone)`}
                          >
                            <Trash2
                              className="mr-2 h-4 w-4"
                              aria-hidden="true"
                            />
                            Delete user
                          </DropdownMenuItem>
                        </PermissionGuard>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow role="row">
              <TableCell
                colSpan={onUserSelection ? 7 : 6}
                className="text-center py-8"
                role="cell"
              >
                <div
                  className="flex flex-col items-center space-y-2"
                  role="status"
                  aria-live="polite"
                >
                  <div className="text-muted-foreground">No users found</div>
                  <div className="text-sm text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  }
}
