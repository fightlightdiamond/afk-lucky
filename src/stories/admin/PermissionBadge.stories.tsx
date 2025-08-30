import type { Meta, StoryObj } from "@storybook/react";
import { PermissionBadge } from "@/components/admin/PermissionBadge";

const meta: Meta<typeof PermissionBadge> = {
  title: "Admin/PermissionBadge",
  component: PermissionBadge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A badge component for displaying user permissions with appropriate styling and tooltips. Automatically categorizes permissions and applies semantic colors.",
      },
    },
  },
  argTypes: {
    permission: {
      description: "The permission string to display",
      control: { type: "text" },
    },
    variant: {
      description: "Badge variant/style",
      control: { type: "select" },
      options: ["default", "secondary", "destructive", "outline"],
    },
    size: {
      description: "Badge size",
      control: { type: "select" },
      options: ["sm", "default", "lg"],
    },
    className: {
      description: "Additional CSS classes",
      control: { type: "text" },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PermissionBadge>;

export const UserPermissions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PermissionBadge permission="user:read" />
      <PermissionBadge permission="user:write" />
      <PermissionBadge permission="user:delete" />
      <PermissionBadge permission="user:impersonate" />
    </div>
  ),
};

export const ContentPermissions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PermissionBadge permission="content:read" />
      <PermissionBadge permission="content:write" />
      <PermissionBadge permission="content:delete" />
      <PermissionBadge permission="content:publish" />
      <PermissionBadge permission="content:moderate" />
    </div>
  ),
};

export const SystemPermissions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PermissionBadge permission="system:admin" />
      <PermissionBadge permission="system:config" />
      <PermissionBadge permission="system:backup" />
      <PermissionBadge permission="system:logs" />
    </div>
  ),
};

export const RolePermissions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PermissionBadge permission="role:read" />
      <PermissionBadge permission="role:write" />
      <PermissionBadge permission="role:delete" />
      <PermissionBadge permission="role:assign" />
    </div>
  ),
};

export const AnalyticsPermissions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PermissionBadge permission="analytics:read" />
      <PermissionBadge permission="analytics:export" />
      <PermissionBadge permission="analytics:admin" />
    </div>
  ),
};

export const SinglePermission: Story = {
  args: {
    permission: "user:read",
  },
};

export const LongPermissionName: Story = {
  args: {
    permission: "very:long:permission:name:that:might:wrap",
  },
};

export const UnknownPermission: Story = {
  args: {
    permission: "unknown:permission",
  },
};

export const DifferentVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium">Default:</span>
        <PermissionBadge permission="user:read" variant="default" />
        <PermissionBadge permission="content:write" variant="default" />
        <PermissionBadge permission="system:admin" variant="default" />
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium">Secondary:</span>
        <PermissionBadge permission="user:read" variant="secondary" />
        <PermissionBadge permission="content:write" variant="secondary" />
        <PermissionBadge permission="system:admin" variant="secondary" />
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium">Outline:</span>
        <PermissionBadge permission="user:read" variant="outline" />
        <PermissionBadge permission="content:write" variant="outline" />
        <PermissionBadge permission="system:admin" variant="outline" />
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium">Destructive:</span>
        <PermissionBadge permission="user:delete" variant="destructive" />
        <PermissionBadge permission="content:delete" variant="destructive" />
        <PermissionBadge permission="system:admin" variant="destructive" />
      </div>
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Small:</span>
        <PermissionBadge permission="user:read" size="sm" />
        <PermissionBadge permission="content:write" size="sm" />
        <PermissionBadge permission="system:admin" size="sm" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Default:</span>
        <PermissionBadge permission="user:read" size="default" />
        <PermissionBadge permission="content:write" size="default" />
        <PermissionBadge permission="system:admin" size="default" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Large:</span>
        <PermissionBadge permission="user:read" size="lg" />
        <PermissionBadge permission="content:write" size="lg" />
        <PermissionBadge permission="system:admin" size="lg" />
      </div>
    </div>
  ),
};

export const AdminRolePermissions: Story = {
  render: () => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Admin Role Permissions</h3>
      <div className="flex flex-wrap gap-1">
        <PermissionBadge permission="user:read" />
        <PermissionBadge permission="user:write" />
        <PermissionBadge permission="user:delete" />
        <PermissionBadge permission="role:manage" />
        <PermissionBadge permission="system:admin" />
        <PermissionBadge permission="content:manage" />
        <PermissionBadge permission="analytics:view" />
        <PermissionBadge permission="billing:manage" />
        <PermissionBadge permission="support:admin" />
      </div>
    </div>
  ),
};

export const EditorRolePermissions: Story = {
  render: () => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Editor Role Permissions</h3>
      <div className="flex flex-wrap gap-1">
        <PermissionBadge permission="content:read" />
        <PermissionBadge permission="content:write" />
        <PermissionBadge permission="content:publish" />
        <PermissionBadge permission="user:read" />
        <PermissionBadge permission="analytics:view" />
      </div>
    </div>
  ),
};

export const ModeratorRolePermissions: Story = {
  render: () => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Moderator Role Permissions</h3>
      <div className="flex flex-wrap gap-1">
        <PermissionBadge permission="content:moderate" />
        <PermissionBadge permission="user:moderate" />
        <PermissionBadge permission="user:read" />
        <PermissionBadge permission="content:read" />
        <PermissionBadge permission="reports:view" />
      </div>
    </div>
  ),
};

export const UserRolePermissions: Story = {
  render: () => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">User Role Permissions</h3>
      <div className="flex flex-wrap gap-1">
        <PermissionBadge permission="user:read" />
        <PermissionBadge permission="content:read" />
        <PermissionBadge permission="profile:update" />
      </div>
    </div>
  ),
};

export const WithCustomStyling: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PermissionBadge
        permission="user:admin"
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      />
      <PermissionBadge
        permission="content:manage"
        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      />
      <PermissionBadge
        permission="system:config"
        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      />
    </div>
  ),
};
