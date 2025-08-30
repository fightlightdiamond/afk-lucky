import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BulkOperations } from "@/components/admin/BulkOperations";
import { User, Role, UserRole, UserStatus, ActivityStatus } from "@/types/user";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

const meta: Meta<typeof BulkOperations> = {
  title: "Admin/BulkOperations",
  component: BulkOperations,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-6 bg-background">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Bulk operations component for performing actions on multiple selected users. Features confirmation dialogs, progress tracking, and comprehensive error handling.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockRoles: Role[] = [
  {
    id: "1",
    name: UserRole.ADMIN,
    description: "Administrator role",
    permissions: ["read", "write", "delete"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: UserRole.USER,
    description: "Regular user role",
    permissions: ["read"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: UserRole.MODERATOR,
    description: "Moderator role",
    permissions: ["read", "write"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const mockUsers: User[] = [
  {
    id: "1",
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
    role: mockRoles[0],
  },
  {
    id: "2",
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
    role: mockRoles[1],
  },
  {
    id: "3",
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
    role: mockRoles[2],
  },
];

export const NoSelection: Story = {
  args: {
    selectedUsers: [],
    onClearSelection: () => console.log("Clear selection"),
    availableRoles: mockRoles,
    disabled: false,
  },
};

export const SingleUserSelected: Story = {
  args: {
    selectedUsers: [mockUsers[0]],
    onClearSelection: () => console.log("Clear selection"),
    availableRoles: mockRoles,
    disabled: false,
  },
};

export const MultipleUsersSelected: Story = {
  args: {
    selectedUsers: mockUsers,
    onClearSelection: () => console.log("Clear selection"),
    availableRoles: mockRoles,
    disabled: false,
  },
};

export const DisabledState: Story = {
  args: {
    selectedUsers: mockUsers.slice(0, 2),
    onClearSelection: () => console.log("Clear selection"),
    availableRoles: mockRoles,
    disabled: true,
  },
};

export const NoRolesAvailable: Story = {
  args: {
    selectedUsers: mockUsers.slice(0, 2),
    onClearSelection: () => console.log("Clear selection"),
    availableRoles: [],
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Bulk operations when no roles are available for assignment.",
      },
    },
  },
};

export const MixedUserStates: Story = {
  args: {
    selectedUsers: [
      { ...mockUsers[0], status: UserStatus.ACTIVE },
      { ...mockUsers[1], status: UserStatus.INACTIVE },
      { ...mockUsers[2], status: UserStatus.ACTIVE },
    ],
    onClearSelection: () => console.log("Clear selection"),
    availableRoles: mockRoles,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Bulk operations with users in different states (active/inactive).",
      },
    },
  },
};

export const LargeSelection: Story = {
  args: {
    selectedUsers: Array.from({ length: 25 }, (_, i) => ({
      ...mockUsers[i % mockUsers.length],
      id: `user-${i + 1}`,
      email: `user${i + 1}@example.com`,
      full_name: `User ${i + 1}`,
      display_name: `User ${i + 1}`,
    })),
    onClearSelection: () => console.log("Clear selection"),
    availableRoles: mockRoles,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Bulk operations with a large number of selected users.",
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: (args) => {
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [disabled, setDisabled] = useState(false);
    const [operationInProgress, setOperationInProgress] = useState(false);

    const handleAddUser = () => {
      const newUser = {
        ...mockUsers[selectedUsers.length % mockUsers.length],
        id: `demo-user-${Date.now()}`,
        email: `demo${selectedUsers.length + 1}@example.com`,
        full_name: `Demo User ${selectedUsers.length + 1}`,
        display_name: `Demo User ${selectedUsers.length + 1}`,
      };
      setSelectedUsers((prev) => [...prev, newUser]);
    };

    const handleClearSelection = () => {
      setSelectedUsers([]);
      args.onClearSelection?.();
    };

    const simulateOperation = async (operation: string) => {
      setOperationInProgress(true);
      setDisabled(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(`${operation} completed for ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setOperationInProgress(false);
      setDisabled(false);
    };

    return (
      <div className="space-y-6">
        <div className="p-4 bg-muted rounded-lg space-y-4">
          <h3 className="font-medium">Interactive Bulk Operations Demo</h3>
          <p className="text-sm text-muted-foreground">
            Add users to selection and try bulk operations. Operations are
            simulated with loading states.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleAddUser}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              disabled={operationInProgress}
            >
              Add User to Selection
            </button>
            <button
              onClick={handleClearSelection}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              disabled={operationInProgress}
            >
              Clear All
            </button>
          </div>

          <div className="text-sm">
            <strong>Selected Users:</strong> {selectedUsers.length}
            {operationInProgress && (
              <span className="ml-2 text-blue-600">
                Operation in progress...
              </span>
            )}
          </div>

          {selectedUsers.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p>
                Selected: {selectedUsers.map((u) => u.full_name).join(", ")}
              </p>
            </div>
          )}
        </div>

        <BulkOperations
          selectedUsers={selectedUsers}
          onClearSelection={handleClearSelection}
          availableRoles={mockRoles}
          disabled={disabled || operationInProgress}
          onBulkBan={() => simulateOperation("Bulk Ban")}
          onBulkUnban={() => simulateOperation("Bulk Unban")}
          onBulkDelete={() => simulateOperation("Bulk Delete")}
          onBulkAssignRole={(roleId) =>
            simulateOperation(`Bulk Role Assignment (${roleId})`)
          }
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fully interactive bulk operations demo with simulated API calls and loading states.",
      },
    },
  },
};
