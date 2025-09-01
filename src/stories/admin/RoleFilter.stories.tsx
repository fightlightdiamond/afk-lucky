import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { RoleFilter } from "@/components/admin/filters/RoleFilter";
import { Role, UserRole } from "@/types/user";

// Interactive wrapper for Storybook
const RoleFilterWrapper = (props: React.ComponentProps<typeof RoleFilter>) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(
    props.selectedRole || null
  );

  const handleRoleChange = (roleId: string | null) => {
    setSelectedRole(roleId);
    props.onRoleChange(roleId);
  };

  return (
    <RoleFilter
      {...props}
      selectedRole={selectedRole}
      onRoleChange={handleRoleChange}
    />
  );
};

const meta: Meta<typeof RoleFilter> = {
  title: "Admin/Filters/RoleFilter",
  component: InteractiveRoleFilter,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A role filter component for filtering users by their assigned roles. Features dropdown selection with role descriptions, permission previews, and accessibility support.",
      },
    },
  },
  argTypes: {
    roles: {
      description: "Available roles for filtering",
      control: { type: "object" },
    },
    selectedRole: {
      description: "Currently selected role ID",
      control: { type: "text" },
    },
    disabled: {
      description: "Whether the filter is disabled",
      control: { type: "boolean" },
    },
    showPermissions: {
      description: "Whether to show role permissions in dropdown",
      control: { type: "boolean" },
    },
    onRoleChange: {
      description: "Callback when selected role changes",
      action: "roleChange",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RoleFilter>;

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

export const Default: Story = {
  args: {
    roles: sampleRoles,
    selectedRole: null,
    disabled: false,
    showPermissions: true,
    onRoleChange: fn(),
  },
};

export const WithSelection: Story = {
  args: {
    roles: sampleRoles,
    selectedRole: "role-admin",
    disabled: false,
    showPermissions: true,
    onRoleChange: fn(),
  },
};

export const WithoutPermissions: Story = {
  args: {
    roles: sampleRoles,
    selectedRole: null,
    disabled: false,
    showPermissions: false,
    onRoleChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Role filter without showing permissions in the dropdown.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    roles: sampleRoles,
    selectedRole: "role-editor",
    disabled: true,
    showPermissions: true,
    onRoleChange: fn(),
  },
};

export const NoRoles: Story = {
  args: {
    roles: [],
    selectedRole: null,
    disabled: false,
    showPermissions: true,
    onRoleChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Role filter when no roles are available.",
      },
    },
  },
};

export const SingleRole: Story = {
  args: {
    roles: [sampleRoles[0]],
    selectedRole: null,
    disabled: false,
    showPermissions: true,
    onRoleChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Role filter with only one role available.",
      },
    },
  },
};

export const ManyRoles: Story = {
  args: {
    roles: [
      ...sampleRoles,
      {
        id: "role-author",
        name: "AUTHOR" as UserRole,
        description: "Content Author with writing permissions",
        permissions: ["content:read", "content:write"],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "role-reviewer",
        name: "REVIEWER" as UserRole,
        description: "Content Reviewer with review permissions",
        permissions: ["content:read", "content:review"],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "role-publisher",
        name: "PUBLISHER" as UserRole,
        description: "Content Publisher with publishing permissions",
        permissions: ["content:read", "content:publish"],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "role-analyst",
        name: "ANALYST" as UserRole,
        description: "Data Analyst with analytics permissions",
        permissions: ["analytics:read", "analytics:export"],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ],
    selectedRole: null,
    disabled: false,
    showPermissions: true,
    onRoleChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Role filter with many roles to test dropdown scrolling.",
      },
    },
  },
};

export const RolesWithLongNames: Story = {
  args: {
    roles: [
      {
        id: "role-super-admin",
        name: "SUPER_ADMINISTRATOR" as UserRole,
        description:
          "Super Administrator with comprehensive system access and advanced configuration capabilities",
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
          "system:admin",
          "system:config",
          "analytics:read",
          "analytics:export",
        ],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "role-content-manager",
        name: "CONTENT_MANAGEMENT_SPECIALIST" as UserRole,
        description:
          "Content Management Specialist responsible for overseeing all content creation, editing, and publishing workflows",
        permissions: [
          "content:read",
          "content:write",
          "content:publish",
          "content:moderate",
        ],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ],
    selectedRole: null,
    disabled: false,
    showPermissions: true,
    onRoleChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Role filter with long role names and descriptions to test text wrapping.",
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: function InteractiveDemoRender(args) {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [showPermissions, setShowPermissions] = useState(true);
    const [disabled, setDisabled] = useState(false);

    const handleRoleChange = (roleId: string | null) => {
      setSelectedRole(roleId);
      args.onRoleChange?.(roleId);
    };

    const selectedRoleData = sampleRoles.find(
      (role) => role.id === selectedRole
    );

    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showPermissions}
                onChange={(e) => setShowPermissions(e.target.checked)}
              />
              Show Permissions
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
              />
              Disabled
            </label>
          </div>

          <RoleFilter
            roles={sampleRoles}
            selectedRole={selectedRole}
            disabled={disabled}
            showPermissions={showPermissions}
            onRoleChange={handleRoleChange}
          />
        </div>

        {selectedRoleData && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium">Selected Role Details:</h4>
            <p>
              <strong>Name:</strong> {selectedRoleData.name}
            </p>
            <p>
              <strong>Description:</strong> {selectedRoleData.description}
            </p>
            <div>
              <strong>Permissions:</strong>
              <ul className="list-disc list-inside mt-1 text-sm">
                {selectedRoleData.permissions.map((permission, index) => (
                  <li key={index}>{permission}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  },
};
