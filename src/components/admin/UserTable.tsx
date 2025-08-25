"use client";

import { useState } from "react";
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
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PermissionBadge } from "@/components/admin/PermissionBadge";
import { User, UserFilters, SortableUserField } from "@/types/user";
import { formatDistanceToNow } from "date-fns";

interface UserTableProps {
  users: User[];
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  isLoading?: boolean;
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
      return <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <Button
      variant="ghost"
      className="h-auto p-0 font-medium hover:bg-transparent"
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

export function UserTable({
  users,
  filters,
  onFiltersChange,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
}: UserTableProps) {
  // Debug log to check if filters is passed correctly
  console.log("UserTable filters:", filters);

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
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                      <div className="w-48 h-3 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="w-16 h-6 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="w-16 h-6 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="w-20 h-6 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell>
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
            <TableHead>
              <SortableHeader
                field="full_name"
                label="User"
                filters={filters}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead>
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
            <TableHead>
              <SortableHeader
                field="activity_status"
                label="Activity"
                filters={filters}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead>
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
            users.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
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
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.role ? (
                    <div className="space-y-2">
                      <Badge variant="outline" className="gap-1">
                        <Shield className="w-3 h-3" />
                        {user.role.name}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {user.role.permissions.slice(0, 2).map((permission) => (
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
                  ) : (
                    <Badge variant="secondary">No Role</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === "active" ? "default" : "secondary"}
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
                <TableCell>
                  <ActivityStatusBadge user={user} />
                </TableCell>
                <TableCell>
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
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
