"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  ariaLabels,
  focusManagement,
  keyboardNavigation,
} from "@/lib/accessibility";

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
  const [isMobile, setIsMobile] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Auto-focus the bulk action bar when it appears
  useEffect(() => {
    if (selectedCount > 0 && firstButtonRef.current) {
      // Small delay to ensure the bar is rendered
      setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 100);
    }
  }, [selectedCount]);

  // Handle keyboard navigation within the bar
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClearSelection();
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  const handleOperation = (operation: BulkOperationType, roleId?: string) => {
    onBulkOperation(operation, roleId);
    setIsOpen(false);
  };

  return (
    <div
      className={`fixed ${
        isMobile
          ? "bottom-4 left-4 right-4"
          : "bottom-4 left-1/2 transform -translate-x-1/2"
      } z-50`}
      role="toolbar"
      aria-label={`Bulk actions for ${selectedCount} selected user${
        selectedCount === 1 ? "" : "s"
      }`}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={barRef}
        className={`bg-background border border-border rounded-lg shadow-lg p-4 ${
          isMobile
            ? "flex flex-col gap-3"
            : "flex items-center gap-4 min-w-[400px]"
        }`}
        role="group"
        aria-describedby="bulk-actions-description"
      >
        <div id="bulk-actions-description" className="sr-only">
          Bulk actions toolbar. {selectedCount} user
          {selectedCount === 1 ? "" : "s"} selected. Use Tab to navigate
          actions, Escape to clear selection.
        </div>

        {/* Header with selection count */}
        <div
          className={`flex items-center ${
            isMobile ? "justify-between" : "gap-2"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Badge
              variant="secondary"
              className="font-medium"
              aria-live="polite"
            >
              {selectedCount} selected
            </Badge>
          </div>

          {/* Mobile: Clear button in header */}
          {isMobile && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              disabled={disabled}
              aria-label={`Clear selection of ${selectedCount} user${
                selectedCount === 1 ? "" : "s"
              }`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>

        {/* Actions */}
        <div
          className={`flex items-center ${isMobile ? "flex-wrap" : ""} gap-2`}
        >
          {/* Quick Actions */}
          <Button
            ref={firstButtonRef}
            size={isMobile ? "default" : "sm"}
            variant="outline"
            onClick={() => handleOperation("ban")}
            disabled={disabled}
            className={`text-destructive hover:text-destructive ${
              isMobile ? "flex-1 min-h-[44px]" : ""
            }`}
            aria-label={ariaLabels.bulkAction("Ban", selectedCount)}
            aria-describedby="ban-action-description"
          >
            <Ban className="h-4 w-4 mr-1" aria-hidden="true" />
            Ban
            <span id="ban-action-description" className="sr-only">
              This will ban {selectedCount} selected user
              {selectedCount === 1 ? "" : "s"}, preventing them from logging in
            </span>
          </Button>

          <Button
            size={isMobile ? "default" : "sm"}
            variant="outline"
            onClick={() => handleOperation("unban")}
            disabled={disabled}
            className={`text-green-600 hover:text-green-700 ${
              isMobile ? "flex-1 min-h-[44px]" : ""
            }`}
            aria-label={ariaLabels.bulkAction("Unban", selectedCount)}
            aria-describedby="unban-action-description"
          >
            <CheckCircle className="h-4 w-4 mr-1" aria-hidden="true" />
            Unban
            <span id="unban-action-description" className="sr-only">
              This will unban {selectedCount} selected user
              {selectedCount === 1 ? "" : "s"}, allowing them to log in again
            </span>
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                size={isMobile ? "default" : "sm"}
                variant="outline"
                disabled={disabled}
                className={isMobile ? "flex-1 min-h-[44px]" : ""}
                aria-label="More bulk actions"
                aria-haspopup="menu"
                aria-expanded={isOpen}
              >
                More
                <ChevronDown className="h-4 w-4 ml-1" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
              role="menu"
              aria-label={`Additional bulk actions for ${selectedCount} selected user${
                selectedCount === 1 ? "" : "s"
              }`}
            >
              <DropdownMenuItem
                onClick={() => handleOperation("activate")}
                className="text-green-600"
                role="menuitem"
                aria-label={ariaLabels.bulkAction("Activate", selectedCount)}
              >
                <UserCheck className="h-4 w-4 mr-2" aria-hidden="true" />
                Activate Users
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleOperation("deactivate")}
                className="text-orange-600"
                role="menuitem"
                aria-label={ariaLabels.bulkAction("Deactivate", selectedCount)}
              >
                <Ban className="h-4 w-4 mr-2" aria-hidden="true" />
                Deactivate Users
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Role Assignment */}
              {availableRoles.length > 0 && (
                <>
                  <div
                    className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
                    role="group"
                    aria-label="Role assignment options"
                  >
                    Assign Role
                  </div>
                  {availableRoles.map((role) => (
                    <DropdownMenuItem
                      key={role.id}
                      onClick={() => handleOperation("assign_role", role.id)}
                      role="menuitem"
                      aria-label={`Assign ${
                        role.name
                      } role to ${selectedCount} selected user${
                        selectedCount === 1 ? "" : "s"
                      }`}
                    >
                      <Shield className="h-4 w-4 mr-2" aria-hidden="true" />
                      {role.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem
                onClick={() => handleOperation("delete")}
                className="text-destructive focus:text-destructive"
                role="menuitem"
                aria-label={`Delete ${selectedCount} selected user${
                  selectedCount === 1 ? "" : "s"
                } (this action cannot be undone)`}
              >
                <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                Delete Users
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop: Clear button */}
        {!isMobile && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            disabled={disabled}
            className="ml-auto"
            aria-label={`Clear selection of ${selectedCount} user${
              selectedCount === 1 ? "" : "s"
            }`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Clear selection</span>
          </Button>
        )}
      </div>
    </div>
  );
}
