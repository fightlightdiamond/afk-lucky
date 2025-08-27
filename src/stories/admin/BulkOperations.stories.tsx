import type { Meta, StoryObj } from "@storybook/react";
import { BulkOperations } from "@/components/admin/BulkOperations";
import { User, Role, UserRole, UserStatus, ActivityStatus } from "@/types/user";

const meta: Meta<typeof BulkOperations> = {
  title: "Admin/BulkOperations",
  component: BulkOperations,
  parameters: {
    layout: "fullscreen",
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
};
