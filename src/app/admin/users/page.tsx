"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagementProvider } from "@/components/admin/UserManagementProvider";
import { UserTable } from "@/components/admin/UserTable";
import { UserFilters } from "@/components/admin/UserFilters";
import { UserPagination } from "@/components/admin/UserPagination";
import { UserDialog } from "@/components/admin/UserDialog";
import { useUsers } from "@/hooks/useUsers";
import { useUserMutations } from "@/hooks/useUserMutations";
import { useUserStore } from "@/store/userStore";
import { User, UserFilters as UserFiltersType } from "@/types/user";

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const {
    userFilters,
    setUserFilters,
    pagination,
    setCurrentPage,
    setPageSize,
  } = useUserStore();

  // User mutations
  const { deleteUser, toggleStatus } = useUserMutations();

  // Use the enhanced useUsers hook with proper pagination
  const {
    data: usersResponse,
    isLoading,
    error,
  } = useUsers({
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
    search: userFilters.search || undefined,
    role: userFilters.role || undefined,
    status: userFilters.status || undefined,
    sortBy: userFilters.sortBy,
    sortOrder: userFilters.sortOrder,
    hasAvatar: userFilters.hasAvatar || undefined,
    locale: userFilters.locale || undefined,
    activity_status: userFilters.activity_status || undefined,
  });

  const handleFiltersChange = (newFilters: UserFiltersType) => {
    setUserFilters(newFilters);
    // The store automatically resets to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    // The store automatically resets to first page when page size changes
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser.mutate(userId);
    }
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    // Toggle the status - if currently active, make inactive and vice versa
    const newStatus = !currentStatus;
    toggleStatus.mutate({ userId, isActive: newStatus });
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">
            Error Loading Users
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {error.message || "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <UserManagementProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
              {usersResponse?.pagination && (
                <span> ({usersResponse.pagination.total} users)</span>
              )}
            </p>
          </div>
          <Button onClick={handleCreateUser} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <UserFilters
              filters={userFilters}
              onFiltersChange={handleFiltersChange}
              roles={usersResponse?.metadata?.availableRoles || []}
            />
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <UserTable
              users={usersResponse?.users || []}
              filters={userFilters}
              onFiltersChange={handleFiltersChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {usersResponse?.pagination && (
          <UserPagination
            pagination={usersResponse.pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        {/* User Dialog */}
        <UserDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          user={selectedUser}
          roles={usersResponse?.metadata?.availableRoles || []}
          onSubmit={async (data) => {
            console.log("Submit user data:", data);
            // This will be handled by the UserDialog component internally
          }}
        />
      </div>
    </UserManagementProvider>
  );
}
