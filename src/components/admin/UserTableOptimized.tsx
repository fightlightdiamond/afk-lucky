"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
import { VirtualScroll } from "@/components/ui/virtual-scroll";
import { User, UserFilters, SortableUserField, UserStatus } from "@/types/user";
import { formatDistanceToNow } from "date-fns";
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

interface UserTableOptimizedProps {
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
  // Performance props
  enableVirtualScrolling?: boolean;
  containerHeight?: number;
  itemHeight?: number;
}

// Memoized sortable header component
const SortableHeader = React.memo<{
  field: SortableUserField;
  label: string;
  filters: UserFilters;
  onSort: (field: SortableUserField) => void;
}>(({ field, label, filters, onSort }) => {
  const isActive = filters?.sortBy === field;
  const direction = filters?.sortOrder;

  const getSortIcon = useMemo(() => {
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
  }, [isActive, direction]);

  const ariaLabel = useMemo(
    () => ariaLabels.sortButton(label, filters?.sortBy, filters?.sortOrder),
    [label, filters?.sortBy, filters?.sortOrder]
  );

  const handleClick = useCallback(() => {
    onSort(field);
  }, [field, onSort]);

  return (
    <Button
      variant="ghost"
      className={cn(
        "h-auto p-0 font-medium hover:bg-transparent hover:text-primary transition-colors",
        isActive && "text-primary"
      )}
      onClick={handleClick}
      aria-label={ariaLabel}
    >
      <span className="flex items-center gap-2">
        {label}
        {getSortIcon}
      </span>
    </Button>
  );
});

SortableHeader.displayName = "SortableHeader";

// Memoized activity status badge
const ActivityStatusBadge = React.memo<{ user: User }>(({ user }) => {
  const activityInfo = useMemo(() => {
    switch (user.activity_status) {
      case "online":
        return {
          variant: "default" as const,
          label: "Online",
          displayLabel: "Online",
          icon: (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          ),
        };
      case "offline":
        return {
          variant: "secondary" as const,
          label: user.last_login
            ? `Last seen ${formatDistanceToNow(new Date(user.last_login))} ago`
            : "Offline",
          displayLabel: "Offline",
          icon: <div className="w-2 h-2 bg-gray-400 rounded-full" />,
        };
      case "never":
        return {
          variant: "outline" as const,
          label: "Never logged in",
          displayLabel: "Never",
          icon: <div className="w-2 h-2 bg-red-400 rounded-full" />,
        };
      default:
        return {
          variant: "secondary" as const,
          label: "Unknown",
          displayLabel: "Unknown",
          icon: <div className="w-2 h-2 bg-gray-400 rounded-full" />,
        };
    }
  }, [user.activity_status, user.last_login]);

  return (
    <Badge variant={activityInfo.variant} className="gap-1.5">
      {activityInfo.icon}
      {activityInfo.displayLabel}
    </Badge>
  );
});

ActivityStatusBadge.displayName = "ActivityStatusBadge";

// Memoized user initials
const getUserInitials = (user: User) => {
  return `${user.first_name.charAt(0)}${user.last_name.charAt(
    0
  )}`.toUpperCase();
};

// Memoized date formatters
const formatDate = (dateString?: string) => {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Memoized user row component
const UserRow = React.memo<{
  user: User;
  index: number;
  isSelected: boolean;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onStatusChange?: (
    userId: string,
    newStatus: UserStatus,
    reason?: string
  ) => Promise<void>;
  onUserSelection?: (userId: string, selected: boolean) => void;
  isMobile: boolean;
}>(
  ({
    user,
    index,
    isSelected,
    onEdit,
    onDelete,
    onToggleStatus,
    onStatusChange,
    onUserSelection,
    isMobile,
  }) => {
    const handleSelectUser = useCallback(
      (checked: boolean) => {
        onUserSelection?.(user.id, checked);
      },
      [user.id, onUserSelection]
    );

    const handleEdit = useCallback(() => {
      onEdit(user);
    }, [user, onEdit]);

    const handleDelete = useCallback(() => {
      onDelete(user.id);
    }, [user.id, onDelete]);

    const handleToggleStatus = useCallback(() => {
      onToggleStatus(user.id, user.is_active);
    }, [user.id, user.is_active, onToggleStatus]);

    const userInitials = useMemo(() => getUserInitials(user), [user]);
    const createdDate = useMemo(
      () => formatDate(user.created_at),
      [user.created_at]
    );
    const lastLoginDate = useMemo(
      () => formatDate(user.last_login),
      [user.last_login]
    );

    return (
      <TableRow
        className={cn(
          "hover:bg-muted/50 transition-colors",
          isSelected && "bg-muted/30"
        )}
        role="row"
        aria-selected={isSelected}
      >
        {onUserSelection && (
          <TableCell role="cell">
            <div className="flex items-center justify-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleSelectUser}
                aria-label={`Select ${user.full_name} (${user.email})`}
              />
            </div>
          </TableCell>
        )}
        <TableCell role="cell">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={user.avatar || undefined}
                alt={`${user.full_name}'s avatar`}
              />
              <AvatarFallback className="text-sm font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="font-medium">{user.full_name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              {user.age && (
                <div className="text-xs text-muted-foreground">
                  Age: {user.age}
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
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Shield className="w-3 h-3" />
                {user.role.name}
              </Badge>
              {user.role.permissions.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">
                        {user.role.permissions.length}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        {user.role.permissions.slice(0, 5).map((permission) => (
                          <PermissionBadge
                            key={permission}
                            permission={permission}
                            className="text-xs"
                          />
                        ))}
                        {user.role.permissions.length > 5 && (
                          <div className="text-xs text-muted-foreground">
                            +{user.role.permissions.length - 5} more
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ) : (
            <Badge variant="outline">No role</Badge>
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
          <ActivityStatusBadge user={user} />
        </TableCell>
        <TableCell
          className={cn(isMobile && "hidden lg:table-cell")}
          role="cell"
        >
          <div className="text-sm">{createdDate}</div>
        </TableCell>
        <TableCell className="w-[100px]" role="cell">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label={`Actions for ${user.full_name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <PermissionGuard requiredPermissions={["user:update"]}>
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit user
                </DropdownMenuItem>
              </PermissionGuard>
              <PermissionGuard requiredPermissions={["user:update"]}>
                <DropdownMenuItem onClick={handleToggleStatus}>
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
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete user
                </DropdownMenuItem>
              </PermissionGuard>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  }
);

UserRow.displayName = "UserRow";

// Main optimized component
export const UserTableOptimized = React.memo<UserTableOptimizedProps>(
  ({
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
    enableVirtualScrolling = false,
    containerHeight = 600,
    itemHeight = 73,
  }) => {
    const { isMobile } = useResponsive();

    const handleSort = useCallback(
      (field: SortableUserField) => {
        if (!filters) return;

        const newOrder =
          filters.sortBy === field && filters.sortOrder === "asc"
            ? "desc"
            : "asc";

        onFiltersChange({
          ...filters,
          sortBy: field,
          sortOrder: newOrder,
        });

        screenReader.announceFilterChange(
          `Sort by ${field}`,
          `${field} ${newOrder === "asc" ? "ascending" : "descending"}`
        );
      },
      [filters, onFiltersChange]
    );

    // Memoized selection logic
    const selectionState = useMemo(() => {
      if (users.length === 0)
        return { isAllSelected: false, isIndeterminate: false };

      const selectedCount = users.filter((user) =>
        selectedUsers.has(user.id)
      ).length;
      const isAllSelected = selectedCount === users.length;
      const isIndeterminate = selectedCount > 0 && selectedCount < users.length;

      return { isAllSelected, isIndeterminate, selectedCount };
    }, [users, selectedUsers]);

    const handleSelectAll = useCallback(
      (checked: boolean) => {
        if (onSelectAll) {
          onSelectAll(checked);
          screenReader.announceSelection(
            checked ? users.length : 0,
            users.length
          );
        }
      },
      [onSelectAll, users.length]
    );

    // Memoized table header
    const tableHeader = useMemo(
      () => (
        <TableHeader>
          <TableRow role="row">
            {onUserSelection && (
              <TableHead className="w-[50px]" role="columnheader">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center relative">
                        <Checkbox
                          checked={
                            selectionState.isAllSelected ||
                            selectionState.isIndeterminate
                          }
                          onCheckedChange={handleSelectAll}
                          aria-label={
                            selectionState.isAllSelected
                              ? "Deselect all users"
                              : selectionState.isIndeterminate
                              ? `Select all users (${selectionState.selectedCount} of ${users.length} currently selected)`
                              : "Select all users"
                          }
                          className={cn(
                            selectionState.isIndeterminate &&
                              !selectionState.isAllSelected &&
                              "data-[state=checked]:bg-primary"
                          )}
                        />
                        {selectionState.isIndeterminate &&
                          !selectionState.isAllSelected && (
                            <Minus className="absolute w-3 h-3 text-primary-foreground pointer-events-none" />
                          )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {selectionState.isAllSelected
                          ? "Deselect all users"
                          : selectionState.isIndeterminate
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
      ),
      [
        onUserSelection,
        selectionState,
        handleSelectAll,
        users.length,
        isMobile,
        filters,
        handleSort,
      ]
    );

    // Memoized render row function for virtual scrolling
    const renderRow = useCallback(
      (user: User, index: number) => (
        <UserRow
          key={user.id}
          user={user}
          index={index}
          isSelected={selectedUsers.has(user.id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onStatusChange={onStatusChange}
          onUserSelection={onUserSelection}
          isMobile={isMobile}
        />
      ),
      [
        selectedUsers,
        onEdit,
        onDelete,
        onToggleStatus,
        onStatusChange,
        onUserSelection,
        isMobile,
      ]
    );

    // Use LoadingStateWrapper for better loading and empty states
    return (
      <LoadingStateWrapper
        isLoading={isLoading}
        isEmpty={!isLoading && users.length === 0}
        loadingComponent={
          <div className="rounded-md border">
            <TableLoading rows={5} columns={onUserSelection ? 7 : 6} />
          </div>
        }
        emptyComponent={
          <div className="rounded-md border p-8">
            <EmptyState
              title="No users found"
              description="No users match your current filters. Try adjusting your search criteria."
            />
          </div>
        }
        className="rounded-md border"
      >
        {enableVirtualScrolling && users.length > 50 ? (
          <div className="border rounded-md overflow-hidden">
            {/* Fixed header for virtual scrolling */}
            <div className="border-b bg-muted/50 min-h-[40px] p-2">
              <div className="grid grid-cols-7 gap-4 text-sm font-medium">
                {onUserSelection && <div className="w-[50px]">Select</div>}
                <div>User</div>
                <div className={cn(isMobile && "hidden sm:block")}>Role</div>
                <div>Status</div>
                <div className={cn(isMobile && "hidden md:block")}>
                  Activity
                </div>
                <div className={cn(isMobile && "hidden lg:block")}>Created</div>
                <div className="w-[100px]">Actions</div>
              </div>
            </div>

            {/* Virtual scrolled content */}
            <VirtualScroll
              items={users}
              itemHeight={itemHeight}
              containerHeight={containerHeight - 40}
              renderItem={(user, index) => (
                <div className="p-2 border-b hover:bg-muted/50 transition-colors">
                  <div className="grid grid-cols-7 gap-4 items-center">
                    {onUserSelection && (
                      <div className="w-[50px]">
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={(checked) =>
                            onUserSelection(user.id, !!checked)
                          }
                          aria-label={`Select ${user.full_name}`}
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {user.full_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <div className={cn(isMobile && "hidden sm:block")}>
                      {user.role ? (
                        <Badge variant="outline" className="text-xs">
                          {user.role.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No role
                        </span>
                      )}
                    </div>
                    <div>
                      <UserStatusBadge user={user} size="sm" />
                    </div>
                    <div className={cn(isMobile && "hidden md:block")}>
                      <ActivityStatusBadge user={user} />
                    </div>
                    <div className={cn(isMobile && "hidden lg:block")}>
                      <span className="text-xs">
                        {formatDate(user.created_at)}
                      </span>
                    </div>
                    <div className="w-[100px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Pencil className="mr-2 h-3 w-3" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(user.id)}>
                            <Trash2 className="mr-2 h-3 w-3" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )}
              getItemKey={(user) => user.id}
            />
          </div>
        ) : (
          <Table
            role="table"
            aria-label="Users table"
            aria-describedby="table-description"
          >
            <div id="table-description" className="sr-only">
              Table showing {users.length} users with columns for selection,
              user information, role, status, activity, creation date, and
              actions.
            </div>
            {tableHeader}
            <TableBody>
              {users.map((user, index) => (
                <UserRow
                  key={user.id}
                  user={user}
                  index={index}
                  isSelected={selectedUsers.has(user.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  onStatusChange={onStatusChange}
                  onUserSelection={onUserSelection}
                  isMobile={isMobile}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </LoadingStateWrapper>
    );
  }
);

UserTableOptimized.displayName = "UserTableOptimized";
