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
import { BulkActionBar } from "./BulkActionBar";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/lib/error-handling";
import { LoadingOverlay } from "@/components/ui/loading";
import { ExportFormat, BulkOperationType } from "@/types/user";

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
  const { handleError, handleSuccess, handleWarning } = useErrorHandler();

  // Handle user creation/update with enhanced error handling
  const handleUserSubmit = async (data: unknown) => {
    try {
      if (selectedUser) {
        // Update existing user
        await updateUser.mutateAsync({ ...data, id: selectedUser.id });
        handleSuccess("USER_UPDATED");
      } else {
        // Create new user
        await createUser.mutateAsync(data);
        handleSuccess("USER_CREATED");
      }
      closeDialogs();
    } catch (error) {
      handleError(error, selectedUser ? "user-update" : "user-create", [
        {
          label: "Try Again",
          action: () => handleUserSubmit(data),
        },
        {
          label: "Close Dialog",
          action: () => closeDialogs(),
        },
      ]);
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

  // Handle bulk operations with enhanced error handling
  const handleBulkOperation = async (
    operation: BulkOperationType,
    roleId?: string
  ) => {
    if (selectedUsers.size === 0) return;

    const operationLabels = {
      ban: "ban",
      unban: "unban",
      activate: "activate",
      deactivate: "deactivate",
      delete: "delete",
      assign_role: "assign role to",
    };

    const operationLabel = operationLabels[operation];
    const confirmed = confirm(
      `Are you sure you want to ${operationLabel} ${selectedUsers.size} user${
        selectedUsers.size === 1 ? "" : "s"
      }?`
    );

    if (!confirmed) return;

    try {
      let promises: Promise<any>[] = [];

      switch (operation) {
        case "ban":
        case "deactivate":
          promises = Array.from(selectedUsers).map((userId) =>
            toggleStatus.mutateAsync({ userId, isActive: false })
          );
          break;
        case "unban":
        case "activate":
          promises = Array.from(selectedUsers).map((userId) =>
            toggleStatus.mutateAsync({ userId, isActive: true })
          );
          break;
        case "delete":
          promises = Array.from(selectedUsers).map((userId) =>
            deleteUser.mutateAsync(userId)
          );
          break;
        case "assign_role":
          if (roleId) {
            promises = Array.from(selectedUsers).map((userId) =>
              updateUser.mutateAsync({ id: userId, role_id: roleId })
            );
          }
          break;
      }

      await Promise.all(promises);
      clearSelection();
      handleSuccess(
        "BULK_OPERATION_SUCCESS",
        `${selectedUsers.size} user${
          selectedUsers.size === 1 ? "" : "s"
        } ${operationLabel}d successfully`
      );
    } catch (error) {
      handleError(error, `bulk-${operation}`, [
        {
          label: "Retry",
          action: () => handleBulkOperation(operation, roleId),
        },
        {
          label: "Clear Selection",
          action: () => clearSelection(),
        },
      ]);
    }
  };

  // Handle export with enhanced error handling
  const handleExport = async (format: ExportFormat, fields?: string[]) => {
    try {
      await exportUsers(filters, format, fields);
      handleSuccess(
        "EXPORT_SUCCESS",
        `Users exported successfully as ${format.toUpperCase()}`
      );
    } catch (error) {
      handleError(error, "export", [
        {
          label: "Retry Export",
          action: () => handleExport(format, fields),
        },
      ]);
    }
  };

  const handleImport = () => {
    // Import functionality is now handled by the ImportDialog in UserFilters
    // This is kept for backward compatibility with UserActions
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
          <div className="mt-4 space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
            <button
              onClick={() => (window.location.href = "/admin")}
              className="px-4 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
            >
              Back to Admin
            </button>
          </div>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer">Debug Info</summary>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          )}
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
    <LoadingOverlay
      isLoading={isLoading}
      message="Loading users..."
      className="space-y-6"
    >
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
        onBulkDelete={() => handleBulkOperation("delete")}
        onBulkActivate={() => handleBulkOperation("activate")}
        onBulkDeactivate={() => handleBulkOperation("deactivate")}
      />

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFiltersChange={setFilters}
        roles={roles}
        isLoading={isLoading}
        totalRecords={totalUsers}
        onExport={handleExport}
        onImport={handleImport}
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

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedUsers.size}
        onClearSelection={clearSelection}
        onBulkOperation={handleBulkOperation}
        availableRoles={roles}
        disabled={isLoading}
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
    </LoadingOverlay>
  );
}
