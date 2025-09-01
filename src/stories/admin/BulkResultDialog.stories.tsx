import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";
const fn = () => () => {};
import React from "react";
import { BulkResultDialog } from "@/components/admin/BulkResultDialog";
import type {
  BulkOperationType,
  BulkOperationResult,
} from "@/types/user";
import { UserManagementErrorCodes } from "@/types/user";
import { Button } from "@/components/ui/button";

// Interactive wrapper for Storybook
const InteractiveBulkResultDialog = (props: React.ComponentProps<typeof BulkResultDialog>) => {
  const [open, setOpen] = React.useState(props.open || false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Result Dialog</Button>
      <BulkResultDialog {...props} open={open} onOpenChange={setOpen} />
    </div>
  );
};

const meta: Meta<typeof BulkResultDialog> = {
  title: "Admin/BulkResultDialog",
  component: InteractiveBulkResultDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A results dialog for completed bulk operations showing success/failure statistics, detailed error reports, and action buttons for retry or download.",
      },
    },
  },
  argTypes: {
    open: {
      description: "Whether the dialog is open",
      control: { type: "boolean" },
    },
    result: {
      description: "Bulk operation result object",
      control: { type: "object" },
    },
    operation: {
      description: "Type of bulk operation",
      control: { type: "select" },
      options: [
        "ban",
        "unban",
        "activate",
        "deactivate",
        "delete",
        "assign_role",
      ],
    },
    onOpenChange: {
      description: "Callback when dialog open state changes",
      action: "openChange",
    },
    onRetry: {
      description: "Callback when retry is requested",
      action: "retry",
    },
    onDownloadReport: {
      description: "Callback when download report is requested",
      action: "downloadReport",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BulkResultDialog>;

const baseResult: Omit<BulkOperationResult, "failed" | "success" | "skipped"> = {
  operation: "ban" as BulkOperationType,
  total: 100,
  duration: 45000,
  startedAt: new Date(Date.now() - 60000).toISOString(),
  completedAt: new Date().toISOString(),
  errors: [],
};

export const FullSuccess: Story = {
  args: {
    open: false,
    operation: "ban" as BulkOperationType,
    result: {
      ...baseResult,
      success: 100,
      failed: 0,
      skipped: 0,
    },
    onOpenChange: fn(),
    onRetry: fn(),
    onDownloadReport: fn(),
  },
};

export const PartialSuccess: Story = {
  args: {
    open: false,
    operation: "delete" as BulkOperationType,
    result: {
      ...baseResult,
      success: 85,
      failed: 10,
      skipped: 5,
      errors: [
        {
          userId: "user-1",
          userEmail: "admin@example.com",
          userName: "Admin User",
          error: "Cannot delete admin user",
          code: UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
          timestamp: new Date().toISOString(),
        },
        {
          userId: "user-2",
          userEmail: "john.doe@example.com",
          userName: "John Doe",
          error: "User has active sessions",
          code: UserManagementErrorCodes.USER_SUSPENDED,
          timestamp: new Date().toISOString(),
        },
        {
          userId: "user-3",
          userEmail: "jane.smith@example.com",
          userName: "Jane Smith",
          error: "Database constraint violation",
          code: UserManagementErrorCodes.DATABASE_ERROR,
          timestamp: new Date().toISOString(),
        },
      ],
    },
    onOpenChange: fn(),
    onRetry: fn(),
    onDownloadReport: fn(),
  },
};

export const MostlyFailed: Story = {
  args: {
    open: false,
    operation: "assign_role" as BulkOperationType,
    result: {
      ...baseResult,
      success: 15,
      failed: 80,
      skipped: 5,
      errors: [
        {
          userId: "user-1",
          userEmail: "error1@example.com",
          userName: "Error User 1",
          error: "Permission denied",
          code: UserManagementErrorCodes.PERMISSION_DENIED,
          timestamp: new Date().toISOString(),
        },
        {
          userId: "user-2",
          userEmail: "error2@example.com",
          userName: "Error User 2",
          error: "User not found",
          code: UserManagementErrorCodes.USER_NOT_FOUND,
          timestamp: new Date().toISOString(),
        },
        {
          userId: "user-3",
          userEmail: "error3@example.com",
          userName: "Error User 3",
          error: "Database error",
          code: UserManagementErrorCodes.DATABASE_ERROR,
          timestamp: new Date().toISOString(),
        },
        {
          userId: "user-4",
          userEmail: "error4@example.com",
          userName: "Error User 4",
          error: "Network timeout",
          code: UserManagementErrorCodes.TIMEOUT_ERROR,
          timestamp: new Date().toISOString(),
        },
        {
          userId: "user-5",
          userEmail: "user5@example.com",
          error: "Invalid user state",
          code: UserManagementErrorCodes.VALIDATION_ERROR,
          timestamp: new Date().toISOString(),
        },
      ],
    },
    onOpenChange: fn(),
    onRetry: fn(),
    onDownloadReport: fn(),
  },
};

export const CompleteFailure: Story = {
  args: {
    open: false,
    operation: "unban" as BulkOperationType,
    result: {
      ...baseResult,
      success: 0,
      failed: 100,
      skipped: 0,
      errors: [
        {
          userId: "system",
          error: "Database connection failed",
          code: UserManagementErrorCodes.DATABASE_CONNECTION_FAILED,
          timestamp: new Date().toISOString(),
        },
        {
          userId: "system",
          error: "Authentication service unavailable",
          code: UserManagementErrorCodes.SERVICE_UNAVAILABLE,
          timestamp: new Date().toISOString(),
        },
      ],
    },
    onOpenChange: fn(),
    onRetry: fn(),
    onDownloadReport: fn(),
  },
};

export const WithWarnings: Story = {
  args: {
    open: false,
    operation: "activate" as BulkOperationType,
    result: {
      ...baseResult,
      success: 90,
      failed: 5,
      skipped: 5,
      errors: [
        {
          userId: "user-1",
          userEmail: "blocked@example.com",
          error: "User is permanently blocked",
          code: UserManagementErrorCodes.USER_SUSPENDED,
          timestamp: new Date().toISOString(),
        },
      ],
      warnings: [
        {
          userId: "user-2",
          userEmail: "warning1@example.com",
          warning: "User has no email verification",
        },
        {
          userId: "user-3",
          userEmail: "warning2@example.com",
          warning: "User profile is incomplete",
        },
        {
          userId: "user-4",
          userEmail: "warning3@example.com",
          warning: "User has expired password",
        },
      ],
    },
    onOpenChange: fn(),
    onRetry: fn(),
    onDownloadReport: fn(),
  },
};

export const LargeDataset: Story = {
  args: {
    open: false,
    operation: "ban" as BulkOperationType,
    result: {
      ...baseResult,
      total: 10000,
      success: 9500,
      failed: 400,
      skipped: 100,
      duration: 300000, // 5 minutes
      errors: Array.from({ length: 20 }, (_, i) => ({
        userId: `user-${i + 1}`,
        userEmail: `user${i + 1}@example.com`,
        userName: `User ${i + 1}`,
        error: `Error ${i + 1}: ${
          i % 4 === 0
            ? "Permission denied"
            : i % 4 === 1
            ? "User not found"
            : i % 4 === 2
            ? "Database error"
            : "Network timeout"
        }`,
        code:
          i % 4 === 0
            ? UserManagementErrorCodes.PERMISSION_DENIED
            : i % 4 === 1
            ? UserManagementErrorCodes.USER_NOT_FOUND
            : i % 4 === 2
            ? UserManagementErrorCodes.DATABASE_ERROR
            : UserManagementErrorCodes.TIMEOUT_ERROR,
        timestamp: new Date(Date.now() - i * 1000).toISOString(),
      })),
    },
    onOpenChange: fn(),
    onRetry: fn(),
    onDownloadReport: fn(),
  },
};

export const SmallDataset: Story = {
  args: {
    open: false,
    operation: "deactivate" as BulkOperationType,
    result: {
      ...baseResult,
      total: 3,
      success: 2,
      failed: 1,
      skipped: 0,
      duration: 2000, // 2 seconds
      errors: [
        {
          userId: "user-1",
          userEmail: "admin@example.com",
          userName: "Admin User",
          error: "Cannot deactivate admin user",
          code: UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
          timestamp: new Date().toISOString(),
        },
      ],
    },
    onOpenChange: fn(),
    onRetry: fn(),
    onDownloadReport: fn(),
  },
};

export const WithExportUrl: Story = {
  args: {
    open: false,
    operation: "ban" as BulkOperationType,
    result: {
      ...baseResult,
      success: 95,
      failed: 3,
      skipped: 2,
      errors: [
        {
          userId: "user-1",
          userEmail: "error@example.com",
          error: "Sample error",
          code: UserManagementErrorCodes.VALIDATION_ERROR,
          timestamp: new Date().toISOString(),
        },
      ],
      exportUrl: "https://example.com/exports/bulk-operation-results.csv",
    },
    onOpenChange: fn(),
    onRetry: fn(),
    onDownloadReport: fn(),
  },
};

export const OpenByDefault: Story = {
  args: {
    open: true,
    operation: "delete" as BulkOperationType,
    result: {
      ...baseResult,
      success: 75,
      failed: 20,
      skipped: 5,
      errors: [
        {
          userId: "user-1",
          userEmail: "protected@example.com",
          error: "User is protected from deletion",
          code: UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
          timestamp: new Date().toISOString(),
        },
        {
          userId: "user-2",
          userEmail: "active@example.com",
          error: "User has active sessions",
          code: UserManagementErrorCodes.USER_SUSPENDED,
          timestamp: new Date().toISOString(),
        },
      ],
    },
    onOpenChange: fn(),
    onRetry: fn(),
    onDownloadReport: fn(),
  },
};

export const AllOperationTypes: Story = {
  render: function AllOperationTypesRender() {
    const [currentOperation, setCurrentOperation] =
      React.useState<BulkOperationType>("ban");
    const operations: BulkOperationType[] = [
      "ban",
      "unban",
      "activate",
      "deactivate",
      "delete",
      "assign_role",
    ];

    const getResultForOperation = (
      operation: BulkOperationType
    ): BulkOperationResult => {
      const baseConfig = {
        ...baseResult,
        total: 50,
      };

      switch (operation) {
        case "ban":
          return {
            ...baseConfig,
            success: 48,
            failed: 2,
            skipped: 0,
            errors: [],
          };
        case "unban":
          return {
            ...baseConfig,
            success: 45,
            failed: 3,
            skipped: 2,
            errors: [],
          };
        case "activate":
          return {
            ...baseConfig,
            success: 40,
            failed: 5,
            skipped: 5,
            errors: [],
          };
        case "deactivate":
          return {
            ...baseConfig,
            success: 35,
            failed: 10,
            skipped: 5,
            errors: [],
          };
        case "delete":
          return {
            ...baseConfig,
            success: 30,
            failed: 15,
            skipped: 5,
            errors: [],
          };
        case "assign_role":
          return {
            ...baseConfig,
            success: 42,
            failed: 6,
            skipped: 2,
            errors: [],
          };
        default:
          return {
            ...baseConfig,
            success: 50,
            failed: 0,
            skipped: 0,
            errors: [],
          };
      }
    };

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">All Operation Results</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {operations.map((op) => (
              <Button
                key={op}
                variant={currentOperation === op ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentOperation(op)}
              >
                {op.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Button>
            ))}
          </div>
        </div>

        <InteractiveBulkResultDialog
          open={false}
          operation={currentOperation}
          result={getResultForOperation(currentOperation)}
          onOpenChange={fn()}
          onRetry={fn()}
          onDownloadReport={fn()}
        />
      </div>
    );
  },
};
