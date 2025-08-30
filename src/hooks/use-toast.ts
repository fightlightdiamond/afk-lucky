"use client";

import { useCallback } from "react";
import { useNotifications } from "@/components/ui/notification";
import { ErrorRecoveryAction } from "@/lib/error-handling";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  duration?: number;
  persistent?: boolean;
  recoveryActions?: ErrorRecoveryAction[];
}

export function useToast() {
  const notifications = useNotifications();

  const toast = useCallback(
    (options: ToastOptions) => {
      // Map variants to notification variants
      const variantMap = {
        default: "default" as const,
        destructive: "error" as const,
        success: "success" as const,
        warning: "warning" as const,
        info: "info" as const,
      };

      const variant = variantMap[options.variant || "default"];

      // Use the notification system if available
      if (notifications) {
        return notifications.addNotification({
          title: options.title,
          description: options.description,
          variant,
          duration: options.duration,
          persistent: options.persistent,
          recoveryActions: options.recoveryActions,
        });
      }

      // Fallback to global toast function if available
      if (typeof window !== "undefined" && (window as any).toast) {
        (window as any).toast({
          title: options.title,
          description: options.description,
          variant:
            options.variant === "destructive" ? "destructive" : "default",
        });
      } else {
        // Fallback to console for server-side or if toast not available
        console.log("Toast:", options);
      }
    },
    [notifications]
  );

  // Convenience methods
  const success = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, variant: "success" });
    },
    [toast]
  );

  const error = useCallback(
    (
      title: string,
      description?: string,
      recoveryActions?: ErrorRecoveryAction[]
    ) => {
      return toast({
        title,
        description,
        variant: "destructive",
        persistent: true,
        recoveryActions,
      });
    },
    [toast]
  );

  const warning = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, variant: "warning" });
    },
    [toast]
  );

  const info = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, variant: "info" });
    },
    [toast]
  );

  return {
    toast,
    success,
    error,
    warning,
    info,
  };
}
