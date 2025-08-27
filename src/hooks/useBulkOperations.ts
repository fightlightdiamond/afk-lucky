import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BulkOperationType,
  BulkOperationRequest,
  BulkOperationResult,
  BulkOperationProgress,
  User,
  Role,
} from "@/types/user";

interface BulkOperationState {
  isConfirmDialogOpen: boolean;
  isProgressDialogOpen: boolean;
  isResultDialogOpen: boolean;
  currentOperation: BulkOperationType | null;
  selectedUsers: User[];
  selectedRole: Role | null;
  progress: BulkOperationProgress | null;
  result: BulkOperationResult | null;
  loading: boolean;
}

interface UseBulkOperationsProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useBulkOperations({
  onSuccess,
  onError,
}: UseBulkOperationsProps = {}) {
  const queryClient = useQueryClient();

  const [state, setState] = useState<BulkOperationState>({
    isConfirmDialogOpen: false,
    isProgressDialogOpen: false,
    isResultDialogOpen: false,
    currentOperation: null,
    selectedUsers: [],
    selectedRole: null,
    progress: null,
    result: null,
    loading: false,
  });

  // API function for bulk operations
  const executeBulkOperation = async (
    request: BulkOperationRequest
  ): Promise<BulkOperationResult> => {
    const response = await fetch("/api/admin/users/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Bulk operation failed");
    }

    return response.json();
  };

  // Mutation for bulk operations
  const bulkOperationMutation = useMutation({
    mutationFn: executeBulkOperation,
    onMutate: () => {
      setState((prev) => ({ ...prev, loading: true }));
    },
    onSuccess: (result) => {
      setState((prev) => ({
        ...prev,
        loading: false,
        result,
        isProgressDialogOpen: false,
        isResultDialogOpen: true,
      }));

      // Invalidate and refetch users query
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.refetchQueries({ queryKey: ["users"] });

      // Show success toast
      const operationName = state.currentOperation
        ?.replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      if (result.failed === 0) {
        toast.success(
          `${operationName} completed successfully for ${result.success} users`
        );
      } else if (result.success > 0) {
        toast.warning(
          `${operationName} partially completed: ${result.success} succeeded, ${result.failed} failed`
        );
      } else {
        toast.error(`${operationName} failed for all ${result.failed} users`);
      }

      onSuccess?.();
    },
    onError: (error: Error) => {
      setState((prev) => ({
        ...prev,
        loading: false,
        isProgressDialogOpen: false,
      }));

      toast.error(`Bulk operation failed: ${error.message}`);
      onError?.(error);
    },
  });

  // Start a bulk operation
  const startBulkOperation = (
    operation: BulkOperationType,
    users: User[],
    role?: Role
  ) => {
    setState((prev) => ({
      ...prev,
      currentOperation: operation,
      selectedUsers: users,
      selectedRole: role || null,
      isConfirmDialogOpen: true,
      result: null,
      progress: null,
    }));
  };

  // Confirm and execute the operation
  const confirmOperation = (reason?: string, options?: { force?: boolean }) => {
    if (!state.currentOperation || state.selectedUsers.length === 0) {
      return;
    }

    const request: BulkOperationRequest = {
      operation: state.currentOperation,
      userIds: state.selectedUsers.map((user) => user.id),
      roleId: state.selectedRole?.id,
      reason,
      force: options?.force,
    };

    setState((prev) => ({
      ...prev,
      isConfirmDialogOpen: false,
      isProgressDialogOpen: true,
      progress: {
        operationId: `bulk_${Date.now()}`,
        operation: state.currentOperation!,
        status: "in_progress",
        progress: 0,
        processed: 0,
        total: state.selectedUsers.length,
        startedAt: new Date().toISOString(),
      },
    }));

    bulkOperationMutation.mutate(request);
  };

  // Cancel operation (if supported)
  const cancelOperation = () => {
    // For now, we'll just close the progress dialog
    // In a real implementation, you might want to send a cancel request to the server
    setState((prev) => ({
      ...prev,
      isProgressDialogOpen: false,
      loading: false,
    }));

    toast.info("Operation cancelled");
  };

  // Retry failed operations
  const retryFailedOperations = () => {
    if (!state.result || !state.currentOperation) {
      return;
    }

    // Get failed user IDs from the result
    const failedUserIds = state.result.details?.failedIds || [];
    const failedUsers = state.selectedUsers.filter((user) =>
      failedUserIds.includes(user.id)
    );

    if (failedUsers.length === 0) {
      toast.error("No failed operations to retry");
      return;
    }

    // Start a new operation with only the failed users
    setState((prev) => ({
      ...prev,
      selectedUsers: failedUsers,
      isResultDialogOpen: false,
      isConfirmDialogOpen: true,
      result: null,
    }));
  };

  // Download operation report
  const downloadReport = () => {
    if (!state.result) {
      return;
    }

    // Create a simple CSV report
    const csvContent = [
      "Operation,Total,Success,Failed,Skipped,Duration",
      `${state.currentOperation},${state.result.total},${
        state.result.success
      },${state.result.failed},${state.result.skipped},${
        state.result.duration || 0
      }ms`,
      "",
      "Errors:",
      "User,Error,Code,Timestamp",
      ...state.result.errors.map(
        (error) =>
          `"${error.userEmail || error.userId}","${error.error}","${
            error.code
          }","${error.timestamp}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bulk-operation-report-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Report downloaded");
  };

  // Close dialogs
  const closeConfirmDialog = () => {
    setState((prev) => ({ ...prev, isConfirmDialogOpen: false }));
  };

  const closeProgressDialog = () => {
    setState((prev) => ({ ...prev, isProgressDialogOpen: false }));
  };

  const closeResultDialog = () => {
    setState((prev) => ({
      ...prev,
      isResultDialogOpen: false,
      currentOperation: null,
      selectedUsers: [],
      selectedRole: null,
      result: null,
      progress: null,
    }));
  };

  return {
    // State
    ...state,

    // Actions
    startBulkOperation,
    confirmOperation,
    cancelOperation,
    retryFailedOperations,
    downloadReport,

    // Dialog controls
    closeConfirmDialog,
    closeProgressDialog,
    closeResultDialog,

    // Mutation state
    isLoading: bulkOperationMutation.isPending,
    error: bulkOperationMutation.error,
  };
}
