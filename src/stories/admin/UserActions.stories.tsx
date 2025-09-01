import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "storybook/test";
const fn = () => () => {};
import React from "react";
import { UserActions } from "@/components/admin/UserActions";
import { UserManagementProvider } from "@/components/admin/UserManagementProvider";

// Wrapper to provide context
const UserActionsWrapper = (args: React.ComponentProps<typeof UserActions>) => {
  return (
    <UserManagementProvider>
      <div className="p-6 bg-background">
        <UserActions {...args} />
      </div>
    </UserManagementProvider>
  );
};

const meta: Meta<typeof UserActions> = {
  title: "Admin/UserActions",
  component: UserActionsWrapper,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Action bar for user management with create, import, export, and bulk operation buttons. Adapts based on selection state and provides contextual actions.",
      },
    },
  },
  argTypes: {
    totalUsers: {
      description: "Total number of users in the system",
      control: { type: "number", min: 0, max: 10000 },
    },
  },
  args: {
    onExport: fn(),
    onImport: fn(),
    onBulkDelete: fn(),
    onBulkActivate: fn(),
    onBulkDeactivate: fn(),
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UserActions>;

export const Default: Story = {
  args: {
    totalUsers: 150,
  },
};

export const SmallUserBase: Story = {
  args: {
    totalUsers: 5,
  },
};

export const LargeUserBase: Story = {
  args: {
    totalUsers: 5000,
  },
};

export const NoUsers: Story = {
  args: {
    totalUsers: 0,
  },
};

export const WithoutImportExport: Story = {
  args: {
    totalUsers: 150,
    onExport: undefined,
    onImport: undefined,
  },
};

export const WithoutBulkActions: Story = {
  args: {
    totalUsers: 150,
    onBulkDelete: undefined,
    onBulkActivate: undefined,
    onBulkDeactivate: undefined,
  },
};

export const MobileView: Story = {
  args: {
    totalUsers: 150,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const InteractiveDemo: Story = {
  render: function InteractiveDemoRender(args) {
    const [totalUsers, setTotalUsers] = React.useState(150);
    const [hasImportExport, setHasImportExport] = React.useState(true);
    const [hasBulkActions, setHasBulkActions] = React.useState(true);
    // Remove unused state variables to fix lint warnings

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">User Actions Demo</h2>
          <p className="text-muted-foreground mb-6">
            Adjust the settings below to see how the user actions bar adapts
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <label htmlFor="total-users">Total Users:</label>
            <input
              id="total-users"
              type="number"
              min="0"
              max="10000"
              value={totalUsers}
              onChange={(e) => setTotalUsers(Number(e.target.value))}
              className="w-24 px-2 py-1 border rounded"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="import-export"
              type="checkbox"
              checked={hasImportExport}
              onChange={(e) => setHasImportExport(e.target.checked)}
            />
            <label htmlFor="import-export">Import/Export Actions</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="bulk-actions"
              type="checkbox"
              checked={hasBulkActions}
              onChange={(e) => setHasBulkActions(e.target.checked)}
            />
            <label htmlFor="bulk-actions">Bulk Actions</label>
          </div>
        </div>

        <UserManagementProvider>
          <div className="p-6 bg-background border rounded-lg">
            <UserActions
              totalUsers={totalUsers}
              onExport={hasImportExport ? args.onExport : undefined}
              onImport={hasImportExport ? args.onImport : undefined}
              onBulkDelete={hasBulkActions ? args.onBulkDelete : undefined}
              onBulkActivate={hasBulkActions ? args.onBulkActivate : undefined}
              onBulkDeactivate={
                hasBulkActions ? args.onBulkDeactivate : undefined
              }
            />
          </div>
        </UserManagementProvider>

        <div className="text-center text-sm text-muted-foreground">
          Note: The bulk actions will only appear when users are selected in the
          actual component. This demo shows the default state without selection.
        </div>
      </div>
    );
  },
};
