"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Ban,
  CheckCircle,
  Trash2,
  UserCheck,
  X,
  ChevronDown,
  Users,
  Shield,
} from "lucide-react";
import { BulkOperationType, Role } from "@/types/user";

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkOperation: (operation: BulkOperationType, roleId?: string) => void;
  availableRoles?: Role[];
  disabled?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkOperation,
  availableRoles = [],
  disabled = false,
}: BulkActionBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (selectedCount === 0) {
    return null;
  }

  const handleOperation = (operation: BulkOperationType, roleId?: string) => {
    onBulkOperation(operation, roleId);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg p-4 flex items-center gap-4 min-w-[400px]">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Badge variant="secondary" className="font-medium">
            {selectedCount} selected
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOperation("ban")}
            disabled={disabled}
            className="text-destructive hover:text-destructive"
          >
            <Ban className="h-4 w-4 mr-1" />
            Ban
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOperation("unban")}
            disabled={disabled}
            className="text-green-600 hover:text-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Unban
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" disabled={disabled}>
                More
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleOperation("activate")}
                className="text-green-600"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Activate Users
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleOperation("deactivate")}
                className="text-orange-600"
              >
                <Ban className="h-4 w-4 mr-2" />
                Deactivate Users
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Role Assignment */}
              {availableRoles.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Assign Role
                  </div>
                  {availableRoles.map((role) => (
                    <DropdownMenuItem
                      key={role.id}
                      onClick={() => handleOperation("assign_role", role.id)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {role.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem
                onClick={() => handleOperation("delete")}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Users
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          disabled={disabled}
          className="ml-auto"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
