"use client";

import React from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { NotificationManager, useNotifications } from "@/components/ui/notification";
import { useErrorHandler, setupGlobalErrorHandling } from "@/lib/error-handling";
import { useLoadingStates } from "@/lib/loading-states";

interface ErrorProviderProps {
  children: React.ReactNode;
}

// Context for error handling
interface ErrorContextValue {
  handleError: ReturnType<typeof useErrorHandler>["handleError"];
  handleSuccess: ReturnType<typeof useErrorHandler>["handleSuccess"];
  handleWarning: ReturnType<typeof useErrorHandler>["handleWarning"];
  isLoading: (context: string) => boolean;
  isAnyLoading: () => boolean;
}

const ErrorContext = React.createContext<ErrorContextValue | null>(null);

export function ErrorProvider({ children }: ErrorProviderProps) {
  const notifications = useNotifications();
  const errorHandler = useErrorHandler();
  const { isLoading, isAnyLoading } = useLoadingStates();

  // Setup global error handling on mount
  React.useEffect(() => {
    setupGlobalErrorHandling();
  }, []);

  const contextValue: ErrorContextValue = {
    handleError: errorHandler.handleError,
    handleSuccess: errorHandler.handleSuccess,
    handleWarning: errorHandler.handleWarning,
    isLoading,
    isAnyLoading,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      <ErrorBoundary context="Application Root">
        {children}
        <NotificationManager
          notifications={notifications.notifications}
          onRemove={notifications.removeNotification}
          onAction={(id, actionIndex) => {
            // Handle notification actions
            const notification = notifications.notifications.find(n => n.id === id);
            if (notification?.recoveryActions?.[actionIndex]) {
              notification.recoveryActions[actionIndex].action();
            }
          }}
          position="top-right"
          maxNotifications={5}
        />
      </ErrorBoundary>
    </ErrorContext.Provider>
  );
}

// Hook to use error context
export function useErrorContext() {
  const context = React.useContext(ErrorContext);
  if (!context) {
    throw new Error("useErrorContext must be used within an ErrorProvider");
  }
  return context;
}

// Higher-order component for error handling
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  context?: string
) {
  const WrappedComponent = (props: P) => {
    const { handleError } = useErrorContext();

    // Create error boundary for this specific component
    const handleComponentError = React.useCallback((error: Error) => {
      handleError(error, context || Component.displayName || Component.name);
    }, [handleError]);

    return (
      <ErrorBoundary 
        context={context || Component.displayName || Component.name}
        onError={handleComponentError}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorHandling(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for handling async operations with error handling
export function useAsyncErrorHandler() {
  const { handleError, handleSuccess } = useErrorContext();

  const executeWithErrorHandling = React.useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string,
    successMessage?: string
  ): Promise<T | null> => {
    try {
      const result = await operation();
      if (successMessage) {
        handleSuccess(successMessage);
      }
      return result;
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError, handleSuccess]);

  return { executeWithErrorHandling };
}

// Component for displaying global loading state
export function GlobalLoadingIndicator() {
  const { isAnyLoading } = useErrorContext();

  if (!isAnyLoading()) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/20">
      <div className="h-full bg-primary animate-pulse" />
    </div>
  );
}