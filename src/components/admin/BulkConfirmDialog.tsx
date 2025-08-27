"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Trash2,
  UserCheck,
  Shield,
  Users,
} from "lucide-react";
import { BulkOperationType, User, Role } from "@/types/user";

interface BulkConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: BulkOperationType | null;
  selectedUsers: User[];
  role?: Role;
  onConfirm: (reason?: string, options?: { force?: boolean }) => void;
  loading?: boolean;
}

const operationConfig = {
  ban: {
    title: "Ban Users",
    description:
      "This will ban the selected users and prevent them from accessing the system.",
    icon: Ban,
    variant: "destructive" as const,
    confirmText: "Ban Users",
    requiresReason: true,
    showForceOption: false,
  },
  unban: {
    title: "Unban Users",
    description:
      "This will unban the selected users and restore their access to the system.",
    icon: CheckCircle,
    variant: "default" as const,
    confirmText: "Unban Users",
    requiresReason: false,
    showForceOption: false,
  },
  activate: {
    title: "Activate Users",
    description:
      "This will activate the selected users and enable their access to the system.",
    icon: UserCheck,
    variant: "default" as const,
    confirmText: "Activate Users",
    requiresReason: false,
    showForceOption: false,
  },
  deactivate: {
    title: "Deactivate Users",
    description:
      "This will deactivate the selected users and disable their access to the system.",
    icon: Ban,
    variant: "secondary" as const,
    confirmText: "Deactivate Users",
    requiresReason: true,
    showForceOption: false,
  },
  delete: {
    title: "Delete Users",
    description:
      "This will permanently delete the selected users and all their data. This action cannot be undone.",
    icon: Trash2,
    variant: "destructive" as const,
    confirmText: "Delete Users",
    requiresReason: true,
    showForceOption: true,
  },
  assign_role: {
    title: "Assign Role",
    description: "This will assign the selected role to all selected users.",
    icon: Shield,
    variant: "default" as const,
    confirmText: "Assign Role",
    requiresReason: false,
    showForceOption: false,
  },
} as const;

export function BulkConfirmDialog({
  open,
  onOpenChange,
  operation,
  selectedUsers,
  role,
  onConfirm,
  loading = false,
}: BulkConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const [force, setForce] = useState(false);

  if (!operation || !operationConfig[operation]) {
    return null;
  }

  const config = operationConfig[operation];
  const Icon = config.icon;

  const handleConfirm = () => {
    const options = config.showForceOption ? { force } : undefined;
    onConfirm(config.requiresReason ? reason : undefined, options);
  };

  const handleClose = () => {
    if (!loading) {
      setReason("");
      setForce(false);
      onOpenChange(false);
    }
  };

  const isDestructive = config.variant === "destructive";
  const canConfirm = !config.requiresReason || reason.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon
              className={`h-5 w-5 ${isDestructive ? "text-destructive" : ""}`}
            />
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {config.description}
            {operation === "assign_role" && role && (
              <span className="block mt-2">
                Role: <Badge variant="outline">{role.name}</Badge>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Users Summary */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {selectedUsers.length} user
                {selectedUsers.length !== 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {selectedUsers.slice(0, 10).map((user) => (
                <div key={user.id} className="text-sm text-muted-foreground">
                  {user.full_name} ({user.email})
                </div>
              ))}
              {selectedUsers.length > 10 && (
                <div className="text-sm text-muted-foreground italic">
                  ... and {selectedUsers.length - 10} more
                </div>
              )}
            </div>
          </div>

          {/* Warning for destructive operations */}
          {isDestructive && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-destructive">Warning</div>
                <div className="text-destructive/80">
                  {operation === "delete"
                    ? "This action will permanently delete the selected users and cannot be undone."
                    : "This action will affect user access to the system."}
                </div>
              </div>
            </div>
          )}

          {/* Reason input */}
          {config.requiresReason && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason{" "}
                {config.requiresReason && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                className="min-h-[80px]"
              />
            </div>
          )}

          {/* Force option for dangerous operations */}
          {config.showForceOption && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="force"
                checked={force}
                onCheckedChange={(checked) => setForce(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="force" className="text-sm">
                Force operation (skip additional validations)
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={config.variant}
            onClick={handleConfirm}
            disabled={loading || !canConfirm}
            className={
              isDestructive ? "bg-destructive hover:bg-destructive/90" : ""
            }
          >
            {loading ? "Processing..." : config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
