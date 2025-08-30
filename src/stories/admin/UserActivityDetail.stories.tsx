import type { Meta, StoryObj } from "@storybook/react";
import { UserActivityDetail } from "@/components/admin/UserActivityDetail";
import { User, UserRole, UserStatus, ActivityStatus } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const meta: Meta<typeof UserActivityDetail> = {
  title: "Admin/UserActivityDetail",
  component: UserActivityDetail,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A detailed activity view for users showing login history, session information, device details, and activity statistics. Features responsive design and comprehensive activity tracking.",
      },
    },
  },
  argTypes: {
    user: {
      description: "User object with activity information",
      control: { type: "object" },
    },
    trigger: {
      description: "Custom trigger element for the dialog",
      control: { type: "object" },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UserActivityDetail>;

// Sample users with different activity patterns
const activeUser: User = {
  id: "user-1",
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  full_name: "John Doe",
  display_name: "John Doe",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
  last_login: "2024-01-16T14:30:00Z",
  last_logout: null, // Currently online
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  role_id: "role-admin",
  role: {
    id: "role-admin",
    name: UserRole.ADMIN,
    permissions: ["user:read", "user:write", "user:delete", "system:admin"],
    description: "System Administrator",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  status: UserStatus.ACTIVE,
  activity_status: ActivityStatus.ONLINE,
  age: 32,
  locale: "en",
  birthday: "1992-03-15",
  address: "123 Main St, New York, NY",
};

const recentUser: User = {
  id: "user-2",
  email: "jane.smith@example.com",
  first_name: "Jane",
  last_name: "Smith",
  full_name: "Jane Smith",
  display_name: "Jane Smith",
  is_active: true,
  created_at: "2024-01-02T00:00:00Z",
  updated_at: "2024-01-15T16:00:00Z",
  last_login: "2024-01-15T16:00:00Z",
  last_logout: "2024-01-15T18:30:00Z",
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
  status: UserStatus.ACTIVE,
  activity_status: ActivityStatus.OFFLINE,
  age: 28,
  locale: "en",
  birthday: "1996-07-22",
  address: "456 Oak Ave, Los Angeles, CA",
};

const inactiveUser: User = {
  id: "user-3",
  email: "bob.wilson@example.com",
  first_name: "Bob",
  last_name: "Wilson",
  full_name: "Bob Wilson",
  display_name: "Bob Wilson",
  is_active: false,
  created_at: "2024-01-03T00:00:00Z",
  updated_at: "2024-01-10T00:00:00Z",
  last_login: "2024-01-05T09:00:00Z",
  last_logout: "2024-01-05T17:00:00Z",
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
  status: UserStatus.INACTIVE,
  activity_status: ActivityStatus.OFFLINE,
  age: 45,
  locale: "en",
  birthday: "1979-11-08",
  address: "789 Pine St, Chicago, IL",
};

const neverLoggedInUser: User = {
  id: "user-4",
  email: "alice.johnson@example.com",
  first_name: "Alice",
  last_name: "Johnson",
  full_name: "Alice Johnson",
  display_name: "Alice Johnson",
  is_active: true,
  created_at: "2024-01-10T00:00:00Z",
  updated_at: "2024-01-10T00:00:00Z",
  last_login: null,
  last_logout: null,
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
  status: UserStatus.ACTIVE,
  activity_status: ActivityStatus.NEVER,
  age: 35,
  locale: "en",
  birthday: "1989-05-12",
  address: "321 Elm St, Miami, FL",
};

const longTimeUser: User = {
  id: "user-5",
  email: "carlos.rodriguez@example.com",
  first_name: "Carlos",
  last_name: "Rodriguez",
  full_name: "Carlos Rodriguez",
  display_name: "Carlos Rodriguez",
  is_active: true,
  created_at: "2023-06-01T00:00:00Z", // Long-time user
  updated_at: "2024-01-16T12:00:00Z",
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
  status: UserStatus.ACTIVE,
  activity_status: ActivityStatus.ONLINE,
  age: 29,
  locale: "es",
  birthday: "1995-09-03",
  address: "654 Maple Dr, Austin, TX",
};

export const OnlineUser: Story = {
  args: {
    user: activeUser,
  },
};

export const OfflineUser: Story = {
  args: {
    user: recentUser,
  },
};

export const InactiveUser: Story = {
  args: {
    user: inactiveUser,
  },
};

export const NeverLoggedIn: Story = {
  args: {
    user: neverLoggedInUser,
  },
};

export const LongTimeUser: Story = {
  args: {
    user: longTimeUser,
  },
};

export const WithCustomTrigger: Story = {
  args: {
    user: activeUser,
    trigger: (
      <Button variant="outline" size="sm" className="gap-2">
        <Eye className="w-4 h-4" />
        View Activity Details
      </Button>
    ),
  },
};

export const UserWithoutAvatar: Story = {
  args: {
    user: {
      ...activeUser,
      avatar: null,
    },
  },
};

export const UserWithoutRole: Story = {
  args: {
    user: {
      ...activeUser,
      role: null,
      role_id: null,
    },
  },
};

export const RecentlyCreatedUser: Story = {
  args: {
    user: {
      ...neverLoggedInUser,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
  },
};

export const UserWithLongSession: Story = {
  args: {
    user: {
      ...activeUser,
      last_login: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      last_logout: null, // Still online
    },
  },
};

export const UserWithShortSession: Story = {
  args: {
    user: {
      ...recentUser,
      last_login: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      last_logout: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    },
  },
};

export const AllActivityStates: Story = {
  render: () => {
    const users = [
      { ...activeUser, full_name: "Online User" },
      { ...recentUser, full_name: "Offline User" },
      { ...neverLoggedInUser, full_name: "Never Logged In" },
      { ...inactiveUser, full_name: "Inactive User" },
    ];

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">All Activity States</h3>
          <p className="text-muted-foreground mb-6">
            Click on any user to view their activity details
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <div key={user.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      user.activity_status === "online"
                        ? "bg-green-500 animate-pulse"
                        : user.activity_status === "offline"
                        ? "bg-gray-400"
                        : "bg-red-400"
                    }`}
                  />
                  <span className="text-sm capitalize">
                    {user.activity_status}
                  </span>
                </div>
              </div>
              <UserActivityDetail user={user} />
            </div>
          ))}
        </div>
      </div>
    );
  },
};
