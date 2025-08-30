import type { Meta, StoryObj } from "@storybook/react";
import { UserStatusBadge } from "@/components/admin/UserStatusBadge";
import { User, UserRole, UserStatus, ActivityStatus } from "@/types/user";

// Sample users with different statuses
const createUser = (overrides: Partial<User> = {}): User => ({
  id: "user-1",
  email: "user@example.com",
  first_name: "John",
  last_name: "Doe",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  last_login: "2024-01-15T10:00:00Z",
  role_id: "role-user",
  role: {
    id: "role-user",
    name: UserRole.USER,
    permissions: ["user:read"],
    description: "Regular User",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  full_name: "John Doe",
  display_name: "John Doe",
  status: UserStatus.ACTIVE,
  activity_status: ActivityStatus.OFFLINE,
  ...overrides,
});

const meta: Meta<typeof UserStatusBadge> = {
  title: "Admin/UserStatusBadge",
  component: UserStatusBadge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A badge component for displaying user status with appropriate colors and icons. Shows both account status (active/inactive) and activity status (online/offline/never).",
      },
    },
  },
  argTypes: {
    user: {
      description: "User object containing status information",
      control: { type: "object" },
    },
    size: {
      description: "Badge size",
      control: { type: "select" },
      options: ["sm", "default", "lg"],
    },
    showActivity: {
      description: "Whether to show activity status",
      control: { type: "boolean" },
    },
    className: {
      description: "Additional CSS classes",
      control: { type: "text" },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UserStatusBadge>;

export const ActiveUser: Story = {
  args: {
    user: createUser({
      is_active: true,
      status: UserStatus.ACTIVE,
      activity_status: ActivityStatus.OFFLINE,
    }),
    size: "default",
    showActivity: true,
  },
};

export const InactiveUser: Story = {
  args: {
    user: createUser({
      is_active: false,
      status: UserStatus.INACTIVE,
      activity_status: ActivityStatus.OFFLINE,
    }),
    size: "default",
    showActivity: true,
  },
};

export const BannedUser: Story = {
  args: {
    user: createUser({
      is_active: false,
      status: UserStatus.BANNED,
      activity_status: ActivityStatus.OFFLINE,
    }),
    size: "default",
    showActivity: true,
  },
};

export const PendingUser: Story = {
  args: {
    user: createUser({
      is_active: false,
      status: UserStatus.PENDING,
      activity_status: ActivityStatus.NEVER,
    }),
    size: "default",
    showActivity: true,
  },
};

export const SuspendedUser: Story = {
  args: {
    user: createUser({
      is_active: false,
      status: UserStatus.SUSPENDED,
      activity_status: ActivityStatus.OFFLINE,
    }),
    size: "default",
    showActivity: true,
  },
};

export const OnlineUser: Story = {
  args: {
    user: createUser({
      is_active: true,
      status: UserStatus.ACTIVE,
      activity_status: ActivityStatus.ONLINE,
      last_login: new Date().toISOString(),
    }),
    size: "default",
    showActivity: true,
  },
};

export const OfflineUser: Story = {
  args: {
    user: createUser({
      is_active: true,
      status: UserStatus.ACTIVE,
      activity_status: ActivityStatus.OFFLINE,
      last_login: "2024-01-15T10:00:00Z",
    }),
    size: "default",
    showActivity: true,
  },
};

export const NeverLoggedIn: Story = {
  args: {
    user: createUser({
      is_active: true,
      status: UserStatus.ACTIVE,
      activity_status: ActivityStatus.NEVER,
      last_login: null,
    }),
    size: "default",
    showActivity: true,
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Account Status</h3>
        <div className="flex flex-wrap gap-2">
          <UserStatusBadge
            user={createUser({ status: UserStatus.ACTIVE, is_active: true })}
            showActivity={false}
          />
          <UserStatusBadge
            user={createUser({ status: UserStatus.INACTIVE, is_active: false })}
            showActivity={false}
          />
          <UserStatusBadge
            user={createUser({ status: UserStatus.BANNED, is_active: false })}
            showActivity={false}
          />
          <UserStatusBadge
            user={createUser({ status: UserStatus.PENDING, is_active: false })}
            showActivity={false}
          />
          <UserStatusBadge
            user={createUser({
              status: UserStatus.SUSPENDED,
              is_active: false,
            })}
            showActivity={false}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Activity Status</h3>
        <div className="flex flex-wrap gap-2">
          <UserStatusBadge
            user={createUser({
              activity_status: ActivityStatus.ONLINE,
              last_login: new Date().toISOString(),
            })}
            showActivity={true}
          />
          <UserStatusBadge
            user={createUser({
              activity_status: ActivityStatus.OFFLINE,
              last_login: "2024-01-15T10:00:00Z",
            })}
            showActivity={true}
          />
          <UserStatusBadge
            user={createUser({
              activity_status: ActivityStatus.NEVER,
              last_login: null,
            })}
            showActivity={true}
          />
        </div>
      </div>
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Small:</span>
        <UserStatusBadge
          user={createUser({
            status: UserStatus.ACTIVE,
            activity_status: ActivityStatus.ONLINE,
          })}
          size="sm"
          showActivity={true}
        />
        <UserStatusBadge
          user={createUser({
            status: UserStatus.INACTIVE,
            activity_status: ActivityStatus.OFFLINE,
          })}
          size="sm"
          showActivity={true}
        />
        <UserStatusBadge
          user={createUser({
            status: UserStatus.BANNED,
            activity_status: ActivityStatus.NEVER,
          })}
          size="sm"
          showActivity={true}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Default:</span>
        <UserStatusBadge
          user={createUser({
            status: UserStatus.ACTIVE,
            activity_status: ActivityStatus.ONLINE,
          })}
          size="default"
          showActivity={true}
        />
        <UserStatusBadge
          user={createUser({
            status: UserStatus.INACTIVE,
            activity_status: ActivityStatus.OFFLINE,
          })}
          size="default"
          showActivity={true}
        />
        <UserStatusBadge
          user={createUser({
            status: UserStatus.BANNED,
            activity_status: ActivityStatus.NEVER,
          })}
          size="default"
          showActivity={true}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Large:</span>
        <UserStatusBadge
          user={createUser({
            status: UserStatus.ACTIVE,
            activity_status: ActivityStatus.ONLINE,
          })}
          size="lg"
          showActivity={true}
        />
        <UserStatusBadge
          user={createUser({
            status: UserStatus.INACTIVE,
            activity_status: ActivityStatus.OFFLINE,
          })}
          size="lg"
          showActivity={true}
        />
        <UserStatusBadge
          user={createUser({
            status: UserStatus.BANNED,
            activity_status: ActivityStatus.NEVER,
          })}
          size="lg"
          showActivity={true}
        />
      </div>
    </div>
  ),
};

export const WithoutActivityStatus: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <UserStatusBadge
        user={createUser({ status: UserStatus.ACTIVE })}
        showActivity={false}
      />
      <UserStatusBadge
        user={createUser({ status: UserStatus.INACTIVE })}
        showActivity={false}
      />
      <UserStatusBadge
        user={createUser({ status: UserStatus.BANNED })}
        showActivity={false}
      />
      <UserStatusBadge
        user={createUser({ status: UserStatus.PENDING })}
        showActivity={false}
      />
      <UserStatusBadge
        user={createUser({ status: UserStatus.SUSPENDED })}
        showActivity={false}
      />
    </div>
  ),
};

export const RecentlyActive: Story = {
  args: {
    user: createUser({
      is_active: true,
      status: UserStatus.ACTIVE,
      activity_status: ActivityStatus.OFFLINE,
      last_login: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    }),
    size: "default",
    showActivity: true,
  },
};

export const LongTimeAgo: Story = {
  args: {
    user: createUser({
      is_active: true,
      status: UserStatus.ACTIVE,
      activity_status: ActivityStatus.OFFLINE,
      last_login: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    }),
    size: "default",
    showActivity: true,
  },
};

export const UserGrid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 p-4">
      {[
        {
          status: UserStatus.ACTIVE,
          activity: ActivityStatus.ONLINE,
          name: "Active & Online",
        },
        {
          status: UserStatus.ACTIVE,
          activity: ActivityStatus.OFFLINE,
          name: "Active & Offline",
        },
        {
          status: UserStatus.ACTIVE,
          activity: ActivityStatus.NEVER,
          name: "Active & Never",
        },
        {
          status: UserStatus.INACTIVE,
          activity: ActivityStatus.OFFLINE,
          name: "Inactive & Offline",
        },
        {
          status: UserStatus.BANNED,
          activity: ActivityStatus.OFFLINE,
          name: "Banned & Offline",
        },
        {
          status: UserStatus.PENDING,
          activity: ActivityStatus.NEVER,
          name: "Pending & Never",
        },
        {
          status: UserStatus.SUSPENDED,
          activity: ActivityStatus.OFFLINE,
          name: "Suspended & Offline",
        },
      ].map((item, index) => (
        <div key={index} className="text-center space-y-2">
          <UserStatusBadge
            user={createUser({
              status: item.status,
              activity_status: item.activity,
              is_active: item.status === UserStatus.ACTIVE,
            })}
            showActivity={true}
          />
          <p className="text-xs text-muted-foreground">{item.name}</p>
        </div>
      ))}
    </div>
  ),
};
