import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { UserStatusManager } from "@/components/admin/UserStatusManager";
import { UserStatusBadge } from "@/components/admin/UserStatusBadge";
import { User, UserStatus } from "@/types/user";

const createMockUser = (
  status: UserStatus,
  isActive: boolean = true
): User => ({
  id: "1",
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  full_name: "John Doe",
  display_name: "John Doe",
  is_active: isActive,
  status,
  activity_status: "online" as const,
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
  last_login: "2023-01-01T12:00:00Z",
});

const meta: Meta<typeof UserStatusManager> = {
  title: "Admin/UserStatusManager",
  component: UserStatusManager,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    showLabel: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
  args: {
    onStatusChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveUser: Story = {
  args: {
    user: createMockUser(UserStatus.ACTIVE),
    size: "md",
    showLabel: true,
    disabled: false,
  },
};

export const InactiveUser: Story = {
  args: {
    user: createMockUser(UserStatus.INACTIVE, false),
    size: "md",
    showLabel: true,
    disabled: false,
  },
};

export const BannedUser: Story = {
  args: {
    user: createMockUser(UserStatus.BANNED, false),
    size: "md",
    showLabel: true,
    disabled: false,
  },
};

export const SuspendedUser: Story = {
  args: {
    user: createMockUser(UserStatus.SUSPENDED, false),
    size: "md",
    showLabel: true,
    disabled: false,
  },
};

export const PendingUser: Story = {
  args: {
    user: createMockUser(UserStatus.PENDING, false),
    size: "md",
    showLabel: true,
    disabled: false,
  },
};

export const SmallSize: Story = {
  args: {
    user: createMockUser(UserStatus.ACTIVE),
    size: "sm",
    showLabel: true,
    disabled: false,
  },
};

export const LargeSize: Story = {
  args: {
    user: createMockUser(UserStatus.ACTIVE),
    size: "lg",
    showLabel: true,
    disabled: false,
  },
};

export const WithoutLabel: Story = {
  args: {
    user: createMockUser(UserStatus.ACTIVE),
    size: "md",
    showLabel: false,
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    user: createMockUser(UserStatus.ACTIVE),
    size: "md",
    showLabel: true,
    disabled: true,
  },
};

// Status Badge Stories
const badgeMeta: Meta<typeof UserStatusBadge> = {
  title: "Admin/UserStatusBadge",
  component: UserStatusBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    showIcon: {
      control: { type: "boolean" },
    },
    showLabel: {
      control: { type: "boolean" },
    },
    showTooltip: {
      control: { type: "boolean" },
    },
  },
};

export const StatusBadges = {
  ...badgeMeta,
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">All Status Types</h3>
        <div className="flex flex-wrap gap-2">
          <UserStatusBadge user={createMockUser(UserStatus.ACTIVE)} />
          <UserStatusBadge user={createMockUser(UserStatus.INACTIVE, false)} />
          <UserStatusBadge user={createMockUser(UserStatus.BANNED, false)} />
          <UserStatusBadge user={createMockUser(UserStatus.SUSPENDED, false)} />
          <UserStatusBadge user={createMockUser(UserStatus.PENDING, false)} />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Different Sizes</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <UserStatusBadge user={createMockUser(UserStatus.ACTIVE)} size="sm" />
          <UserStatusBadge user={createMockUser(UserStatus.ACTIVE)} size="md" />
          <UserStatusBadge user={createMockUser(UserStatus.ACTIVE)} size="lg" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Without Labels</h3>
        <div className="flex flex-wrap gap-2">
          <UserStatusBadge
            user={createMockUser(UserStatus.ACTIVE)}
            showLabel={false}
          />
          <UserStatusBadge
            user={createMockUser(UserStatus.INACTIVE, false)}
            showLabel={false}
          />
          <UserStatusBadge
            user={createMockUser(UserStatus.BANNED, false)}
            showLabel={false}
          />
          <UserStatusBadge
            user={createMockUser(UserStatus.SUSPENDED, false)}
            showLabel={false}
          />
          <UserStatusBadge
            user={createMockUser(UserStatus.PENDING, false)}
            showLabel={false}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Without Icons</h3>
        <div className="flex flex-wrap gap-2">
          <UserStatusBadge
            user={createMockUser(UserStatus.ACTIVE)}
            showIcon={false}
          />
          <UserStatusBadge
            user={createMockUser(UserStatus.INACTIVE, false)}
            showIcon={false}
          />
          <UserStatusBadge
            user={createMockUser(UserStatus.BANNED, false)}
            showIcon={false}
          />
          <UserStatusBadge
            user={createMockUser(UserStatus.SUSPENDED, false)}
            showIcon={false}
          />
          <UserStatusBadge
            user={createMockUser(UserStatus.PENDING, false)}
            showIcon={false}
          />
        </div>
      </div>
    </div>
  ),
};
