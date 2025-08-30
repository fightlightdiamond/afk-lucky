import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { UserDialog } from "@/components/admin/UserDialog";
import { User, Role, UserRole, UserStatus, ActivityStatus } from "@/types/user";

// Sample roles for the dialog
const sampleRoles: Role[] = [
  {
    id: "role-admin",
    name: UserRole.ADMIN,
    description: "System Administrator with full access",
    permissions: [
      "user:read",
      "user:write",
      "user:delete",
      "role:manage",
      "system:admin",
      "content:manage",
      "analytics:view",
    ],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-editor",
    name: UserRole.EDITOR,
    description: "Content Editor with content management permissions",
    permissions: [
      "content:read",
      "content:write",
      "content:publish",
      "user:read",
    ],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-moderator",
    name: UserRole.MODERATOR,
    description: "Content Moderator with moderation permissions",
    permissions: [
      "content:moderate",
      "user:moderate",
      "user:read",
      "content:read",
    ],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-user",
    name: UserRole.USER,
    description: "Regular User with basic permissions",
    permissions: ["user:read", "content:read"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// Sample user for editing
const sampleUser: User = {
  id: "user-1",
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
  last_login: "2024-01-15T10:00:00Z",
  last_logout: "2024-01-15T18:00:00Z",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  role_id: "role-admin",
  role: sampleRoles[0],
  full_name: "John Doe",
  display_name: "John Doe",
  status: UserStatus.ACTIVE,
  activity_status: ActivityStatus.OFFLINE,
  age: 32,
  locale: "en",
  birthday: "1992-03-15",
  address: "123 Main St, New York, NY 10001",
  sex: true,
  slack_webhook_url:
    "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
};

// Interactive wrapper for Storybook
const InteractiveUserDialog = (props: any) => {
  const [open, setOpen] = useState(props.open || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setOpen(false);
    props.onSubmit(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    props.onOpenChange(newOpen);
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {props.user ? "Edit User" : "Create User"}
      </button>
      <UserDialog
        {...props}
        open={open}
        onOpenChange={handleOpenChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

const meta: Meta<typeof UserDialog> = {
  title: "Admin/UserDialog",
  component: InteractiveUserDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive dialog for creating and editing users. Features form validation, password strength checking, email availability verification, role selection with permission preview, and accessibility support.",
      },
    },
  },
  argTypes: {
    open: {
      description: "Whether the dialog is open",
      control: { type: "boolean" },
    },
    user: {
      description: "User object for editing (null for creating new user)",
      control: { type: "object" },
    },
    roles: {
      description: "Available roles for selection",
      control: { type: "object" },
    },
    isLoading: {
      description: "Whether the form is in loading/submitting state",
      control: { type: "boolean" },
    },
    onOpenChange: {
      description: "Callback when dialog open state changes",
      action: "openChange",
    },
    onSubmit: {
      description: "Callback when form is submitted",
      action: "submit",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UserDialog>;

export const CreateUser: Story = {
  args: {
    open: false,
    user: null,
    roles: sampleRoles,
    isLoading: false,
    onOpenChange: fn(),
    onSubmit: fn(),
  },
};

export const EditUser: Story = {
  args: {
    open: false,
    user: sampleUser,
    roles: sampleRoles,
    isLoading: false,
    onOpenChange: fn(),
    onSubmit: fn(),
  },
};

export const EditUserWithoutRole: Story = {
  args: {
    open: false,
    user: {
      ...sampleUser,
      role: null,
      role_id: null,
    },
    roles: sampleRoles,
    isLoading: false,
    onOpenChange: fn(),
    onSubmit: fn(),
  },
};

export const EditInactiveUser: Story = {
  args: {
    open: false,
    user: {
      ...sampleUser,
      is_active: false,
      status: UserStatus.INACTIVE,
    },
    roles: sampleRoles,
    isLoading: false,
    onOpenChange: fn(),
    onSubmit: fn(),
  },
};

export const CreateUserWithLimitedRoles: Story = {
  args: {
    open: false,
    user: null,
    roles: sampleRoles.slice(2), // Only moderator and user roles
    isLoading: false,
    onOpenChange: fn(),
    onSubmit: fn(),
  },
};

export const NoRolesAvailable: Story = {
  args: {
    open: false,
    user: null,
    roles: [],
    isLoading: false,
    onOpenChange: fn(),
    onSubmit: fn(),
  },
};

export const LoadingState: Story = {
  args: {
    open: false,
    user: sampleUser,
    roles: sampleRoles,
    isLoading: true,
    onOpenChange: fn(),
    onSubmit: fn(),
  },
};

export const UserWithAllFields: Story = {
  args: {
    open: false,
    user: {
      ...sampleUser,
      sex: false,
      birthday: "1990-12-25",
      address: "456 Oak Avenue, Apartment 3B, San Francisco, CA 94102",
      locale: "fr",
      group_id: 5,
      coin: "1500000",
      slack_webhook_url:
        "https://hooks.slack.com/services/T12345678/B87654321/abcdefghijklmnopqrstuvwx",
    },
    roles: sampleRoles,
    isLoading: false,
    onOpenChange: fn(),
    onSubmit: fn(),
  },
};

export const UserWithMinimalData: Story = {
  args: {
    open: false,
    user: {
      id: "user-minimal",
      email: "minimal@example.com",
      first_name: "Min",
      last_name: "User",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      role_id: null,
      role: null,
      full_name: "Min User",
      display_name: "Min User",
      status: UserStatus.ACTIVE,
      activity_status: ActivityStatus.NEVER,
    },
    roles: sampleRoles,
    isLoading: false,
    onOpenChange: fn(),
    onSubmit: fn(),
  },
};

export const CreateUserOpenByDefault: Story = {
  args: {
    open: true,
    user: null,
    roles: sampleRoles,
    isLoading: false,
    onOpenChange: fn(),
    onSubmit: fn(),
  },
};

export const EditUserOpenByDefault: Story = {
  args: {
    open: true,
    user: sampleUser,
    roles: sampleRoles,
    isLoading: false,
    onOpenChange: fn(),
    onSubmit: fn(),
  },
};

export const UserWithLongData: Story = {
  args: {
    open: false,
    user: {
      ...sampleUser,
      first_name: "Christopher Alexander",
      last_name: "Montgomery-Richardson",
      email:
        "christopher.alexander.montgomery.richardson@very-long-domain-name-example.com",
      full_name: "Christopher Alexander Montgomery-Richardson",
      display_name: "Christopher Alexander Montgomery-Richardson",
      address:
        "1234 Very Long Street Name That Goes On And On, Apartment 567B, Some Very Long City Name, State With Long Name 12345-6789",
      role: {
        ...sampleRoles[0],
        description:
          "System Administrator with comprehensive access to all system functions, user management, content management, analytics, reporting, and advanced configuration options",
        permissions: [
          "user:read",
          "user:write",
          "user:delete",
          "user:impersonate",
          "role:read",
          "role:write",
          "role:delete",
          "role:assign",
          "content:read",
          "content:write",
          "content:delete",
          "content:publish",
          "analytics:read",
          "analytics:export",
          "system:admin",
          "system:config",
          "billing:read",
          "billing:write",
          "support:read",
          "support:write",
        ],
      },
    },
    roles: sampleRoles,
    isLoading: false,
    onOpenChange: fn(),
    onSubmit: fn(),
  },
};
