import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import React from "react";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { Role, UserRole, BulkOperationType } from "@/types/user";

const meta: Meta<typeof BulkActionBar> = {
  title: "Admin/BulkActionBar",
  component: BulkActionBar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A floating action bar that appears when users are selected, providing bulk operations like ban, unban, delete, and role assignment. Features responsive design and accessibility support.",
      },
    },
  },
  argTypes: {
    selectedCount: {
      description: "Number of selected users",
      control: { type: "number", min: 0, max: 100 },
    },
    availableRoles: {
      description: "Available roles for bulk assignment",
      control: { type: "object" },
    },
    disabled: {
      description: "Whether the action bar is disabled",
      control: { type: "boolean" },
    },
  },
  args: {
    onClearSelection: fn(),
    onBulkOperation: fn(),
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BulkActionBar>;

const sampleRoles: Role[] = [
  {
    id: "role-admin",
    name: UserRole.ADMIN,
    description: "System Administrator",
    permissions: ["user:read", "user:write", "user:delete", "system:admin"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-editor",
    name: UserRole.EDITOR,
    description: "Content Editor",
    permissions: ["content:read", "content:write", "user:read"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-moderator",
    name: UserRole.MODERATOR,
    description: "Content Moderator",
    permissions: ["content:moderate", "user:moderate", "user:read"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-user",
    name: UserRole.USER,
    description: "Regular User",
    permissions: ["user:read"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export const Hidden: Story = {
  args: {
    selectedCount: 0,
    availableRoles: sampleRoles,
    disabled: false,
  },
};

export const SingleUser: Story = {
  args: {
    selectedCount: 1,
    availableRoles: sampleRoles,
    disabled: false,
  },
};

export const MultipleUsers: Story = {
  args: {
    selectedCount: 5,
    availableRoles: sampleRoles,
    disabled: false,
  },
};

export const ManyUsers: Story = {
  args: {
    selectedCount: 25,
    availableRoles: sampleRoles,
    disabled: false,
  },
};

export const NoRoles: Story = {
  args: {
    selectedCount: 3,
    availableRoles: [],
    disabled: false,
  },
};

export const LimitedRoles: Story = {
  args: {
    selectedCount: 8,
    availableRoles: sampleRoles.slice(2), // Only moderator and user roles
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    selectedCount: 4,
    availableRoles: sampleRoles,
    disabled: true,
  },
};

export const MobileView: Story = {
  args: {
    selectedCount: 3,
    availableRoles: sampleRoles,
    disabled: false,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const LargeSelection: Story = {
  args: {
    selectedCount: 150,
    availableRoles: sampleRoles,
    disabled: false,
  },
};

export const InteractiveDemo: Story = {
  render: (args) => {
    const [selectedCount, setSelectedCount] = React.useState(3);
    const [disabled, setDisabled] = React.useState(false);

    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Bulk Action Bar Demo</h2>
            <p className="text-muted-foreground mb-6">
              Interact with the controls below to see how the bulk action bar
              behaves
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <label htmlFor="count">Selected Count:</label>
              <input
                id="count"
                type="number"
                min="0"
                max="100"
                value={selectedCount}
                onChange={(e) => setSelectedCount(Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="disabled"
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
              />
              <label htmlFor="disabled">Disabled</label>
            </div>
          </div>

          <div className="text-center text-muted-foreground">
            {selectedCount === 0
              ? "Select some users to see the bulk action bar"
              : `Bulk action bar is visible with ${selectedCount} selected user${
                  selectedCount === 1 ? "" : "s"
                }`}
          </div>

          <BulkActionBar
            selectedCount={selectedCount}
            availableRoles={sampleRoles}
            disabled={disabled}
            onClearSelection={() => setSelectedCount(0)}
            onBulkOperation={(
              operation: BulkOperationType,
              roleId?: string
            ) => {
              args.onBulkOperation?.(operation, roleId);
              // Simulate clearing selection after operation
              setTimeout(() => setSelectedCount(0), 1000);
            }}
          />
        </div>
      </div>
    );
  },
};
