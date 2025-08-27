"use client";

import { BulkActionBar } from "./BulkActionBar";
import { BulkConfirmDialog } from "./BulkConfirmDialog";
import { BulkProgressDialog } from "./BulkProgressDialog";
import { BulkResultDialog } from "./BulkResultDialog";
import { useBulkOperations } from "@/hooks/useBulkOperations";
import { BulkOperationType, User, Role } from "@/types/user";

interface BulkOperationsProps {
  selectedUsers: User[];
  onClearSelection: () => void;
  availableRoles?: Role[];
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function BulkOperations({
  selectedUsers,
  onClearSelection,
  availableRoles = [],
  disabled = false,
  onSuccess,
  onError,
}: BulkOperationsProps) {
  const {
    // State
    isConfirmDialogOpen,
    isProgressDialogOpen,
    isResultDialogOpen,
    currentOperation,
    selectedRole,
    progress,
    result,
    loading,

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
  } = useBulkOperations({ onSuccess, onError });

  const handleBulkOperation = (
    operation: BulkOperationType,
    roleId?: string
  ) => {
    const role = roleId
      ? availableRoles.find((r) => r.id === roleId)
      : undefined;
    startBulkOperation(operation, selectedUsers, role);
  };

  const handleClearSelection = () => {
    onClearSelection();
  };

  return (
    <>
      {/* Floating Action Bar */}
      <BulkActionBar
        selectedCount={selectedUsers.length}
        onClearSelection={handleClearSelection}
        onBulkOperation={handleBulkOperation}
        availableRoles={availableRoles}
        disabled={disabled || loading}
      />

      {/* Confirmation Dialog */}
      <BulkConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={closeConfirmDialog}
        operation={currentOperation}
        selectedUsers={selectedUsers}
        role={selectedRole}
        onConfirm={confirmOperation}
        loading={loading}
      />

      {/* Progress Dialog */}
      <BulkProgressDialog
        open={isProgressDialogOpen}
        onOpenChange={closeProgressDialog}
        progress={progress}
        onCancel={cancelOperation}
        canCancel={true}
      />

      {/* Result Dialog */}
      <BulkResultDialog
        open={isResultDialogOpen}
        onOpenChange={closeResultDialog}
        result={result}
        operation={currentOperation}
        onRetry={retryFailedOperations}
        onDownloadReport={downloadReport}
      />
    </>
  );
}
