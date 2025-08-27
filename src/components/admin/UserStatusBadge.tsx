"use client";

import { UserCheck, UserX, Shield, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User, UserStatus } from "@/types/user";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface UserStatusBadgeProps {
  user: User;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  icon: React.ReactNode;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
  description: string;
  priority: number; // For sorting/importance
}

const STATUS_CONFIGS: Record<UserStatus, StatusConfig> = {
  [UserStatus.ACTIVE]: {
    label: "Active",
    icon: <UserCheck className="w-3 h-3" />,
    variant: "default",
    className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
    description: "User can log in and access the system",
    priority: 1,
  },
  [UserStatus.INACTIVE]: {
    label: "Inactive",
    icon: <UserX className="w-3 h-3" />,
    variant: "secondary",
    className: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
    description: "User cannot log in to the system",
    priority: 2,
  },
  [UserStatus.BANNED]: {
    label: "Banned",
    icon: <Shield className="w-3 h-3" />,
    variant: "destructive",
    className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    description: "User is permanently banned from the system",
    priority: 4,
  },
  [UserStatus.SUSPENDED]: {
    label: "Suspended",
    icon: <AlertTriangle className="w-3 h-3" />,
    variant: "destructive",
    className:
      "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    description: "User account is temporarily suspended",
    priority: 3,
  },
  [UserStatus.PENDING]: {
    label: "Pending",
    icon: <Clock className="w-3 h-3" />,
    variant: "outline",
    className:
      "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
    description: "User account is pending activation",
    priority: 2,
  },
};

export function UserStatusBadge({
  user,
  showTooltip = true,
  size = "md",
  showIcon = true,
  showLabel = true,
  className,
}: UserStatusBadgeProps) {
  const config =
    STATUS_CONFIGS[user.status] || STATUS_CONFIGS[UserStatus.INACTIVE];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  // Clone the icon with the appropriate size
  const sizedIcon =
    showIcon && config.icon ? (
      <span className={iconSizes[size]}>{config.icon}</span>
    ) : null;

  const badge = (
    <Badge
      variant={config.variant}
      className={cn(
        "font-medium border transition-colors",
        config.className,
        sizeClasses[size],
        !showLabel && !showIcon && "w-3 h-3 p-0 rounded-full",
        className
      )}
    >
      {sizedIcon}
      {showLabel && config.label}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {config.icon}
                <span className="font-medium">{config.label}</span>
              </div>
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  user.status === UserStatus.ACTIVE && "bg-green-500",
                  user.status === UserStatus.INACTIVE && "bg-gray-400",
                  user.status === UserStatus.BANNED && "bg-red-500",
                  user.status === UserStatus.SUSPENDED && "bg-orange-500",
                  user.status === UserStatus.PENDING && "bg-yellow-500"
                )}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>

            {/* Additional status information */}
            <div className="space-y-1 text-xs text-muted-foreground border-t pt-2">
              {user.updated_at && (
                <div>
                  <span className="font-medium">Last updated:</span>{" "}
                  {formatDistanceToNow(new Date(user.updated_at), {
                    addSuffix: true,
                  })}
                </div>
              )}

              {user.last_login && user.status === UserStatus.ACTIVE && (
                <div>
                  <span className="font-medium">Last login:</span>{" "}
                  {formatDistanceToNow(new Date(user.last_login), {
                    addSuffix: true,
                  })}
                </div>
              )}

              {user.status === UserStatus.INACTIVE && !user.last_login && (
                <div className="text-orange-600">
                  <span className="font-medium">Never logged in</span>
                </div>
              )}

              {user.status === UserStatus.BANNED && (
                <div className="text-red-600">
                  <span className="font-medium">⚠️ Banned user</span>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Utility function to get status priority for sorting
export function getStatusPriority(status: UserStatus): number {
  return STATUS_CONFIGS[status]?.priority || 999;
}

// Utility function to get status color for charts/graphs
export function getStatusColor(status: UserStatus): string {
  switch (status) {
    case UserStatus.ACTIVE:
      return "#10b981"; // green-500
    case UserStatus.INACTIVE:
      return "#6b7280"; // gray-500
    case UserStatus.BANNED:
      return "#ef4444"; // red-500
    case UserStatus.SUSPENDED:
      return "#f59e0b"; // amber-500
    case UserStatus.PENDING:
      return "#eab308"; // yellow-500
    default:
      return "#6b7280"; // gray-500
  }
}

// Utility function to check if status allows login
export function canUserLogin(status: UserStatus): boolean {
  return status === UserStatus.ACTIVE;
}

// Utility function to get all available status transitions
export function getAvailableStatusTransitions(
  currentStatus: UserStatus
): UserStatus[] {
  switch (currentStatus) {
    case UserStatus.ACTIVE:
      return [UserStatus.INACTIVE, UserStatus.BANNED, UserStatus.SUSPENDED];
    case UserStatus.INACTIVE:
      return [UserStatus.ACTIVE, UserStatus.BANNED];
    case UserStatus.BANNED:
      return [UserStatus.INACTIVE]; // Unbanning goes to inactive first
    case UserStatus.SUSPENDED:
      return [UserStatus.ACTIVE, UserStatus.BANNED];
    case UserStatus.PENDING:
      return [UserStatus.ACTIVE, UserStatus.INACTIVE];
    default:
      return [];
  }
}
