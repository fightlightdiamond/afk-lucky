"use client";

import * as React from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorRecoveryAction } from "@/lib/error-handling";

export interface NotificationProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info" | "loading";
  duration?: number;
  persistent?: boolean;
  recoveryActions?: ErrorRecoveryAction[];
  onClose: () => void;
  onAction?: (actionIndex: number) => void;
}

const variantStyles = {
  default: "border bg-background text-foreground",
  success:
    "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
  error:
    "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
  warning:
    "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100",
  info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
  loading:
    "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
};

const variantIcons = {
  default: null,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

export function Notification({
  id,
  title,
  description,
  variant = "default",
  duration = 5000,
  persistent = false,
  recoveryActions = [],
  onClose,
  onAction,
}: NotificationProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    if (!persistent && duration > 0) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        setProgress((remaining / duration) * 100);

        if (remaining <= 0) {
          setIsVisible(false);
          setTimeout(onClose, 300); // Allow fade out animation
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [duration, persistent, onClose]);

  const Icon = variantIcons[variant];

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-start space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all duration-300",
        variantStyles[variant],
        "animate-in slide-in-from-right-full"
      )}
      role="alert"
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      {/* Progress bar for timed notifications */}
      {!persistent && duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20">
          <div
            className="h-full bg-current transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Icon */}
      {Icon && (
        <div className="flex-shrink-0 pt-0.5">
          <Icon
            className={cn("h-5 w-5", variant === "loading" && "animate-spin")}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 space-y-1">
        {title && (
          <div className="text-sm font-semibold leading-none tracking-tight">
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm opacity-90 leading-relaxed">
            {description}
          </div>
        )}

        {/* Recovery Actions */}
        {recoveryActions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {recoveryActions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.action();
                  onAction?.(index);
                }}
                className={cn(
                  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  action.variant === "destructive"
                    ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
                    : "bg-white/50 text-current hover:bg-white/70 dark:bg-black/20 dark:hover:bg-black/30"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="flex-shrink-0 rounded-md p-1 text-current/50 opacity-0 transition-all hover:text-current focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export interface NotificationManagerProps {
  notifications: NotificationProps[];
  onRemove: (id: string) => void;
  onAction?: (id: string, actionIndex: number) => void;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  maxNotifications?: number;
}

const positionStyles = {
  "top-right": "top-0 right-0 flex-col",
  "top-left": "top-0 left-0 flex-col",
  "bottom-right": "bottom-0 right-0 flex-col-reverse",
  "bottom-left": "bottom-0 left-0 flex-col-reverse",
  "top-center": "top-0 left-1/2 -translate-x-1/2 flex-col",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse",
};

export function NotificationManager({
  notifications,
  onRemove,
  onAction,
  position = "top-right",
  maxNotifications = 5,
}: NotificationManagerProps) {
  // Limit the number of visible notifications
  const visibleNotifications = notifications.slice(0, maxNotifications);

  return (
    <div
      className={cn(
        "fixed z-[100] flex max-h-screen w-full p-4 sm:max-w-[420px]",
        positionStyles[position]
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      {visibleNotifications.map((notification) => (
        <div key={notification.id} className="mb-2 last:mb-0">
          <Notification
            {...notification}
            onClose={() => onRemove(notification.id)}
            onAction={(actionIndex) => onAction?.(notification.id, actionIndex)}
          />
        </div>
      ))}

      {/* Show count if there are more notifications */}
      {notifications.length > maxNotifications && (
        <div className="mb-2 rounded-md bg-muted p-2 text-center text-xs text-muted-foreground">
          +{notifications.length - maxNotifications} more notifications
        </div>
      )}
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = React.useState<NotificationProps[]>(
    []
  );

  const addNotification = React.useCallback(
    (notification: Omit<NotificationProps, "id" | "onClose">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification: NotificationProps = {
        ...notification,
        id,
        onClose: () => removeNotification(id),
      };

      setNotifications((prev) => [newNotification, ...prev]);
      return id;
    },
    []
  );

  const removeNotification = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  const updateNotification = React.useCallback(
    (
      id: string,
      updates: Partial<Omit<NotificationProps, "id" | "onClose">>
    ) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
      );
    },
    []
  );

  // Convenience methods
  const success = React.useCallback(
    (title: string, description?: string) => {
      return addNotification({ title, description, variant: "success" });
    },
    [addNotification]
  );

  const error = React.useCallback(
    (
      title: string,
      description?: string,
      recoveryActions?: ErrorRecoveryAction[]
    ) => {
      return addNotification({
        title,
        description,
        variant: "error",
        persistent: true,
        recoveryActions,
      });
    },
    [addNotification]
  );

  const warning = React.useCallback(
    (title: string, description?: string) => {
      return addNotification({ title, description, variant: "warning" });
    },
    [addNotification]
  );

  const info = React.useCallback(
    (title: string, description?: string) => {
      return addNotification({ title, description, variant: "info" });
    },
    [addNotification]
  );

  const loading = React.useCallback(
    (title: string, description?: string) => {
      return addNotification({
        title,
        description,
        variant: "loading",
        persistent: true,
      });
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    updateNotification,
    success,
    error,
    warning,
    info,
    loading,
  };
}
