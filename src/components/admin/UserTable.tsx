"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
  UserCheck,
  UserX,
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
import { User, UserFilters, SortableUserField } from "@/types/user";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface UserTableProps {
  users: User[];
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  isLoading?: boolean;
  // Selection props
  selectedUsers?: string[];
  onSelectUser?: (userId: string, selected: boolean) => void;
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

  return (
    <Button
      variant="ghost"
      className={cn(
        "h-auto p-0 font-medium hover:bg-transparent hover:text-primary transition-colors",
        isActive && "text-primary"
      )}
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-2">
        {label}
        {getSortIcon()}
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
          icon: <div className="w-2 h-2 bg-green-500 rounded-full" />,
        };
      case "offline":
        return {
          variant: "secondary" as const,
          label: user.last_login
            ? `Last seen ${formatDistanceToNow(new Date(user.last_login))} ago`
            : "Offline",
          icon: <div className="w-2 h-2 bg-gray-400 rounded-full" />,
        };
      case "never":
        return {
          variant: "outline" as const,
          label: "Never logged in",
          icon: <div className="w-2 h-2 bg-red-400 rounded-full" />,
        };
      default:
        return {
          variant: "secondary" as const,
          label: "Unknown",
          icon: <div className="w-2 h-2 bg-gray-400 rounded-full" />,
        };
    }
  };

  const { variant, label, icon } = getActivityInfo();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className="gap-1.5">
            {icon}
            {user.activity_status === "offline" && user.last_login
              ? "Offline"
              : label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Hook to detect mobile screen size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}

export function UserTable({
  users,
  filters,
  onFiltersChange,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
  selectedUsers = [],
  onSelectUser,
  onSelectAll,
  isMobile: isMobileProp,
}: UserTableProps) {
  // Debug log to check if filters is passed correctly
  console.log("UserTable filters:", filters);

  // Use hook to detect mobile if not provided as prop
  const detectedIsMobile = useIsMobile();
  const isMobile = isMobileProp ?? detectedIsMobile;

  const handleSort = (field: SortableUserField) => {
    if (!filters) return;

    const newOrder =
      filters.sortBy === field && filters.sortOrder === "asc" ? "desc" : "asc";

    onFiltersChange({
      ...filters,
      sortBy: field,
      sortOrder: newOrder,
    });
  };

  // Selection logic
  const isAllSelected = useMemo(() => {
    if (users.length === 0) return false;
    return users.every((user) => selectedUsers.includes(user.id));
  }, [users, selectedUsers]);

  const isIndeterminate = useMemo(() => {
    if (users.length === 0) return false;
    const selectedCount = users.filter((user) =>
      selectedUsers.includes(user.id)
    ).length;
    return selectedCount > 0 && selectedCount < users.length;
  }, [users, selectedUsers]);

  const handleSelectAll = (checked: boolean) => {
    if (onSelectAll) {
      onSelectAll(checked);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (onSelectUser) {
      onSelectUser(userId, checked);
    }
  };

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

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {onSelectUser && (
                <TableHead className="w-[50px]">
                  <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                </TableHead>
              )}
              <TableHead>User</TableHead>
              <TableHead className={cn(isMobile && "hidden sm:table-cell")}>
                Role
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className={cn(isMobile && "hidden md:table-cell")}>
                Activity
              </TableHead>
              <TableHead className={cn(isMobile && "hidden lg:table-cell")}>
                Created
              </TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {onSelectUser && (
                  <TableCell>
                    <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                      <div className="w-48 h-3 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className={cn(isMobile && "hidden sm:table-cell")}>
                  <div className="w-16 h-6 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="w-16 h-6 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell className={cn(isMobile && "hidden md:table-cell")}>
                  <div className="w-20 h-6 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell className={cn(isMobile && "hidden lg:table-cell")}>
                  <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelectUser && (
              <TableHead className="w-[50px]">
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
                              ? "Select all users"
                              : "Select all users"
                          }
                          className={cn(
                            isIndeterminate &&
                              !isAllSelected &&
                              "data-[state=checked]:bg-primary"
                          )}
                        />
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
            <TableHead>
              <SortableHeader
                field="full_name"
                label="User"
                filters={filters}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className={cn(isMobile && "hidden sm:table-cell")}>
              <SortableHeader
                field="role"
                label="Role"
                filters={filters}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead>
              <SortableHeader
                field="status"
                label="Status"
                filters={filters}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className={cn(isMobile && "hidden md:table-cell")}>
              <SortableHeader
                field="activity_status"
                label="Activity"
                filters={filters}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className={cn(isMobile && "hidden lg:table-cell")}>
              <SortableHeader
                field="created_at"
                label="Created"
                filters={filters}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => {
              const isSelected = selectedUsers.includes(user.id);
              return (
                <TableRow
                  key={user.id}
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    isSelected && "bg-muted/30"
                  )}
                >
                  {onSelectUser && (
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectUser(user.id, !!checked)
                          }
                          aria-label={`Select ${user.full_name}`}
                        />
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="text-sm font-medium">
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
                  <TableCell className={cn(isMobile && "hidden sm:table-cell")}>
                    {user.role ? (
                      <div className="space-y-2">
                        <Badge variant="outline" className="gap-1">
                          <Shield className="w-3 h-3" />
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
                      <Badge variant="secondary">No Role</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "secondary"
                      }
                      className="gap-1"
                    >
                      {user.status === "active" ? (
                        <UserCheck className="w-3 h-3" />
                      ) : (
                        <UserX className="w-3 h-3" />
                      )}
                      {user.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(isMobile && "hidden md:table-cell")}>
                    <ActivityStatusBadge user={user} />
                  </TableCell>
                  <TableCell className={cn(isMobile && "hidden lg:table-cell")}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-sm cursor-help">
                            {formatDate(user.created_at)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{formatDateTime(user.created_at)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <PermissionGuard requiredPermissions={["user:update"]}>
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit user
                          </DropdownMenuItem>
                        </PermissionGuard>
                        <PermissionGuard requiredPermissions={["user:update"]}>
                          <DropdownMenuItem
                            onClick={() =>
                              onToggleStatus(user.id, user.is_active)
                            }
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
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={onSelectUser ? 7 : 6}
                className="text-center py-8"
              >
                <div className="flex flex-col items-center space-y-2">
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
    </div>
  );
}
