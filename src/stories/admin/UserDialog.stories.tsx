import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { useState } from "react";
import { User } from "@/types/user";

// Mock UserDialog component
const UserDialog = ({
  user,
  roles,
  open,
  onClose,
  onSave,
}: {
  user?: User;
  roles: Array<{ id: string; name: string; description?: string }>;
  open: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
}) => {
  const [formData, setFormData] = useState({
    email: user?.email || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    password: "",
    role_id: user?.role?.id || "",
    is_active: user?.is_active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value === "no-role" ? "" : value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.first_name) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name) {
      newErrors.last_name = "Last name is required";
    }

    if (!user && !formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const submitData = { ...formData };
      if (user && !submitData.password) {
        delete (submitData as any).password;
      }

      onSave(submitData);
      setIsLoading(false);
    }, 1000);
  };

  if (!open) return null;

  const selectedRole = roles.find((role) => role.id === formData.role_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {user ? "Edit User" : "Create New User"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.first_name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter first name"
              />
              {errors.first_name && (
                <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.last_name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter last name"
              />
              {errors.last_name && (
                <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {user && "(leave blank to keep current)"}
              {!user && " *"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={user ? "Enter new password" : "Enter password"}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
            {formData.password && (
              <div className="mt-1">
                <div className="text-xs text-gray-500">Password strength:</div>
                <div className="flex space-x-1 mt-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded ${
                        formData.password.length >= level * 2
                          ? formData.password.length >= 8
                            ? "bg-green-500"
                            : "bg-yellow-500"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role_id || "no-role"}
              onChange={(e) => handleSelectChange("role_id", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="no-role">No Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            {/* Role Preview */}
            {selectedRole && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm font-medium text-blue-900">
                  {selectedRole.name}
                </div>
                {selectedRole.description && (
                  <div className="text-xs text-blue-700 mt-1">
                    {selectedRole.description}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="rounded"
            />
            <label
              htmlFor="is_active"
              className="text-sm font-medium text-gray-700"
            >
              Active User
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {isLoading
                ? user
                  ? "Updating..."
                  : "Creating..."
                : user
                ? "Update User"
                : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const meta: Meta<typeof UserDialog> = {
  title: "Admin/UserDialog",
  component: UserDialog,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A modal dialog for creating and editing users with form validation, role selection, and password strength indicator.",
      },
    },
  },
  argTypes: {
    user: {
      description: "User object for editing (undefined for creating new user)",
    },
    roles: {
      description: "Available roles for selection",
    },
    open: {
      description: "Whether the dialog is open",
      control: "boolean",
    },
    onClose: {
      description: "Callback when dialog is closed",
      action: "close",
    },
    onSave: {
      description: "Callback when form is submitted",
      action: "save",
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserDialog>;

const sampleRoles = [
  {
    id: "role-admin",
    name: "ADMIN",
    description: "Full system access with all permissions",
  },
  {
    id: "role-editor",
    name: "EDITOR",
    description: "Can create and edit content",
  },
  {
    id: "role-moderator",
    name: "MODERATOR",
    description: "Can moderate content and users",
  },
  {
    id: "role-user",
    name: "USER",
    description: "Basic user with limited permissions",
  },
];

const sampleUser: User = {
  id: "user-1",
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  last_login: "2024-01-15T10:00:00Z",
  last_logout: null,
  avatar: null,
  role: {
    id: "role-editor",
    name: "EDITOR",
    permissions: ["content:read", "content:write"],
    description: "Content Editor",
  },
  full_name: "John Doe",
  status: "active",
  activity_status: "offline",
};

export const Closed: Story = {
  args: {
    user: undefined,
    roles: sampleRoles,
    open: false,
    onClose: action("close"),
    onSave: action("save"),
  },
};

export const CreateUser: Story = {
  args: {
    user: undefined,
    roles: sampleRoles,
    open: true,
    onClose: action("close"),
    onSave: action("save"),
  },
};

export const EditUser: Story = {
  args: {
    user: sampleUser,
    roles: sampleRoles,
    open: true,
    onClose: action("close"),
    onSave: action("save"),
  },
};

export const EditUserWithoutRole: Story = {
  args: {
    user: {
      ...sampleUser,
      role: null,
    },
    roles: sampleRoles,
    open: true,
    onClose: action("close"),
    onSave: action("save"),
  },
};

export const EditInactiveUser: Story = {
  args: {
    user: {
      ...sampleUser,
      is_active: false,
      status: "inactive",
    },
    roles: sampleRoles,
    open: true,
    onClose: action("close"),
    onSave: action("save"),
  },
};

export const NoRoles: Story = {
  args: {
    user: undefined,
    roles: [],
    open: true,
    onClose: action("close"),
    onSave: action("save"),
  },
};

export const WithBackgroundContent: Story = {
  args: {
    user: undefined,
    roles: sampleRoles,
    open: true,
    onClose: action("close"),
    onSave: action("save"),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="bg-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">User Management</h1>
          <p className="text-gray-600 mb-4">
            This story shows how the user dialog appears over page content.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">User {i + 1}</h3>
                <p className="text-sm text-gray-600">user{i + 1}@example.com</p>
              </div>
            ))}
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
};
