import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { useState } from "react";

// Mock BulkOperations component
const BulkOperations = ({
  selectedUsers,
  onBulkBan,
  onBulkUnban,
  onBulkDelete,
  onBulkAssignRole,
  onClearSelection,
  roles = [],
}: {
  selectedUsers: string[];
  onBulkBan: (userIds: string[]) => void;
  onBulkUnban: (userIds: string[]) => void;
  onBulkDelete: (userIds: string[]) => void;
  onBulkAssignRole: (userIds: string[], roleId: string) => void;
  onClearSelection: () => void;
  roles?: Array<{ id: string; name: string; description?: string }>;
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "ban" | "unban" | "delete" | "assign_role";
    roleId?: string;
  } | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  if (selectedUsers.length === 0) {
    return null;
  }

  const handleAction = (
    type: "ban" | "unban" | "delete" | "assign_role",
    roleId?: string
  ) => {
    setConfirmAction({ type, roleId });
    setShowConfirm(true);
  };

  const executeAction = () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case "ban":
        onBulkBan(selectedUsers);
        break;
      case "unban":
        onBulkUnban(selectedUsers);
        break;
      case "delete":
        onBulkDelete(selectedUsers);
        break;
      case "assign_role":
        if (confirmAction.roleId) {
          onBulkAssignRole(selectedUsers, confirmAction.roleId);
        }
        break;
    }

    setShowConfirm(false);
    setConfirmAction(null);
    onClearSelection();
  };

  const getActionText = () => {
    if (!confirmAction) return "";

    const count = selectedUsers.length;
    switch (confirmAction.type) {
      case "ban":
        return `ban ${count} user${count > 1 ? "s" : ""}`;
      case "unban":
        return `unban ${count} user${count > 1 ? "s" : ""}`;
      case "delete":
        return `delete ${count} user${count > 1 ? "s" : ""}`;
      case "assign_role":
        const role = roles.find((r) => r.id === confirmAction.roleId);
        return `assign role "${role?.name}" to ${count} user${
          count > 1 ? "s" : ""
        }`;
      default:
        return "";
    }
  };

  return (
    <>
      {/* Bulk Action Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""}{" "}
            selected
          </span>

          <div className="flex space-x-2">
            <button
              onClick={() => handleAction("ban")}
              className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Ban
            </button>

            <button
              onClick={() => handleAction("unban")}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Unban
            </button>

            <div className="flex items-center space-x-1">
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAction("assign_role", selectedRoleId)}
                disabled={!selectedRoleId}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Assign
              </button>
            </div>

            <button
              onClick={() => handleAction("delete")}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>

            <button
              onClick={onClearSelection}
              className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Bulk Action
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to {getActionText()}? This action cannot be
              undone.
            </p>

            {confirmAction?.type === "delete" && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> Deleting users will permanently
                  remove all their data.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmAction(null);
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`px-4 py-2 text-sm text-white rounded-md ${
                  confirmAction?.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const meta: Meta<typeof BulkOperations> = {
  title: "Admin/BulkOperations",
  component: BulkOperations,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A floating action bar that appears when users are selected, providing bulk operations like ban, unban, delete, and role assignment.",
      },
    },
  },
  argTypes: {
    selectedUsers: {
      description: "Array of selected user IDs",
    },
    roles: {
      description: "Available roles for bulk assignment",
    },
    onBulkBan: {
      description: "Callback when bulk ban is executed",
      action: "bulkBan",
    },
    onBulkUnban: {
      description: "Callback when bulk unban is executed",
      action: "bulkUnban",
    },
    onBulkDelete: {
      description: "Callback when bulk delete is executed",
      action: "bulkDelete",
    },
    onBulkAssignRole: {
      description: "Callback when bulk role assignment is executed",
      action: "bulkAssignRole",
    },
    onClearSelection: {
      description: "Callback when selection is cleared",
      action: "clearSelection",
    },
  },
};

export default meta;
type Story = StoryObj<typeof BulkOperations>;

const sampleRoles = [
  { id: "role-admin", name: "ADMIN", description: "System Administrator" },
  { id: "role-editor", name: "EDITOR", description: "Content Editor" },
  { id: "role-moderator", name: "MODERATOR", description: "Content Moderator" },
  { id: "role-user", name: "USER", description: "Regular User" },
];

export const Hidden: Story = {
  args: {
    selectedUsers: [],
    roles: sampleRoles,
    onBulkBan: action("bulkBan"),
    onBulkUnban: action("bulkUnban"),
    onBulkDelete: action("bulkDelete"),
    onBulkAssignRole: action("bulkAssignRole"),
    onClearSelection: action("clearSelection"),
  },
};

export const SingleUserSelected: Story = {
  args: {
    selectedUsers: ["user-1"],
    roles: sampleRoles,
    onBulkBan: action("bulkBan"),
    onBulkUnban: action("bulkUnban"),
    onBulkDelete: action("bulkDelete"),
    onBulkAssignRole: action("bulkAssignRole"),
    onClearSelection: action("clearSelection"),
  },
};

export const MultipleUsersSelected: Story = {
  args: {
    selectedUsers: ["user-1", "user-2", "user-3"],
    roles: sampleRoles,
    onBulkBan: action("bulkBan"),
    onBulkUnban: action("bulkUnban"),
    onBulkDelete: action("bulkDelete"),
    onBulkAssignRole: action("bulkAssignRole"),
    onClearSelection: action("clearSelection"),
  },
};

export const ManyUsersSelected: Story = {
  args: {
    selectedUsers: Array.from({ length: 15 }, (_, i) => `user-${i + 1}`),
    roles: sampleRoles,
    onBulkBan: action("bulkBan"),
    onBulkUnban: action("bulkUnban"),
    onBulkDelete: action("bulkDelete"),
    onBulkAssignRole: action("bulkAssignRole"),
    onClearSelection: action("clearSelection"),
  },
};

export const NoRoles: Story = {
  args: {
    selectedUsers: ["user-1", "user-2"],
    roles: [],
    onBulkBan: action("bulkBan"),
    onBulkUnban: action("bulkUnban"),
    onBulkDelete: action("bulkDelete"),
    onBulkAssignRole: action("bulkAssignRole"),
    onClearSelection: action("clearSelection"),
  },
};

export const WithBackgroundContent: Story = {
  args: {
    selectedUsers: ["user-1", "user-2"],
    roles: sampleRoles,
    onBulkBan: action("bulkBan"),
    onBulkUnban: action("bulkUnban"),
    onBulkDelete: action("bulkDelete"),
    onBulkAssignRole: action("bulkAssignRole"),
    onClearSelection: action("clearSelection"),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-gray-600 mb-4">
            This story shows how the bulk operations component appears over page
            content. The floating action bar should be visible at the bottom of
            the screen.
          </p>
          <div className="space-y-2">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded">
                Sample user row {i + 1}
              </div>
            ))}
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
};
