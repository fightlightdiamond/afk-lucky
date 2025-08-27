"use client";

import { useUsers } from "@/hooks/useUsers";
import { useUserMutations } from "@/hooks/useUserMutations";
import { useExport } from "@/hooks/useExport";
import { useUserManagement } from "./UserManagementProvider";
import { UserActions } from "./UserActions";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { UserPagination } from "./UserPagination";
import { UserDialog } from "./UserDialog";
import { useToast } from "@/hooks/use-toast";
import { ExportFormat } from "@/types/user";

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

  // Export functionality
  const { exportUsers } = useExport();
  const { toast } = useToast();

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
        toast({
          title: "Users Deleted",
          description: `${selectedUsers.size} users deleted successfully`,
        });
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Some users could not be deleted",
          variant: "destructive",
        });
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
      toast({
        title: "Users Activated",
        description: `${selectedUsers.size} users activated successfully`,
      });
    } catch (error) {
      toast({
        title: "Activation Failed",
        description: "Some users could not be activated",
        variant: "destructive",
      });
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
      toast({
        title: "Users Deactivated",
        description: `${selectedUsers.size} users deactivated successfully`,
      });
    } catch (error) {
      toast({
        title: "Deactivation Failed",
        description: "Some users could not be deactivated",
        variant: "destructive",
      });
    }
  };

  // Handle export
  const handleExport = async (format: ExportFormat, fields?: string[]) => {
    try {
      await exportUsers(filters, format, fields);
      toast({
        title: "Export Successful",
        description: `Users exported successfully as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description:
          error instanceof Error ? error.message : "Failed to export users",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    toast({
      title: "Import Coming Soon",
      description: "Import functionality will be available in the next update",
    });
  };

  // Handle export from UserActions (simple export without dialog)
  const handleSimpleExport = () => {
    toast({
      title: "Export Options",
      description:
        "Use the Export button in the filters section for more options",
    });
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
          <details className="mt-4 text-left">
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  const users = usersData?.users || [];
  const totalUsers = usersData?.pagination?.total || 0;
  const userIds = users.map((user) => user.id);

  // Debug info
  console.log("UserManagementPage Debug:", {
    usersData,
    users,
    totalUsers,
    isLoading,
    error,
    filters,
  });

  return (
    <div className="space-y-6">
      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <h4 className="font-semibold text-yellow-800">Debug Info:</h4>
          <div className="text-sm text-yellow-700 mt-2 grid grid-cols-2 gap-4">
            <div>
              <p>Loading: {isLoading ? "Yes" : "No"}</p>
              <p>Users Data: {usersData ? "Present" : "Null"}</p>
              <p>Users Count: {users.length}</p>
              <p>Total Users: {totalUsers}</p>
              <p>Error: {error ? "Yes" : "No"}</p>
            </div>
            <div>
              <p>Current Page: {currentPage}</p>
              <p>Page Size: {pageSize}</p>
              <p>Pagination: {usersData?.pagination ? "Present" : "Null"}</p>
              <p>Total Pages: {usersData?.pagination?.totalPages || "N/A"}</p>
              <p>
                Has Next: {usersData?.pagination?.hasNextPage ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Header with actions */}
      <UserActions
        totalUsers={totalUsers}
        onExport={handleSimpleExport}
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
        totalRecords={totalUsers}
        onExport={handleExport}
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
      <UserPagination
        pagination={
          usersData?.pagination || {
            page: currentPage,
            pageSize: pageSize,
            total: totalUsers,
            totalPages: Math.ceil(totalUsers / pageSize) || 1,
            hasNextPage: currentPage < Math.ceil(totalUsers / pageSize),
            hasPreviousPage: currentPage > 1,
            startIndex: totalUsers > 0 ? (currentPage - 1) * pageSize + 1 : 0,
            endIndex: Math.min(currentPage * pageSize, totalUsers),
            offset: (currentPage - 1) * pageSize,
            limit: pageSize,
            isFirstPage: currentPage === 1,
            isLastPage: currentPage >= Math.ceil(totalUsers / pageSize),
          }
        }
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading}
      />

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
