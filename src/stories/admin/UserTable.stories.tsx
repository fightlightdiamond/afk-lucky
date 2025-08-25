import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { User } from "@/types/user";

// Mock the UserTable component since we don't have it as a separate component yet
// In a real implementation, this would import the actual UserTable component
const UserTable = ({
  users,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onSelectUser,
  onSelectAll,
  selectedUsers = [],
}: {
  users: User[];
  loading?: boolean;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (userId: string, status: boolean) => void;
  onSelectUser: (userId: string) => void;
  onSelectAll: (selected: boolean) => void;
  selectedUsers?: string[];
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">
              <input
                type="checkbox"
                onChange={(e) => onSelectAll(e.target.checked)}
                checked={
                  selectedUsers.length === users.length && users.length > 0
                }
                className="rounded"
              />
            </th>
            <th className="text-left p-4">Name</th>
            <th className="text-left p-4">Email</th>
            <th className="text-left p-4">Role</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Last Login</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => onSelectUser(user.id)}
                    className="rounded"
                  />
                </td>
                <td className="p-4 font-medium">{user.full_name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  {user.role ? (
                    <div className="space-y-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role.name}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {user.role.permissions.slice(0, 2).map((permission) => (
                          <span
                            key={permission}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {permission}
                          </span>
                        ))}
                        {user.role.permissions.length > 2 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            +{user.role.permissions.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      No Role
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4">
                  {user.last_login
                    ? new Date(user.last_login).toLocaleDateString()
                    : "Never"}
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onToggleStatus(user.id, user.is_active)}
                      className="text-yellow-600 hover:text-yellow-900 text-sm"
                    >
                      {user.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const queryClient = new QueryClient();

const meta: Meta<typeof UserTable> = {
  title: "Admin/UserTable",
  component: UserTable,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-6">
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
          "A table component for displaying and managing users in the admin panel.",
      },
    },
  },
  argTypes: {
    users: {
      description: "Array of user objects to display",
    },
    loading: {
      description: "Whether the table is in loading state",
      control: "boolean",
    },
    selectedUsers: {
      description: "Array of selected user IDs",
    },
    onEdit: {
      description: "Callback when edit button is clicked",
      action: "edit",
    },
    onDelete: {
      description: "Callback when delete button is clicked",
      action: "delete",
    },
    onToggleStatus: {
      description: "Callback when status toggle button is clicked",
      action: "toggleStatus",
    },
    onSelectUser: {
      description: "Callback when user checkbox is clicked",
      action: "selectUser",
    },
    onSelectAll: {
      description: "Callback when select all checkbox is clicked",
      action: "selectAll",
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserTable>;

// Sample data
const sampleUsers: User[] = [
  {
    id: "user-1",
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    last_login: "2024-01-15T10:00:00Z",
    last_logout: null,
    avatar: null,
    role: {
      id: "role-admin",
      name: "ADMIN",
      permissions: [
        "user:read",
        "user:write",
        "user:delete",
        "role:manage",
        "system:admin",
      ],
      description: "System Administrator",
    },
    full_name: "John Doe",
    status: "active",
    activity_status: "offline",
  },
  {
    id: "user-2",
    email: "jane.smith@example.com",
    first_name: "Jane",
    last_name: "Smith",
    is_active: true,
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    last_login: "2024-01-14T15:30:00Z",
    last_logout: null,
    avatar: null,
    role: {
      id: "role-editor",
      name: "EDITOR",
      permissions: ["content:read", "content:write"],
      description: "Content Editor",
    },
    full_name: "Jane Smith",
    status: "active",
    activity_status: "offline",
  },
  {
    id: "user-3",
    email: "bob.wilson@example.com",
    first_name: "Bob",
    last_name: "Wilson",
    is_active: false,
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
    last_login: null,
    last_logout: null,
    avatar: null,
    role: null,
    full_name: "Bob Wilson",
    status: "inactive",
    activity_status: "never",
  },
  {
    id: "user-4",
    email: "alice.johnson@example.com",
    first_name: "Alice",
    last_name: "Johnson",
    is_active: true,
    created_at: "2024-01-04T00:00:00Z",
    updated_at: "2024-01-04T00:00:00Z",
    last_login: "2024-01-16T09:15:00Z",
    last_logout: null,
    avatar: null,
    role: {
      id: "role-moderator",
      name: "MODERATOR",
      permissions: ["content:moderate", "user:moderate"],
      description: "Content Moderator",
    },
    full_name: "Alice Johnson",
    status: "active",
    activity_status: "offline",
  },
];

export const Default: Story = {
  args: {
    users: sampleUsers,
    loading: false,
    selectedUsers: [],
    onEdit: action("edit"),
    onDelete: action("delete"),
    onToggleStatus: action("toggleStatus"),
    onSelectUser: action("selectUser"),
    onSelectAll: action("selectAll"),
  },
};

export const Loading: Story = {
  args: {
    users: [],
    loading: true,
    selectedUsers: [],
    onEdit: action("edit"),
    onDelete: action("delete"),
    onToggleStatus: action("toggleStatus"),
    onSelectUser: action("selectUser"),
    onSelectAll: action("selectAll"),
  },
};

export const Empty: Story = {
  args: {
    users: [],
    loading: false,
    selectedUsers: [],
    onEdit: action("edit"),
    onDelete: action("delete"),
    onToggleStatus: action("toggleStatus"),
    onSelectUser: action("selectUser"),
    onSelectAll: action("selectAll"),
  },
};

export const WithSelection: Story = {
  args: {
    users: sampleUsers,
    loading: false,
    selectedUsers: ["user-1", "user-3"],
    onEdit: action("edit"),
    onDelete: action("delete"),
    onToggleStatus: action("toggleStatus"),
    onSelectUser: action("selectUser"),
    onSelectAll: action("selectAll"),
  },
};

export const SingleUser: Story = {
  args: {
    users: [sampleUsers[0]],
    loading: false,
    selectedUsers: [],
    onEdit: action("edit"),
    onDelete: action("delete"),
    onToggleStatus: action("toggleStatus"),
    onSelectUser: action("selectUser"),
    onSelectAll: action("selectAll"),
  },
};

export const UsersWithoutRoles: Story = {
  args: {
    users: [
      {
        ...sampleUsers[0],
        role: null,
      },
      {
        ...sampleUsers[1],
        role: null,
      },
    ],
    loading: false,
    selectedUsers: [],
    onEdit: action("edit"),
    onDelete: action("delete"),
    onToggleStatus: action("toggleStatus"),
    onSelectUser: action("selectUser"),
    onSelectAll: action("selectAll"),
  },
};

export const InactiveUsers: Story = {
  args: {
    users: sampleUsers.map((user) => ({
      ...user,
      is_active: false,
      status: "inactive" as const,
    })),
    loading: false,
    selectedUsers: [],
    onEdit: action("edit"),
    onDelete: action("delete"),
    onToggleStatus: action("toggleStatus"),
    onSelectUser: action("selectUser"),
    onSelectAll: action("selectAll"),
  },
};
