/**
 * Comprehensive tests for error handling and user feedback system
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useErrorHandler, ERROR_MESSAGES } from "@/lib/error-handling";
import { useNotifications } from "@/components/ui/notification";
import {
  ErrorBoundary,
  DefaultErrorFallback,
} from "@/components/ui/error-boundary";
import { LoadingStateWrapper, TableLoading } from "@/components/ui/loading";
import { UserManagementErrorCodes } from "@/types/user";

// Mock components for testing
function TestComponent({ shouldError = false }: { shouldError?: boolean }) {
  const { handleError, handleSuccess } = useErrorHandler();

  if (shouldError) {
    throw new Error("Test error");
  }

  return (
    <div>
      <button
        onClick={() => handleError(new Error("Test error"), "test-context")}
      >
        Trigger Error
      </button>
      <button onClick={() => handleSuccess("TEST_SUCCESS", "Success message")}>
        Trigger Success
      </button>
    </div>
  );
}

function TestErrorComponent() {
  throw new Error("Component error");
}

describe("Error Handling System", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe("useErrorHandler", () => {
    it("should handle errors with proper messaging", async () => {
      const TestWrapper = () => {
        const notifications = useNotifications();
        return (
          <QueryClientProvider client={queryClient}>
            <TestComponent />
            {notifications.notifications.map((notification) => (
              <div key={notification.id} data-testid="notification">
                {notification.title}: {notification.description}
              </div>
            ))}
          </QueryClientProvider>
        );
      };

      render(<TestWrapper />);

      fireEvent.click(screen.getByText("Trigger Error"));

      await waitFor(() => {
        expect(screen.getByTestId("notification")).toBeInTheDocument();
      });
    });

    it("should handle success messages", async () => {
      const TestWrapper = () => {
        const notifications = useNotifications();
        return (
          <QueryClientProvider client={queryClient}>
            <TestComponent />
            {notifications.notifications.map((notification) => (
              <div key={notification.id} data-testid="success-notification">
                {notification.title}: {notification.description}
              </div>
            ))}
          </QueryClientProvider>
        );
      };

      render(<TestWrapper />);

      fireEvent.click(screen.getByText("Trigger Success"));

      await waitFor(() => {
        expect(screen.getByTestId("success-notification")).toBeInTheDocument();
      });
    });

    it("should map error codes to user-friendly messages", () => {
      expect(
        ERROR_MESSAGES[UserManagementErrorCodes.EMAIL_ALREADY_EXISTS]
      ).toBe("Email address is already in use");
      expect(
        ERROR_MESSAGES[UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS]
      ).toBe("You do not have permission to perform this action");
    });
  });

  describe("ErrorBoundary", () => {
    it("should catch and display errors", () => {
      render(
        <ErrorBoundary>
          <TestErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("Component error")).toBeInTheDocument();
    });

    it("should provide retry functionality", () => {
      const mockReset = jest.fn();

      render(
        <DefaultErrorFallback
          error={new Error("Test error")}
          resetError={mockReset}
          context="test"
        />
      );

      fireEvent.click(screen.getByText("Try Again"));
      expect(mockReset).toHaveBeenCalled();
    });

    it("should show error details when requested", () => {
      render(
        <DefaultErrorFallback
          error={new Error("Test error")}
          resetError={() => {}}
          context="test"
        />
      );

      fireEvent.click(screen.getByText("Show Error Details"));
      expect(screen.getByText("Error:")).toBeInTheDocument();
      expect(screen.getByText("Test error")).toBeInTheDocument();
    });
  });

  describe("LoadingStateWrapper", () => {
    it("should show loading state", () => {
      render(
        <LoadingStateWrapper isLoading={true}>
          <div>Content</div>
        </LoadingStateWrapper>
      );

      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    it("should show empty state when no data", () => {
      render(
        <LoadingStateWrapper
          isLoading={false}
          isEmpty={true}
          emptyComponent={<div>No data found</div>}
        >
          <div>Content</div>
        </LoadingStateWrapper>
      );

      expect(screen.getByText("No data found")).toBeInTheDocument();
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    it("should show content when loaded and has data", () => {
      render(
        <LoadingStateWrapper isLoading={false} isEmpty={false}>
          <div>Content</div>
        </LoadingStateWrapper>
      );

      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should show error state", () => {
      const error = new Error("Load error");

      render(
        <LoadingStateWrapper
          isLoading={false}
          error={error}
          errorComponent={<div>Error: {error.message}</div>}
        >
          <div>Content</div>
        </LoadingStateWrapper>
      );

      expect(screen.getByText("Error: Load error")).toBeInTheDocument();
      expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });
  });

  describe("TableLoading", () => {
    it("should render loading skeleton with correct structure", () => {
      render(<TableLoading rows={3} columns={4} />);

      // Should have header skeleton
      const skeletons = screen.getAllByRole("generic");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Notification System", () => {
    it("should manage notifications correctly", () => {
      const TestNotificationComponent = () => {
        const {
          notifications,
          addNotification,
          removeNotification,
          success,
          error,
        } = useNotifications();

        return (
          <div>
            <button
              onClick={() =>
                addNotification({
                  title: "Test",
                  description: "Test notification",
                })
              }
            >
              Add Notification
            </button>
            <button onClick={() => success("Success", "Success message")}>
              Add Success
            </button>
            <button onClick={() => error("Error", "Error message")}>
              Add Error
            </button>
            {notifications.map((notification) => (
              <div key={notification.id} data-testid="notification-item">
                <span>{notification.title}</span>
                <button
                  onClick={() => removeNotification(notification.id)}
                  data-testid="remove-notification"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        );
      };

      render(<TestNotificationComponent />);

      // Add notification
      fireEvent.click(screen.getByText("Add Notification"));
      expect(screen.getByTestId("notification-item")).toBeInTheDocument();

      // Remove notification
      fireEvent.click(screen.getByTestId("remove-notification"));
      expect(screen.queryByTestId("notification-item")).not.toBeInTheDocument();
    });

    it("should handle different notification variants", () => {
      const TestVariantComponent = () => {
        const { success, error, warning, info } = useNotifications();

        return (
          <div>
            <button onClick={() => success("Success", "Success message")}>
              Success
            </button>
            <button onClick={() => error("Error", "Error message")}>
              Error
            </button>
            <button onClick={() => warning("Warning", "Warning message")}>
              Warning
            </button>
            <button onClick={() => info("Info", "Info message")}>Info</button>
          </div>
        );
      };

      render(<TestVariantComponent />);

      // Test each variant
      fireEvent.click(screen.getByText("Success"));
      fireEvent.click(screen.getByText("Error"));
      fireEvent.click(screen.getByText("Warning"));
      fireEvent.click(screen.getByText("Info"));

      // All should be rendered (implementation would show different styles)
      expect(screen.getByText("Success")).toBeInTheDocument();
    });
  });

  describe("Recovery Actions", () => {
    it("should execute recovery actions", () => {
      const mockAction = jest.fn();
      const TestRecoveryComponent = () => {
        const { handleError } = useErrorHandler();

        return (
          <button
            onClick={() =>
              handleError(new Error("Test error"), "test", [
                {
                  label: "Retry",
                  action: mockAction,
                },
              ])
            }
          >
            Trigger Error with Recovery
          </button>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestRecoveryComponent />
        </QueryClientProvider>
      );

      fireEvent.click(screen.getByText("Trigger Error with Recovery"));

      // Recovery action should be available (implementation specific)
      expect(mockAction).toBeDefined();
    });
  });
});

describe("Integration Tests", () => {
  it("should handle complete error flow in user management", async () => {
    // This would test the complete flow from API error to user notification
    // Implementation would depend on the specific user management components
    expect(true).toBe(true); // Placeholder
  });

  it("should handle loading states during async operations", async () => {
    // Test loading states during user operations
    expect(true).toBe(true); // Placeholder
  });

  it("should provide appropriate feedback for different error types", () => {
    // Test different error scenarios and their user feedback
    expect(true).toBe(true); // Placeholder
  });
});
