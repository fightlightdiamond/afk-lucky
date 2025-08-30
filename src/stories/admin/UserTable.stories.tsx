import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserTable } from "@/components/admin/UserTable";
import {
  User,
  UserFilters,
  UserRole,
  UserStatus,
  ActivityStatus,
} from "@/types/user";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

const meta: Meta<typeof UserTable> = {
  title: "Admin/UserTable",
  component: UserTable,
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
          "A comprehensive table component for displaying and managing users in the admin panel. Features sorting, selection, responsive design, and accessibility support.",
      },
    },
  },
  argTypes: {
    users: {
      description: "Array of user objects to display in the table",
      control: { type: "object" },
    },
    filters: {
      description: "Current filter and sort configuration",
      control: { type: "object" },
    },
    isLoading: {
      description: "Whether the table is in loading state",
      control: { type: "boolean" },
    },
    selectedUsers: {
      description: "Set of selected user IDs",
      control: { type: "object" },
    },
    isMobile: {
      description: "Whether to render in mobile mode",
      control: { type: "boolean" },
    },
    onFiltersChange: {
      description: "Callback when filters change",
      action: "filtersChange",
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
    onUserSelection: {
      description: "Callback when user selection changes",
      action: "userSelection",
    },
    onSelectAll: {
      description: "Callback when select all is toggled",
      action: "selectAll",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UserTable>;

// Sample data with comprehensive user examples
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
    last_logout: "2024-01-15T18:00:00Z",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    role_id: "role-admin",
    role: {
      id: "role-admin",
      name: UserRole.ADMIN,
      permissions: [
        "user:read",
        "user:write",
        "user:delete",
        "role:manage",
        "system:admin",
      ],
      description: "System Administrator",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    full_name: "John Doe",
    display_name: "John Doe",
    status: UserStatus.ACTIVE,
    activity_status: ActivityStatus.OFFLINE,
    age: 32,
    locale: "en",
    birthday: "1992-03-15",
    address: "123 Main St, New York, NY",
  },
  {
    id: "user-2",
    email: "jane.smith@example.com",
    first_name: "Jane",
    last_name: "Smith",
    is_active: true,
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    last_login: "2024-01-16T15:30:00Z",
    last_logout: null,
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    role_id: "role-editor",
    role: {
      id: "role-editor",
      name: UserRole.EDITOR,
      permissions: ["content:read", "content:write", "user:read"],
      description: "Content Editor",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    full_name: "Jane Smith",
    display_name: "Jane Smith",
    status: UserStatus.ACTIVE,
    activity_status: ActivityStatus.ONLINE,
    age: 28,
    locale: "en",
    birthday: "1996-07-22",
    address: "456 Oak Ave, Los Angeles, CA",
  },
  {
    id: "user-3",
    email: "bob.wilson@example.com",
    first_name: "Bob",
    last_name: "Wilson",
    is_active: false,
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
    last_login: null,
    last_logout: null,
    avatar: null,
    role_id: null,
    role: null,
    full_name: "Bob Wilson",
    display_name: "Bob Wilson",
    status: UserStatus.INACTIVE,
    activity_status: ActivityStatus.NEVER,
    age: 45,
    locale: "en",
    birthday: "1979-11-08",
    address: "789 Pine St, Chicago, IL",
  },
  {
    id: "user-4",
    email: "alice.johnson@example.com",
    first_name: "Alice",
    last_name: "Johnson",
    is_active: true,
    created_at: "2024-01-04T00:00:00Z",
    updated_at: "2024-01-04T00:00:00Z",
    last_login: "2024-01-14T09:15:00Z",
    last_logout: "2024-01-14T17:30:00Z",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    role_id: "role-moderator",
    role: {
      id: "role-moderator",
      name: UserRole.MODERATOR,
      permissions: ["content:moderate", "user:moderate", "user:read"],
      description: "Content Moderator",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    full_name: "Alice Johnson",
    display_name: "Alice Johnson",
    status: UserStatus.ACTIVE,
    activity_status: ActivityStatus.OFFLINE,
    age: 35,
    locale: "en",
    birthday: "1989-05-12",
    address: "321 Elm St, Miami, FL",
  },
  {
    id: "user-5",
    email: "carlos.rodriguez@example.com",
    first_name: "Carlos",
    last_name: "Rodriguez",
    is_active: true,
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z",
    last_login: "2024-01-16T12:00:00Z",
    last_logout: null,
    avatar: null,
    role_id: "role-user",
    role: {
      id: "role-user",
      name: UserRole.USER,
      permissions: ["user:read"],
      description: "Regular User",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    full_name: "Carlos Rodriguez",
    display_name: "Carlos Rodriguez",
    status: UserStatus.ACTIVE,
    activity_status: ActivityStatus.ONLINE,
    age: 29,
    locale: "es",
    birthday: "1995-09-03",
    address: "654 Maple Dr, Austin, TX",
  },
];

// Default filters for stories
const defaultFilters: UserFilters = {
  search: "",
  role: null,
  status: null,
  dateRange: null,
  activityDateRange: null,
  sortBy: "created_at",
  sortOrder: "desc",
  hasAvatar: null,
  locale: null,
  group_id: null,
  activity_status: null,
};

export const Default: Story = {
  args: {
    users: sampleUsers,
    filters: defaultFilters,
    isLoading: false,
    selectedUsers: new Set(),
    onFiltersChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onToggleStatus: fn(),
    onUserSelection: fn(),
    onSelectAll: fn(),
  },
};

export const Loading: Story = {
  args: {
    users: [],
    filters: defaultFilters,
    isLoading: true,
    selectedUsers: new Set(),
    onFiltersChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onToggleStatus: fn(),
    onUserSelection: fn(),
    onSelectAll: fn(),
  },
};

export const Empty: Story = {
  args: {
    users: [],
    filters: defaultFilters,
    isLoading: false,
    selectedUsers: new Set(),
    onFiltersChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onToggleStatus: fn(),
    onUserSelection: fn(),
    onSelectAll: fn(),
  },
};

export const WithSelection: Story = {
  args: {
    users: sampleUsers,
    filters: defaultFilters,
    isLoading: false,
    selectedUsers: new Set(["user-1", "user-3", "user-4"]),
    onFiltersChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onToggleStatus: fn(),
    onUserSelection: fn(),
    onSelectAll: fn(),
  },
};

export const SortedByName: Story = {
  args: {
    users: sampleUsers,
    filters: {
      ...defaultFilters,
      sortBy: "full_name",
      sortOrder: "asc",
    },
    isLoading: false,
    selectedUsers: new Set(),
    onFiltersChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onToggleStatus: fn(),
    onUserSelection: fn(),
    onSelectAll: fn(),
  },
};

export const SortedByLastLogin: Story = {
  args: {
    users: sampleUsers,
    filters: {
      ...defaultFilters,
      sortBy: "last_login",
      sortOrder: "desc",
    },
    isLoading: false,
    selectedUsers: new Set(),
    onFiltersChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onToggleStatus: fn(),
    onUserSelection: fn(),
    onSelectAll: fn(),
  },
};

export const MobileView: Story = {
  args: {
    users: sampleUsers,
    filters: defaultFilters,
    isLoading: false,
    selectedUsers: new Set(["user-2"]),
    isMobile: true,
    onFiltersChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onToggleStatus: fn(),
    onUserSelection: fn(),
    onSelectAll: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const SingleUser: Story = {
  args: {
    users: [sampleUsers[0]],
    filters: defaultFilters,
    isLoading: false,
    selectedUsers: new Set(),
    onFiltersChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onToggleStatus: fn(),
    onUserSelection: fn(),
    onSelectAll: fn(),
  },
};

export const UsersWithoutRoles: Story = {
  args: {
    users: sampleUsers.map((user) => ({
      ...user,
      role: null,
      role_id: null,
    })),
    filters: defaultFilters,
    isLoading: false,
    selectedUsers: new Set(),
    onFiltersChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onToggleStatus: fn(),
    onUserSelection: fn(),
    onSelectAll: fn(),
  },
};

export const InactiveUsers: Story = {
  args: {
    users: sampleUsers.map((user) => ({
      ...user,
      is_active: false,
      status: UserStatus.INACTIVE,
      activity_status: ActivityStatus.OFFLINE,
    })),
    filters: defaultFilters,
    isLoading: false,
    selectedUsers: new Set(),
    onFiltersChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onToggleStatus: fn(),
    onUserSelection: fn(),
    onSelectAll: fn(),
  },
};

export const MixedActivityStatus: Story = {
  args: {
    users: [
      { ...sampleUsers[0], activity_status: ActivityStatus.ONLINE },
      { ...sampleUsers[1], activity_status: ActivityStatus.OFFLINE },
      { ...sampleUsers[2], activity_status: ActivityStatus.NEVER },
      { ...sampleUsers[3], activity_status: ActivityStatus.OFFLINE },
      { ...sampleUsers[4], activity_status: ActivityStatus.ONLINE },
    ],
    filters: defaultFilters,
    isLoading: false,
    selectedUsers: new Set(),
    onFiltersChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onToggleStatus: fn(),
    onUserSelection: fn(),
    onSelectAll: fn(),
  },
};

export const LargeDataset: Story = {
  args: {
    users: Array.from({ length: 50 }, (_, i) => ({
      ...sampleUsers[i % sampleUsers.length],
      id: `user-${i + 1}`,
      email: `user${i + 1}@example.com`,
      first_name: `User${i + 1}`,
      full_name: `User${i + 1} ${
        sampleUsers[i % sampleUsers.length].last_name
      }`,
      display_name: `User${i + 1} ${
        sampleUsers[i % sampleUsers.length].last_name
      }`,
    })),
    filters: defaultFilters,
    isLoading: false,
    selectedUsers: new Set(),
    onFiltersChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onToggleStatus: fn(),
    onUserSelection: fn(),
    onSelectAll: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "User table with a large dataset (50 users) to test performance and scrolling behavior.",
      },
    },
  },
};

export const WithErrorStates: Story = {
  args: {
    users: [
      {
        ...sampleUsers[0],
        avatar: "invalid-url", // This will show broken image state
      },
      {
        ...sampleUsers[1],
        role: null, // User without role
        role_id: null,
      },
      {
        ...sampleUsers[2],
        last_login: null, // User who never logged in
        activity_status: ActivityStatus.NEVER,
      },
    ],
    filters: defaultFilters,
    isLoading: false,
    selectedUsers: new Set(),
    onFiltersChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onToggleStatus: fn(),
    onUserSelection: fn(),
    onSelectAll: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "User table showing various error states and edge cases like broken avatars, missing roles, and users who never logged in.",
      },
    },
  },
};

export const AccessibilityDemo: Story = {
  args: {
    users: sampleUsers.slice(0, 3),
    filters: defaultFilters,
    isLoading: false,
    selectedUsers: new Set(["user-1"]),
    onFiltersChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onToggleStatus: fn(),
    onUserSelection: fn(),
    onSelectAll: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "User table demonstrating accessibility features. Try navigating with keyboard (Tab, Enter, Space) and screen reader compatibility.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Focus the first interactive element for accessibility testing
    const canvas = canvasElement;
    const firstCheckbox = canvas.querySelector(
      'input[type="checkbox"]'
    ) as HTMLElement;
    if (firstCheckbox) {
      firstCheckbox.focus();
    }
  },
};

export const InteractiveDemo: Story = {
  render: (args) => {
    const [users, setUsers] = useState(sampleUsers);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState(defaultFilters);
    const [isLoading, setIsLoading] = useState(false);

    const handleEdit = (user: User) => {
      args.onEdit?.(user);
      // Simulate edit action
      console.log("Editing user:", user.full_name);
    };

    const handleDelete = async (userId: string) => {
      args.onDelete?.(userId);
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSelectedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      setIsLoading(false);
    };

    const handleToggleStatus = async (userId: string, status: boolean) => {
      args.onToggleStatus?.(userId, status);
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                is_active: status,
                status: status ? UserStatus.ACTIVE : UserStatus.INACTIVE,
              }
            : u
        )
      );
      setIsLoading(false);
    };

    const handleUserSelection = (userId: string, selected: boolean) => {
      setSelectedUsers((prev) => {
        const newSet = new Set(prev);
        if (selected) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
      args.onUserSelection?.(userId, selected);
    };

    const handleSelectAll = (selected: boolean) => {
      if (selected) {
        setSelectedUsers(new Set(users.map((u) => u.id)));
      } else {
        setSelectedUsers(new Set());
      }
      args.onSelectAll?.(selected);
    };

    const handleFiltersChange = (newFilters: UserFilters) => {
      setFilters(newFilters);
      args.onFiltersChange?.(newFilters);
    };

    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Interactive User Table Demo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try selecting users, editing, deleting, or toggling status. Changes
            are simulated with loading states.
          </p>
          <div className="flex gap-4 text-sm">
            <span>Total Users: {users.length}</span>
            <span>Selected: {selectedUsers.size}</span>
            <span>Active: {users.filter((u) => u.is_active).length}</span>
          </div>
        </div>

        <UserTable
          users={users}
          filters={filters}
          isLoading={isLoading}
          selectedUsers={selectedUsers}
          onFiltersChange={handleFiltersChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onUserSelection={handleUserSelection}
          onSelectAll={handleSelectAll}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fully interactive user table demo with simulated API calls and state management. Try all the features!",
      },
    },
  },
};
