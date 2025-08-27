"use client";

import { useState } from "react";
import { UserCheck, UserX, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User, UserStatus } from "@/types/user";
import { cn } from "@/lib/utils";

interface UserStatusManagerProps {
  user: User;
  onStatusChange: (
    userId: string,
    newStatus: UserStatus,
    reason?: string
  ) => Promise<void>;
  disabled?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

interface StatusAction {
  type: "activate" | "deactivate" | "ban" | "unban";
  newStatus: UserStatus;
  title: string;
  description: string;
  confirmText: string;
  icon: React.ReactNode;
  variant: "default" | "destructive" | "secondary";
}

export function UserStatusManager({
  user,
  onStatusChange,
  disabled = false,
  showLabel = true,
  size = "md",
}: UserStatusManagerProps) {
  const [pendingAction, setPendingAction] = useState<StatusAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get current status info
  const getStatusInfo = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return {
          label: "Active",
          variant: "default" as const,
          icon: <UserCheck className="w-3 h-3" />,
          color: "text-green-600",
          bgColor: "bg-green-50 border-green-200",
        };
      case UserStatus.INACTIVE:
        return {
          label: "Inactive",
          variant: "secondary" as const,
          icon: <UserX className="w-3 h-3" />,
          color: "text-gray-600",
          bgColor: "bg-gray-50 border-gray-200",
        };
      case UserStatus.BANNED:
        return {
          label: "Banned",
          variant: "destructive" as const,
          icon: <Shield className="w-3 h-3" />,
          color: "text-red-600",
          bgColor: "bg-red-50 border-red-200",
        };
      case UserStatus.SUSPENDED:
        return {
          label: "Suspended",
          variant: "destructive" as const,
          icon: <AlertTriangle className="w-3 h-3" />,
          color: "text-orange-600",
          bgColor: "bg-orange-50 border-orange-200",
        };
      default:
        return {
          label: "Unknown",
          variant: "secondary" as const,
          icon: <UserX className="w-3 h-3" />,
          color: "text-gray-600",
          bgColor: "bg-gray-50 border-gray-200",
        };
    }
  };

  // Get available actions based on current status
  const getAvailableActions = (): StatusAction[] => {
    const actions: StatusAction[] = [];

    switch (user.status) {
      case UserStatus.ACTIVE:
        actions.push(
          {
            type: "deactivate",
            newStatus: UserStatus.INACTIVE,
            title: "Deactivate User",
            description: `Are you sure you want to deactivate ${user.full_name}? They will not be able to log in until reactivated.`,
            confirmText: "Deactivate",
            icon: <UserX className="w-4 h-4" />,
            variant: "secondary",
          },
          {
            type: "ban",
            newStatus: UserStatus.BANNED,
            title: "Ban User",
            description: `Are you sure you want to ban ${user.full_name}? This is a more severe action than deactivation and should be used for policy violations.`,
            confirmText: "Ban User",
            icon: <Shield className="w-4 h-4" />,
            variant: "destructive",
          }
        );
        break;

      case UserStatus.INACTIVE:
        actions.push(
          {
            type: "activate",
            newStatus: UserStatus.ACTIVE,
            title: "Activate User",
            description: `Are you sure you want to activate ${user.full_name}? They will be able to log in and access the system.`,
            confirmText: "Activate",
            icon: <UserCheck className="w-4 h-4" />,
            variant: "default",
          },
          {
            type: "ban",
            newStatus: UserStatus.BANNED,
            title: "Ban User",
            description: `Are you sure you want to ban ${user.full_name}? This is a more severe action than deactivation and should be used for policy violations.`,
            confirmText: "Ban User",
            icon: <Shield className="w-4 h-4" />,
            variant: "destructive",
          }
        );
        break;

      case UserStatus.BANNED:
        actions.push({
          type: "unban",
          newStatus: UserStatus.INACTIVE,
          title: "Unban User",
          description: `Are you sure you want to unban ${user.full_name}? They will be set to inactive status and can be activated later.`,
          confirmText: "Unban",
          icon: <UserCheck className="w-4 h-4" />,
          variant: "default",
        });
        break;

      case UserStatus.SUSPENDED:
        actions.push(
          {
            type: "activate",
            newStatus: UserStatus.ACTIVE,
            title: "Reactivate User",
            description: `Are you sure you want to reactivate ${user.full_name}? They will be able to log in and access the system.`,
            confirmText: "Reactivate",
            icon: <UserCheck className="w-4 h-4" />,
            variant: "default",
          },
          {
            type: "ban",
            newStatus: UserStatus.BANNED,
            title: "Ban User",
            description: `Are you sure you want to ban ${user.full_name}? This will change their status from suspended to banned.`,
            confirmText: "Ban User",
            icon: <Shield className="w-4 h-4" />,
            variant: "destructive",
          }
        );
        break;
    }

    return actions;
  };

  const handleStatusChange = async (action: StatusAction) => {
    setIsLoading(true);
    try {
      await onStatusChange(
        user.id,
        action.newStatus,
        `Status changed via ${action.type} action`
      );
      setPendingAction(null);
    } catch (error) {
      console.error("Failed to change user status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentStatusInfo = getStatusInfo(user.status);
  const availableActions = getAvailableActions();

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Current Status Badge */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={currentStatusInfo.variant}
                className={cn(
                  "gap-1.5 font-medium",
                  sizeClasses[size],
                  currentStatusInfo.bgColor,
                  currentStatusInfo.color
                )}
              >
                {currentStatusInfo.icon}
                {showLabel && currentStatusInfo.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">Status: {currentStatusInfo.label}</p>
                <p className="text-xs text-muted-foreground">
                  {user.status === UserStatus.ACTIVE &&
                    "User can log in and access the system"}
                  {user.status === UserStatus.INACTIVE && "User cannot log in"}
                  {user.status === UserStatus.BANNED &&
                    "User is banned from the system"}
                  {user.status === UserStatus.SUSPENDED &&
                    "User account is temporarily suspended"}
                </p>
                {user.updated_at && (
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(user.updated_at).toLocaleString()}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Action Buttons */}
        {availableActions.length > 0 && !disabled && (
          <div className="flex gap-1">
            {availableActions.map((action) => (
              <TooltipProvider key={action.type}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingAction(action)}
                      disabled={isLoading}
                      className={cn(
                        "h-8 w-8 p-0",
                        action.variant === "destructive" &&
                          "hover:bg-red-50 hover:text-red-600",
                        action.variant === "default" &&
                          "hover:bg-green-50 hover:text-green-600"
                      )}
                    >
                      {action.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{action.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!pendingAction}
        onOpenChange={() => setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {pendingAction?.icon}
              {pendingAction?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>{pendingAction?.description}</p>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">User:</span>
                  <span>
                    {user.full_name} ({user.email})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <span className="font-medium">Current Status:</span>
                  <Badge variant={currentStatusInfo.variant} className="gap-1">
                    {currentStatusInfo.icon}
                    {currentStatusInfo.label}
                  </Badge>
                </div>
                {pendingAction && (
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="font-medium">New Status:</span>
                    <Badge
                      variant={getStatusInfo(pendingAction.newStatus).variant}
                      className="gap-1"
                    >
                      {getStatusInfo(pendingAction.newStatus).icon}
                      {getStatusInfo(pendingAction.newStatus).label}
                    </Badge>
                  </div>
                )}
              </div>
              {pendingAction?.type === "ban" && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Warning</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Banning a user is a serious action. Make sure this is
                    appropriate for the situation.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingAction && handleStatusChange(pendingAction)}
              disabled={isLoading}
              className={cn(
                pendingAction?.variant === "destructive" &&
                  "bg-red-600 hover:bg-red-700"
              )}
            >
              {isLoading ? "Processing..." : pendingAction?.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
