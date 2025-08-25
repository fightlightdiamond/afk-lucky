"use client";

import { useUsers } from "@/hooks/useUsers";
import { useUserMutations } from "@/hooks/useUserMutations";
import { useUserManagement } from "./UserManagementProvider";
import { UserActions } from "./UserActions";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { UserPagination } from "./UserPagination";
import { UserDialog } from "./UserDialog";
import { toast } from "sonner";

interface UserManagementPageProps {
  roles: Array<{ id: string; name: string }>;
}

export function UserManagementPage({ roles }: UserManagementPageProps) {
  const {
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    selectedUsers,
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedUser,
    closeDialogs,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
  } = useUserManagement();

  // Fetch users with current filters and pagination
  const {
    data: usersData,
    isLoading,
    error,
  } = useUsers({
    page: currentPage,
    pageSize,
    ...filters,
  });

  // User mutations
  const { createUser, updateUser, deleteUser, toggleStatus } =
    useUserMutations();

  // Handle user creation/update
  const handleUserSubmit = async (data: unknown) => {
    try {
      if (selectedUser) {
        // Update existing user
        await updateUser.mutateAsync({ ...data, id: selectedUser.id });
      } else {
        // Create new user
        await createUser.mutateAsync(data);
      }
      closeDialogs();
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Error submitting user:", error);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser.mutateAsync(userId);
      clearSelection();
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    await toggleStatus.mutateAsync({
      userId,
      isActive: !currentStatus,
    });
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedUsers.size} users?`
    );

    if (confirmed) {
      try {
        const promises = Array.from(selectedUsers).map((userId) =>
          deleteUser.mutateAsync(userId)
        );
        await Promise.all(promises);
        clearSelection();
        toast.success(`${selectedUsers.size} users deleted successfully`);
      } catch (error) {
        toast.error("Some users could not be deleted");
      }
    }
  };

  const handleBulkActivate = async () => {
    if (selectedUsers.size === 0) return;

    try {
      const promises = Array.from(selectedUsers).map((userId) =>
        toggleStatus.mutateAsync({ userId, isActive: true })
      );
      await Promise.all(promises);
      clearSelection();
      toast.success(`${selectedUsers.size} users activated successfully`);
    } catch (error) {
      toast.error("Some users could not be activated");
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.size === 0) return;

    try {
      const promises = Array.from(selectedUsers).map((userId) =>
        toggleStatus.mutateAsync({ userId, isActive: false })
      );
      await Promise.all(promises);
      clearSelection();
      toast.success(`${selectedUsers.size} users deactivated successfully`);
    } catch (error) {
      toast.error("Some users could not be deactivated");
    }
  };

  // Handle export/import (placeholder functions)
  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  const handleImport = () => {
    toast.info("Import functionality coming soon");
  };

  // Handle pagination changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    clearSelection(); // Clear selection when changing pages
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    clearSelection();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">
            Error Loading Users
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  const users = usersData?.data || [];
  const totalUsers = usersData?.pagination?.total || 0;
  const userIds = users.map((user) => user.id);

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <UserActions
        totalUsers={totalUsers}
        onExport={handleExport}
        onImport={handleImport}
        onBulkDelete={handleBulkDelete}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
      />

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFiltersChange={setFilters}
        roles={roles}
        isLoading={isLoading}
      />

      {/* Users table */}
      <UserTable
        users={users}
        isLoading={isLoading}
        selectedUsers={selectedUsers}
        onUserSelect={toggleUserSelection}
        onSelectAll={() => selectAllUsers(userIds)}
        onDeleteUser={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
        roles={roles}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Pagination */}
      {usersData?.pagination && (
        <UserPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalUsers}
          totalPages={usersData.pagination.totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Create/Edit User Dialog */}
      <UserDialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={closeDialogs}
        user={selectedUser}
        roles={roles}
        onSubmit={handleUserSubmit}
        isLoading={createUser.isPending || updateUser.isPending}
      />
    </div>
  );
}
