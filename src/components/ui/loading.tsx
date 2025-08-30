"use client";

import React from "react";
import { Loader2, Users, Download, Upload, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingContext, LOADING_MESSAGES } from "@/lib/loading-states";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  message,
  children,
  className,
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-2">
            <LoadingSpinner size="lg" />
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ContextualLoadingProps {
  context: LoadingContext;
  isLoading: boolean;
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const contextIcons = {
  "users-fetch": Users,
  "user-create": Users,
  "user-update": Users,
  "user-delete": Users,
  "bulk-operation": Users,
  export: Download,
  import: Upload,
  "role-assignment": Users,
  "status-toggle": Users,
  search: Search,
  filter: Filter,
  pagination: Users,
};

export function ContextualLoading({
  context,
  isLoading,
  message,
  size = "md",
  className,
}: ContextualLoadingProps) {
  if (!isLoading) return null;

  const Icon = contextIcons[context] || Users;
  const defaultMessage =
    message ||
    LOADING_MESSAGES[
      context.toUpperCase().replace("-", "_") as keyof typeof LOADING_MESSAGES
    ] ||
    "Loading...";

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="relative">
        <Icon className={cn(sizeClasses[size], "text-muted-foreground")} />
        <LoadingSpinner
          size="sm"
          className="absolute -top-1 -right-1 text-primary"
        />
      </div>
      <span className="text-sm text-muted-foreground">{defaultMessage}</span>
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  total?: number;
  showPercentage?: boolean;
  showCount?: boolean;
  message?: string;
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

export function ProgressBar({
  progress,
  total = 100,
  showPercentage = true,
  showCount = false,
  message,
  variant = "default",
  className,
}: ProgressBarProps) {
  const percentage = Math.round((progress / total) * 100);

  const variantClasses = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {(message || showPercentage || showCount) && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{message}</span>
          <div className="flex items-center space-x-2">
            {showCount && (
              <span className="text-muted-foreground">
                {progress} / {total}
              </span>
            )}
            {showPercentage && (
              <span className="font-medium">{percentage}%</span>
            )}
          </div>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface TableLoadingProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableLoading({
  rows = 5,
  columns = 4,
  className,
}: TableLoadingProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header skeleton */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 flex-1 animate-pulse rounded bg-muted" />
        ))}
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={cn(
                "h-4 animate-pulse rounded bg-muted",
                colIndex === 0 ? "flex-2" : "flex-1"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface CardLoadingProps {
  count?: number;
  className?: string;
}

export function CardLoading({ count = 3, className }: CardLoadingProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface BulkOperationLoadingProps {
  operation: string;
  progress: number;
  total: number;
  currentItem?: string;
  errors?: number;
  className?: string;
}

export function BulkOperationLoading({
  operation,
  progress,
  total,
  currentItem,
  errors = 0,
  className,
}: BulkOperationLoadingProps) {
  const percentage = Math.round((progress / total) * 100);
  const isComplete = progress >= total;

  return (
    <div className={cn("space-y-4 p-4", className)}>
      <div className="flex items-center space-x-3">
        <LoadingSpinner size="md" />
        <div>
          <h3 className="font-medium">
            {isComplete ? `${operation} Complete` : `${operation} in Progress`}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isComplete
              ? `Processed ${total} items${
                  errors > 0 ? ` with ${errors} errors` : ""
                }`
              : `Processing ${currentItem || "items"}...`}
          </p>
        </div>
      </div>

      <ProgressBar
        progress={progress}
        total={total}
        showPercentage
        showCount
        variant={errors > 0 ? "warning" : "default"}
      />

      {errors > 0 && (
        <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-950">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {errors} operation{errors > 1 ? "s" : ""} failed. Check the results
            for details.
          </p>
        </div>
      )}
    </div>
  );
}

interface SearchLoadingProps {
  query: string;
  className?: string;
}

export function SearchLoading({ query, className }: SearchLoadingProps) {
  return (
    <div className={cn("flex items-center space-x-2 p-2", className)}>
      <LoadingSpinner size="sm" />
      <span className="text-sm text-muted-foreground">
        Searching for "{query}"...
      </span>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Users,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-3">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mb-4 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// Loading state wrapper component
interface LoadingStateWrapperProps {
  isLoading: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function LoadingStateWrapper({
  isLoading,
  error,
  isEmpty = false,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
  className,
}: LoadingStateWrapperProps) {
  if (isLoading) {
    return (
      <div className={className}>{loadingComponent || <TableLoading />}</div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {errorComponent || (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-sm text-red-600 mb-2">Error loading data</p>
              <p className="text-xs text-muted-foreground">{error.message}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={className}>
        {emptyComponent || (
          <EmptyState
            title="No data found"
            description="There are no items to display."
          />
        )}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}
