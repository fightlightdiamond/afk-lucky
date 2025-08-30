import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import React from "react";
import { UserActivityStats } from "@/components/admin/UserActivityStats";
import { User, UserRole, UserStatus, ActivityStatus } from "@/types/user";

const meta: Meta<typeof UserActivityStats> = {
  title: "Admin/UserActivityStats",
  component: UserActivityStats,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Statistics cards showing user activity metrics including online users, recent activity, never logged in users, and average offline time. Provides quick insights into user engagement.",
      },
    },
  },
  argTypes: {
    users: {
      description: "Array of users to calculate statistics from",
      control: { type: "object" },
    },
    className: {
      description: "Additional CSS classes",
      control: { type: "text" },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UserActivityStats>;

// Helper function to create users with different activity patterns
const createUser = (
  id: string,
  name: string,
  email: string,
  activityStatus: ActivityStatus,
  lastLogin?: string,
  createdDaysAgo: number = 30
): User => ({
  id,
  email,
  first_name: name.split(" ")[0],
  last_name: name.split(" ")[1] || "",
  full_name: name,
  display_name: name,
  is_active: activityStatus !== ActivityStatus.NEVER,
  created_at: new Date(
    Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000
  ).toISOString(),
  updated_at: new Date().toISOString(),
  last_login: lastLogin || null,
  last_logout:
    lastLogin && activityStatus === ActivityStatus.OFFLINE
      ? new Date(
          new Date(lastLogin).getTime() + 2 * 60 * 60 * 1000
        ).toISOString()
      : null,
  role_id: "role-user",
  role: {
    id: "role-user",
    name: UserRole.USER,
    permissions: ["user:read"],
    description: "Regular User",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  status:
    activityStatus === ActivityStatus.NEVER
      ? UserStatus.INACTIVE
      : UserStatus.ACTIVE,
  activity_status: activityStatus,
});

// Sample user datasets
const balancedUsers: User[] = [
  // Online users (10%)
  createUser(
    "1",
    "John Doe",
    "john@example.com",
    ActivityStatus.ONLINE,
    new Date().toISOString()
  ),
  createUser(
    "2",
    "Jane Smith",
    "jane@example.com",
    ActivityStatus.ONLINE,
    new Date(Date.now() - 30 * 60 * 1000).toISOString()
  ),

  // Recently active (within 24 hours) - offline now (40%)
  createUser(
    "3",
    "Bob Wilson",
    "bob@example.com",
    ActivityStatus.OFFLINE,
    new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  ),
  createUser(
    "4",
    "Alice Johnson",
    "alice@example.com",
    ActivityStatus.OFFLINE,
    new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  ),
  createUser(
    "5",
    "Charlie Brown",
    "charlie@example.com",
    ActivityStatus.OFFLINE,
    new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  ),
  createUser(
    "6",
    "Diana Prince",
    "diana@example.com",
    ActivityStatus.OFFLINE,
    new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
  ),

  // Older offline users (30%)
  createUser(
    "7",
    "Eve Adams",
    "eve@example.com",
    ActivityStatus.OFFLINE,
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  ),
  createUser(
    "8",
    "Frank Miller",
    "frank@example.com",
    ActivityStatus.OFFLINE,
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  ),
  createUser(
    "9",
    "Grace Lee",
    "grace@example.com",
    ActivityStatus.OFFLINE,
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  ),

  // Never logged in (20%)
  createUser(
    "10",
    "Henry Ford",
    "henry@example.com",
    ActivityStatus.NEVER,
    undefined,
    5
  ),
  createUser(
    "11",
    "Ivy Chen",
    "ivy@example.com",
    ActivityStatus.NEVER,
    undefined,
    10
  ),
];

const mostlyOnlineUsers: User[] = [
  ...Array.from({ length: 8 }, (_, i) =>
    createUser(
      `online-${i}`,
      `Online User ${i + 1}`,
      `online${i + 1}@example.com`,
      ActivityStatus.ONLINE,
      new Date(Date.now() - i * 10 * 60 * 1000).toISOString()
    )
  ),
  ...Array.from({ length: 2 }, (_, i) =>
    createUser(
      `offline-${i}`,
      `Offline User ${i + 1}`,
      `offline${i + 1}@example.com`,
      ActivityStatus.OFFLINE,
      new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString()
    )
  ),
];

const mostlyInactiveUsers: User[] = [
  createUser(
    "1",
    "Active User",
    "active@example.com",
    ActivityStatus.ONLINE,
    new Date().toISOString()
  ),
  ...Array.from({ length: 4 }, (_, i) =>
    createUser(
      `old-${i}`,
      `Old User ${i + 1}`,
      `old${i + 1}@example.com`,
      ActivityStatus.OFFLINE,
      new Date(Date.now() - (i + 30) * 24 * 60 * 60 * 1000).toISOString()
    )
  ),
  ...Array.from({ length: 5 }, (_, i) =>
    createUser(
      `never-${i}`,
      `Never User ${i + 1}`,
      `never${i + 1}@example.com`,
      ActivityStatus.NEVER,
      undefined,
      i + 1
    )
  ),
];

const newUsersDataset: User[] = [
  ...Array.from({ length: 6 }, (_, i) =>
    createUser(
      `new-${i}`,
      `New User ${i + 1}`,
      `new${i + 1}@example.com`,
      ActivityStatus.NEVER,
      undefined,
      i + 1
    )
  ),
  ...Array.from({ length: 2 }, (_, i) =>
    createUser(
      `active-new-${i}`,
      `Active New ${i + 1}`,
      `activenew${i + 1}@example.com`,
      ActivityStatus.ONLINE,
      new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      i + 1
    )
  ),
];

const largeDataset: User[] = [
  ...Array.from({ length: 50 }, (_, i) => {
    const activityTypes = [
      ActivityStatus.ONLINE,
      ActivityStatus.OFFLINE,
      ActivityStatus.NEVER,
    ];
    const activity = activityTypes[i % 3];
    const lastLogin =
      activity === ActivityStatus.NEVER
        ? undefined
        : new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ).toISOString();

    return createUser(
      `user-${i}`,
      `User ${i + 1}`,
      `user${i + 1}@example.com`,
      activity,
      lastLogin,
      Math.floor(Math.random() * 365) + 1
    );
  }),
];

export const Balanced: Story = {
  args: {
    users: balancedUsers,
  },
};

export const MostlyOnline: Story = {
  args: {
    users: mostlyOnlineUsers,
  },
};

export const MostlyInactive: Story = {
  args: {
    users: mostlyInactiveUsers,
  },
};

export const NewUserBase: Story = {
  args: {
    users: newUsersDataset,
  },
};

export const LargeUserBase: Story = {
  args: {
    users: largeDataset,
  },
};

export const NoUsers: Story = {
  args: {
    users: [],
  },
};

export const SingleUser: Story = {
  args: {
    users: [
      createUser(
        "1",
        "Solo User",
        "solo@example.com",
        ActivityStatus.ONLINE,
        new Date().toISOString()
      ),
    ],
  },
};

export const AllOnline: Story = {
  args: {
    users: Array.from({ length: 10 }, (_, i) =>
      createUser(
        `online-${i}`,
        `Online ${i + 1}`,
        `online${i + 1}@example.com`,
        ActivityStatus.ONLINE,
        new Date(Date.now() - i * 5 * 60 * 1000).toISOString()
      )
    ),
  },
};

export const AllNeverLoggedIn: Story = {
  args: {
    users: Array.from({ length: 8 }, (_, i) =>
      createUser(
        `never-${i}`,
        `Never ${i + 1}`,
        `never${i + 1}@example.com`,
        ActivityStatus.NEVER,
        undefined,
        i + 1
      )
    ),
  },
};

export const RecentActivity: Story = {
  args: {
    users: [
      // All users active within last 24 hours
      createUser(
        "1",
        "Recent 1",
        "recent1@example.com",
        ActivityStatus.ONLINE,
        new Date().toISOString()
      ),
      createUser(
        "2",
        "Recent 2",
        "recent2@example.com",
        ActivityStatus.OFFLINE,
        new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      ),
      createUser(
        "3",
        "Recent 3",
        "recent3@example.com",
        ActivityStatus.OFFLINE,
        new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      ),
      createUser(
        "4",
        "Recent 4",
        "recent4@example.com",
        ActivityStatus.OFFLINE,
        new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
      ),
      createUser(
        "5",
        "Old User",
        "old@example.com",
        ActivityStatus.OFFLINE,
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      ),
    ],
  },
};

export const WithCustomClassName: Story = {
  args: {
    users: balancedUsers,
    className: "bg-muted/50 p-4 rounded-lg",
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [userCount, setUserCount] = React.useState(20);
    const [onlinePercentage, setOnlinePercentage] = React.useState(10);
    const [neverLoggedInPercentage, setNeverLoggedInPercentage] =
      React.useState(20);

    const generateUsers = React.useMemo(() => {
      const users: User[] = [];
      const onlineCount = Math.floor((userCount * onlinePercentage) / 100);
      const neverCount = Math.floor(
        (userCount * neverLoggedInPercentage) / 100
      );
      const offlineCount = userCount - onlineCount - neverCount;

      // Online users
      for (let i = 0; i < onlineCount; i++) {
        users.push(
          createUser(
            `online-${i}`,
            `Online ${i + 1}`,
            `online${i + 1}@example.com`,
            ActivityStatus.ONLINE,
            new Date(Date.now() - i * 10 * 60 * 1000).toISOString()
          )
        );
      }

      // Offline users
      for (let i = 0; i < offlineCount; i++) {
        users.push(
          createUser(
            `offline-${i}`,
            `Offline ${i + 1}`,
            `offline${i + 1}@example.com`,
            ActivityStatus.OFFLINE,
            new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            ).toISOString()
          )
        );
      }

      // Never logged in users
      for (let i = 0; i < neverCount; i++) {
        users.push(
          createUser(
            `never-${i}`,
            `Never ${i + 1}`,
            `never${i + 1}@example.com`,
            ActivityStatus.NEVER,
            undefined,
            Math.floor(Math.random() * 30) + 1
          )
        );
      }

      return users;
    }, [userCount, onlinePercentage, neverLoggedInPercentage]);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">
            Interactive Activity Stats
          </h3>
          <p className="text-muted-foreground mb-6">
            Adjust the parameters below to see how the statistics change
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div className="space-y-2">
            <label htmlFor="user-count" className="text-sm font-medium">
              Total Users: {userCount}
            </label>
            <input
              id="user-count"
              type="range"
              min="1"
              max="100"
              value={userCount}
              onChange={(e) => setUserCount(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="online-percentage" className="text-sm font-medium">
              Online %: {onlinePercentage}%
            </label>
            <input
              id="online-percentage"
              type="range"
              min="0"
              max="50"
              value={onlinePercentage}
              onChange={(e) => setOnlinePercentage(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="never-percentage" className="text-sm font-medium">
              Never Logged In %: {neverLoggedInPercentage}%
            </label>
            <input
              id="never-percentage"
              type="range"
              min="0"
              max="80"
              value={neverLoggedInPercentage}
              onChange={(e) =>
                setNeverLoggedInPercentage(Number(e.target.value))
              }
              className="w-full"
            />
          </div>
        </div>

        <UserActivityStats users={generateUsers} />
      </div>
    );
  },
};
