"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PermissionBadgeProps {
  permission: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export function PermissionBadge({
  permission,
  variant = "secondary",
  className,
}: PermissionBadgeProps) {
  const [category, action] = permission.split(":");

  // Color coding based on permission category
  const getVariant = () => {
    if (variant !== "default") return variant;

    switch (category) {
      case "user":
        return "default";
      case "role":
        return "secondary";
      case "content":
      case "story":
        return "outline";
      case "system":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatPermission = (permission: string) => {
    const [category, action] = permission.split(":");
    if (!category) return permission;
    if (!action) return category.charAt(0).toUpperCase() + category.slice(1);
    return `${category.charAt(0).toUpperCase() + category.slice(1)}: ${
      action.charAt(0).toUpperCase() + action.slice(1)
    }`;
  };

  return (
    <Badge
      variant={getVariant()}
      className={cn("text-xs", className)}
      title={permission}
    >
      {formatPermission(permission)}
    </Badge>
  );
}
