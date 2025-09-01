import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import React, { useState } from "react";
import { BulkConfirmDialog } from "@/components/admin/BulkConfirmDialog";
import {
  User,
  Role,
  UserRole,
  UserStatus,
  ActivityStatus,
  BulkOperationType,
} from "@/types/user";
import { Button } from "@/components/ui/button";

// Interactive wrapper for Storybook
const InteractiveBulkConfirmDialog = (args: {
  operation: BulkOperationType | null;
  selectedUsers: User[];
  role?: Role;
  onConfirm?: (reason?: string, options?: { force?: boolean }) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (
    reason?: string,
    options?: { force?: boolean }
  ) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    setOpen(false);
    args.onConfirm?.(reason, options);
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setOpen(true)}>Open Bulk Confirm Dialog</Button>
      <BulkConfirmDialog
        open={open}
        onOpenChange={setOpen}
        operation={args.operation}
        selectedUsers={args.selectedUsers}
        role={args.role}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </div>
  );
};

const meta: Meta<typeof BulkConfirmDialog> = {
  title: "Admin/BulkConfirmDialog",
  component: InteractiveBulkConfirmDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A confirmation dialog for bulk operations with operation-specific UI, reason input for destructive actions, and force options for dangerous operations.",
      },
    },
  },
  argTypes: {
    open: {
      description: "Whether the dialog is open",
      control: { type: "boolean" },
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
    selectedUsers: {
      description: "Array of selected users",
      control: { type: "object" },
    },
    role: {
      description: "Role for assignment operations",
      control: { type: "object" },
    },
    loading: {
      description: "Whether the operation is in progress",
      control: { type: "boolean" },
    },
  },
  args: {
    onOpenChange: fn(),
    onConfirm: fn(),
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BulkConfirmDialog>;

// Sample users for testing
const sampleUsers: User[] = [
  {
    id: "user-1",
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    full_name: "John Doe",
    display_name: "John Doe",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    status: UserStatus.ACTIVE,
    activity_status: ActivityStatus.ONLINE,
  },
  {
    id: "user-2",
    email: "jane.smith@example.com",
    first_name: "Jane",
    last_name: "Smith",
    full_name: "Jane Smith",
    display_name: "Jane Smith",
    is_active: true,
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    status: UserStatus.ACTIVE,
    activity_status: ActivityStatus.OFFLINE,
  },
  {
    id: "user-3",
    email: "bob.wilson@example.com",
    first_name: "Bob",
    last_name: "Wilson",
    full_name: "Bob Wilson",
    display_name: "Bob Wilson",
    is_active: false,
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
    status: UserStatus.INACTIVE,
    activity_status: ActivityStatus.NEVER,
  },
];

const sampleRole: Role = {
  id: "role-admin",
  name: UserRole.ADMIN,
  description: "System Administrator",
  permissions: ["user:read", "user:write", "user:delete", "system:admin"],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

export const BanUsers: Story = {
  args: {
    open: false,
    operation: "ban" as BulkOperationType,
    selectedUsers: sampleUsers.slice(0, 2),
    loading: false,
  },
};

export const UnbanUsers: Story = {
  args: {
    open: false,
    operation: "unban" as BulkOperationType,
    selectedUsers: sampleUsers.slice(0, 3),
    loading: false,
  },
};

export const ActivateUsers: Story = {
  args: {
    open: false,
    operation: "activate" as BulkOperationType,
    selectedUsers: [sampleUsers[2]], // Inactive user
    loading: false,
  },
};

export const DeactivateUsers: Story = {
  args: {
    open: false,
    operation: "deactivate" as BulkOperationType,
    selectedUsers: sampleUsers.slice(0, 2),
    loading: false,
  },
};

export const DeleteUsers: Story = {
  args: {
    open: false,
    operation: "delete" as BulkOperationType,
    selectedUsers: sampleUsers,
    loading: false,
  },
};

export const AssignRole: Story = {
  args: {
    open: false,
    operation: "assign_role" as BulkOperationType,
    selectedUsers: sampleUsers.slice(0, 2),
    role: sampleRole,
    loading: false,
  },
};

export const SingleUser: Story = {
  args: {
    open: false,
    operation: "ban" as BulkOperationType,
    selectedUsers: [sampleUsers[0]],
    loading: false,
  },
};

export const ManyUsers: Story = {
  args: {
    open: false,
    operation: "delete" as BulkOperationType,
    selectedUsers: Array.from({ length: 15 }, (_, i) => ({
      ...sampleUsers[i % sampleUsers.length],
      id: `user-${i + 1}`,
      email: `user${i + 1}@example.com`,
      full_name: `User ${i + 1}`,
      display_name: `User ${i + 1}`,
    })),
    loading: false,
  },
};

export const LoadingState: Story = {
  args: {
    open: false,
    operation: "ban" as BulkOperationType,
    selectedUsers: sampleUsers.slice(0, 2),
    loading: true,
  },
};

export const OpenByDefault: Story = {
  args: {
    open: true,
    operation: "delete" as BulkOperationType,
    selectedUsers: sampleUsers.slice(0, 3),
    loading: false,
  },
};

export const AllOperations: Story = {
  render: function AllOperationsRender(args) {
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

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">All Bulk Operations</h3>
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

        <InteractiveBulkConfirmDialog
          {...args}
          operation={currentOperation}
          selectedUsers={sampleUsers.slice(0, 3)}
          role={currentOperation === "assign_role" ? sampleRole : undefined}
        />
      </div>
    );
  },
};
