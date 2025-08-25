"use client";

import { Plus, Download, Upload, Trash2, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserManagement } from "./UserManagementProvider";

interface UserActionsProps {
  totalUsers: number;
  onExport?: () => void;
  onImport?: () => void;
  onBulkDelete?: () => void;
  onBulkActivate?: () => void;
  onBulkDeactivate?: () => void;
}

export function UserActions({
  totalUsers,
  onExport,
  onImport,
  onBulkDelete,
  onBulkActivate,
  onBulkDeactivate,
}: UserActionsProps) {
  const { selectedUsers, openCreateDialog, clearSelection } =
    useUserManagement();
  const hasSelection = selectedUsers.size > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Badge variant="secondary" className="ml-2">
          {totalUsers} users
        </Badge>
        {hasSelection && (
          <Badge variant="outline" className="ml-2">
            {selectedUsers.size} selected
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Bulk Actions - only show when users are selected */}
        {hasSelection && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkActivate}
              className="text-green-600 hover:text-green-700"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Activate ({selectedUsers.size})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDeactivate}
              className="text-orange-600 hover:text-orange-700"
            >
              <UserX className="w-4 h-4 mr-2" />
              Deactivate ({selectedUsers.size})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedUsers.size})
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear Selection
            </Button>
          </>
        )}

        {/* Regular Actions */}
        {!hasSelection && (
          <>
            <Button variant="outline" size="sm" onClick={onImport}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </>
        )}

        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>
    </div>
  );
}
