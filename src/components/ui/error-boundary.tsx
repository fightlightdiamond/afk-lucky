"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorFallbackProps } from "@/lib/error-handling";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  context?: string;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error
    console.error("Error caught by boundary:", error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // In production, you would send this to your error reporting service
    if (process.env.NODE_ENV === "production") {
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.handleReset}
          context={this.props.context}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
export function DefaultErrorFallback({
  error,
  resetError,
  context,
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleReportBug = () => {
    // In a real app, this would open a bug report form or email
    const subject = encodeURIComponent(
      `Bug Report: ${error.name} in ${context || "Unknown"}`
    );
    const body = encodeURIComponent(`
Error: ${error.message}
Context: ${context || "Unknown"}
Stack: ${error.stack}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `);

    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            {context
              ? `An error occurred in the ${context} component.`
              : "An unexpected error occurred."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error message */}
          <div className="rounded-md bg-red-50 p-3 dark:bg-red-950">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error.message || "Unknown error"}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReload}
                className="flex-1"
              >
                Reload Page
              </Button>
              <Button
                variant="outline"
                onClick={handleGoHome}
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={handleReportBug}
              className="w-full"
            >
              <Bug className="mr-2 h-4 w-4" />
              Report Bug
            </Button>
          </div>

          {/* Error details toggle */}
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-xs"
            >
              {showDetails ? "Hide" : "Show"} Error Details
            </Button>

            {showDetails && (
              <div className="mt-2 rounded-md bg-gray-50 p-3 dark:bg-gray-900">
                <div className="space-y-2 text-xs">
                  <div>
                    <strong>Error:</strong> {error.name}
                  </div>
                  <div>
                    <strong>Message:</strong> {error.message}
                  </div>
                  {context && (
                    <div>
                      <strong>Context:</strong> {context}
                    </div>
                  )}
                  <div>
                    <strong>Timestamp:</strong> {new Date().toLocaleString()}
                  </div>
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">
                        Stack Trace
                      </summary>
                      <pre className="mt-1 whitespace-pre-wrap break-all text-xs">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Specialized error fallbacks for different contexts
export function UserManagementErrorFallback({
  error,
  resetError,
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[300px] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle>User Management Error</CardTitle>
          <CardDescription>
            There was a problem loading the user management interface.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-md bg-red-50 p-3 dark:bg-red-950">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error.message}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={resetError} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/admin")}
              className="flex-1"
            >
              Back to Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TableErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
        <h3 className="text-lg font-semibold">Failed to load data</h3>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={resetError} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}

// Hook for using error boundary programmatically
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError,
  };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>,
  context?: string
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} context={context}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
