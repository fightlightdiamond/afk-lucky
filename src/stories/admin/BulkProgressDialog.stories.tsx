import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import React from "react";
import { BulkProgressDialog } from "@/components/admin/BulkProgressDialog";
import {
  BulkOperationProgress,
  BulkOperationResult,
  BulkOperationError,
  BulkOperationType,
  UserManagementErrorCodes,
} from "@/types/user";
import { Button } from "@/components/ui/button";

// Interactive wrapper for Storybook
const InteractiveBulkProgressDialog = (props: React.ComponentProps<typeof BulkProgressDialog>) => {
  const [open, setOpen] = React.useState(props.open || false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Progress Dialog</Button>
      <BulkProgressDialog {...props} open={open} onOpenChange={setOpen} />
    </div>
  );
};

const meta: Meta<typeof BulkProgressDialog> = {
  title: "Admin/BulkProgressDialog",
  component: InteractiveBulkProgressDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A progress dialog for bulk operations showing real-time progress, status updates, and results. Features cancellation support and detailed error reporting.",
      },
    },
  },
  argTypes: {
    open: {
      description: "Whether the dialog is open",
      control: { type: "boolean" },
    },
    progress: {
      description: "Progress information object",
      control: { type: "object" },
    },
    canCancel: {
      description: "Whether the operation can be cancelled",
      control: { type: "boolean" },
    },
    onOpenChange: {
      description: "Callback when dialog open state changes",
      action: "openChange",
    },
    onCancel: {
      description: "Callback when operation is cancelled",
      action: "cancel",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BulkProgressDialog>;

const baseProgress: Omit<
  BulkOperationProgress,
  "status" | "progress" | "processed"
> = {
  operationId: "bulk-op-1",
  operation: "ban" as BulkOperationType,
  total: 100,
  startedAt: new Date(Date.now() - 30000).toISOString(), // 30 seconds ago
};

export const Pending: Story = {
  args: {
    open: false,
    progress: {
      ...baseProgress,
      status: "pending",
      progress: 0,
      processed: 0,
    },
    canCancel: false,
    onOpenChange: fn(),
    onCancel: fn(),
  },
};

export const InProgress: Story = {
  args: {
    open: false,
    progress: {
      ...baseProgress,
      status: "in_progress",
      progress: 45,
      processed: 45,
      estimatedCompletion: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
    },
    canCancel: true,
    onOpenChange: fn(),
    onCancel: fn(),
  },
};

export const NearCompletion: Story = {
  args: {
    open: false,
    progress: {
      ...baseProgress,
      status: "in_progress",
      progress: 85,
      processed: 85,
      estimatedCompletion: new Date(Date.now() + 10000).toISOString(), // 10 seconds from now
    },
    canCancel: true,
    onOpenChange: fn(),
    onCancel: fn(),
  },
};

export const Completed: Story = {
  args: {
    open: false,
    progress: {
      ...baseProgress,
      status: "completed",
      progress: 100,
      processed: 100,
      result: {
        operation: "ban" as BulkOperationType,
        startedAt: new Date(Date.now() - 60000).toISOString(),
        total: 100,
        success: 95,
        failed: 3,
        skipped: 2,
        errors: [
          {
            userId: "user-1",
            userEmail: "john.doe@example.com",
            error: "User is already banned",
            code: UserManagementErrorCodes.USER_ALREADY_INACTIVE,
            timestamp: new Date().toISOString(),
          },
          {
            userId: "user-2",
            userEmail: "jane.smith@example.com",
            error: "Cannot ban admin user",
            code: UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    },
    canCancel: false,
    onOpenChange: fn(),
    onCancel: fn(),
  },
};

export const Failed: Story = {
  args: {
    open: false,
    progress: {
      ...baseProgress,
      status: "failed",
      progress: 25,
      processed: 25,
      result: {
        operation: "ban" as BulkOperationType,
        startedAt: new Date(Date.now() - 120000).toISOString(),
        total: 100,
        success: 20,
        failed: 5,
        skipped: 0,
        errors: [
          {
            userId: "user-1",
            userEmail: "error1@example.com",
            error: "Permission denied",
            code: UserManagementErrorCodes.PERMISSION_DENIED,
            timestamp: new Date().toISOString(),
          },
          {
            userId: "user-2",
            userEmail: "error2@example.com",
            error: "User not found",
            code: UserManagementErrorCodes.USER_NOT_FOUND,
            timestamp: new Date().toISOString(),
          },
          {
            userId: "user-3",
            userEmail: "error3@example.com",
            error: "Database error",
            code: UserManagementErrorCodes.DATABASE_ERROR,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    },
    canCancel: false,
    onOpenChange: fn(),
    onCancel: fn(),
  },
};

export const Cancelled: Story = {
  args: {
    open: false,
    progress: {
      ...baseProgress,
      status: "cancelled",
      progress: 60,
      processed: 60,
      result: {
        operation: "ban" as BulkOperationType,
        startedAt: new Date(Date.now() - 90000).toISOString(),
        total: 100,
        success: 55,
        failed: 2,
        skipped: 43,
        errors: [
          {
            userId: "user-1",
            userEmail: "john.doe@example.com",
            error: "Operation was cancelled",
            code: UserManagementErrorCodes.BULK_OPERATION_CANCELLED,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    },
    canCancel: false,
    onOpenChange: fn(),
    onCancel: fn(),
  },
};

export const LargeDataset: Story = {
  args: {
    open: false,
    progress: {
      ...baseProgress,
      total: 10000,
      status: "in_progress",
      progress: 35,
      processed: 3500,
      estimatedCompletion: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
    },
    canCancel: true,
    onOpenChange: fn(),
    onCancel: fn(),
  },
};

export const SmallDataset: Story = {
  args: {
    open: false,
    progress: {
      ...baseProgress,
      total: 5,
      status: "in_progress",
      progress: 80,
      processed: 4,
      estimatedCompletion: new Date(Date.now() + 2000).toISOString(), // 2 seconds from now
    },
    canCancel: true,
    onOpenChange: fn(),
    onCancel: fn(),
  },
};

export const ManyErrors: Story = {
  args: {
    open: false,
    progress: {
      ...baseProgress,
      status: "completed",
      progress: 100,
      processed: 100,
      result: {
        total: 100,
        success: 70,
        failed: 25,
        skipped: 5,
        errors: Array.from({ length: 10 }, (_, i) => ({
          userId: `user-${i + 1}`,
          userEmail: `user${i + 1}@example.com`,
          error: `Error message ${i + 1}: ${
            i % 3 === 0
              ? "Permission denied"
              : i % 3 === 1
              ? "User not found"
              : "Database error"
          }`,
          code:
            i % 3 === 0
              ? "PERMISSION_DENIED"
              : i % 3 === 1
              ? "USER_NOT_FOUND"
              : "DB_ERROR",
          timestamp: new Date(Date.now() - i * 1000).toISOString(),
        })),
      },
    },
    canCancel: false,
    onOpenChange: fn(),
    onCancel: fn(),
  },
};

export const OpenByDefault: Story = {
  args: {
    open: true,
    progress: {
      ...baseProgress,
      status: "in_progress",
      progress: 65,
      processed: 65,
      estimatedCompletion: new Date(Date.now() + 30000).toISOString(),
    },
    canCancel: true,
    onOpenChange: fn(),
    onCancel: fn(),
  },
};

export const ProgressSimulation: Story = {
  render: function ProgressSimulationRender() {
    const [progress, setProgress] = React.useState<BulkOperationProgress>({
      ...baseProgress,
      status: "pending",
      progress: 0,
      processed: 0,
    });
    const [isRunning, setIsRunning] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    const startSimulation = () => {
      setIsRunning(true);
      setProgress((prev) => ({ ...prev, status: "in_progress" }));

      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProcessed = Math.min(
            prev.processed + Math.random() * 5,
            prev.total
          );
          const newProgress = Math.round((newProcessed / prev.total) * 100);

          if (newProcessed >= prev.total) {
            clearInterval(interval);
            setIsRunning(false);
            return {
              ...prev,
              status: "completed",
              progress: 100,
              processed: prev.total,
              result: {
                operation: prev.operation as BulkOperationType,
                startedAt: prev.startedAt,
                total: prev.total,
                success: Math.floor(prev.total * 0.9),
                failed: Math.floor(prev.total * 0.08),
                skipped: Math.floor(prev.total * 0.02),
                errors: [
                  {
                    userId: "user-1",
                    userEmail: "error@example.com",
                    error: "Sample error message",
                    code: UserManagementErrorCodes.VALIDATION_ERROR,
                    timestamp: new Date().toISOString(),
                  },
                ],
              },
            };
          }

          return {
            ...prev,
            progress: newProgress,
            processed: newProcessed,
            estimatedCompletion: new Date(
              Date.now() + ((prev.total - newProcessed) / 2) * 1000
            ).toISOString(),
          };
        });
      }, 500);
    };

    const resetSimulation = () => {
      setProgress({
        ...baseProgress,
        status: "pending",
        progress: 0,
        processed: 0,
      });
      setIsRunning(false);
    };

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Progress Simulation</h3>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={startSimulation}
              disabled={isRunning || progress.status === "completed"}
            >
              Start Operation
            </Button>
            <Button
              variant="outline"
              onClick={resetSimulation}
              disabled={isRunning}
            >
              Reset
            </Button>
          </div>
        </div>

        <BulkProgressDialog
          open={open}
          progress={progress}
          canCancel={isRunning}
          onOpenChange={setOpen}
          onCancel={() => {
            console.log("Cancel clicked");
            setIsRunning(false);
            setProgress((prev) => ({ ...prev, status: "cancelled" }));
            fn()();
          }}
        />
      </div>
    );
  },
};
