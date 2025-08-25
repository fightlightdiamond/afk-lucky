import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { useState } from "react";
import { UserFilters as UserFiltersType } from "@/types/user";

// Mock UserFilters component
const UserFilters = ({
  filters,
  roles,
  onFiltersChange,
  onClearFilters,
  onExport,
}: {
  filters: UserFiltersType;
  roles: Array<{ id: string; name: string; description?: string }>;
  onFiltersChange: (filters: Partial<UserFiltersType>) => void;
  onClearFilters: () => void;
  onExport: (format: "csv" | "excel") => void;
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            placeholder="Search users..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={filters.role || ""}
            onChange={(e) => onFiltersChange({ role: e.target.value || null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) =>
              onFiltersChange({
                status: (e.target.value as "active" | "inactive") || null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <div className="flex space-x-2">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFiltersChange({ sortBy: e.target.value as any })
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="created_at">Created Date</option>
              <option value="full_name">Name</option>
              <option value="email">Email</option>
              <option value="last_login">Last Login</option>
              <option value="role">Role</option>
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) =>
                onFiltersChange({ sortOrder: e.target.value as "asc" | "desc" })
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Created Date Range
        </label>
        <div className="flex space-x-2">
          <input
            type="date"
            value={filters.dateRange?.from?.toISOString().split("T")[0] || ""}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              onFiltersChange({
                dateRange: {
                  from: date,
                  to: filters.dateRange?.to || null,
                },
              });
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="self-center text-gray-500">to</span>
          <input
            type="date"
            value={filters.dateRange?.to?.toISOString().split("T")[0] || ""}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              onFiltersChange({
                dateRange: {
                  from: filters.dateRange?.from || null,
                  to: date,
                },
              });
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Filters
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              onFiltersChange({
                dateRange: {
                  from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  to: new Date(),
                },
              })
            }
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full"
          >
            Last 7 days
          </button>
          <button
            onClick={() =>
              onFiltersChange({
                dateRange: {
                  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  to: new Date(),
                },
              })
            }
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full"
          >
            Last 30 days
          </button>
          <button
            onClick={() => onFiltersChange({ status: "active" })}
            className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded-full"
          >
            Active Users
          </button>
          <button
            onClick={() => onFiltersChange({ status: "inactive" })}
            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded-full"
          >
            Inactive Users
          </button>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button
          onClick={() => onExport("csv")}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Export CSV
        </button>
        <button
          onClick={() => onExport("excel")}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Export Excel
        </button>
      </div>
    </div>
  );
};

// Interactive wrapper for Storybook
const InteractiveUserFilters = (props: any) => {
  const [filters, setFilters] = useState<UserFiltersType>(props.filters);

  const handleFiltersChange = (newFilters: Partial<UserFiltersType>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    props.onFiltersChange(updatedFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: UserFiltersType = {
      search: "",
      role: null,
      status: null,
      dateRange: null,
      sortBy: "created_at",
      sortOrder: "desc",
    };
    setFilters(clearedFilters);
    props.onClearFilters();
  };

  return (
    <UserFilters
      {...props}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onClearFilters={handleClearFilters}
    />
  );
};

const meta: Meta<typeof UserFilters> = {
  title: "Admin/UserFilters",
  component: InteractiveUserFilters,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A comprehensive filter component for the user management table with search, role filtering, status filtering, date range selection, and export functionality.",
      },
    },
  },
  argTypes: {
    filters: {
      description: "Current filter state",
    },
    roles: {
      description: "Available roles for filtering",
    },
    onFiltersChange: {
      description: "Callback when filters change",
      action: "filtersChange",
    },
    onClearFilters: {
      description: "Callback when clear filters is clicked",
      action: "clearFilters",
    },
    onExport: {
      description: "Callback when export button is clicked",
      action: "export",
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserFilters>;

const sampleRoles = [
  { id: "role-admin", name: "ADMIN", description: "System Administrator" },
  { id: "role-editor", name: "EDITOR", description: "Content Editor" },
  { id: "role-moderator", name: "MODERATOR", description: "Content Moderator" },
  { id: "role-user", name: "USER", description: "Regular User" },
];

export const Default: Story = {
  args: {
    filters: {
      search: "",
      role: null,
      status: null,
      dateRange: null,
      sortBy: "created_at",
      sortOrder: "desc",
    },
    roles: sampleRoles,
    onFiltersChange: action("filtersChange"),
    onClearFilters: action("clearFilters"),
    onExport: action("export"),
  },
};

export const WithSearchTerm: Story = {
  args: {
    filters: {
      search: "john",
      role: null,
      status: null,
      dateRange: null,
      sortBy: "created_at",
      sortOrder: "desc",
    },
    roles: sampleRoles,
    onFiltersChange: action("filtersChange"),
    onClearFilters: action("clearFilters"),
    onExport: action("export"),
  },
};

export const WithRoleFilter: Story = {
  args: {
    filters: {
      search: "",
      role: "role-admin",
      status: null,
      dateRange: null,
      sortBy: "created_at",
      sortOrder: "desc",
    },
    roles: sampleRoles,
    onFiltersChange: action("filtersChange"),
    onClearFilters: action("clearFilters"),
    onExport: action("export"),
  },
};

export const WithStatusFilter: Story = {
  args: {
    filters: {
      search: "",
      role: null,
      status: "active",
      dateRange: null,
      sortBy: "created_at",
      sortOrder: "desc",
    },
    roles: sampleRoles,
    onFiltersChange: action("filtersChange"),
    onClearFilters: action("clearFilters"),
    onExport: action("export"),
  },
};

export const WithDateRange: Story = {
  args: {
    filters: {
      search: "",
      role: null,
      status: null,
      dateRange: {
        from: new Date("2024-01-01"),
        to: new Date("2024-01-31"),
      },
      sortBy: "created_at",
      sortOrder: "desc",
    },
    roles: sampleRoles,
    onFiltersChange: action("filtersChange"),
    onClearFilters: action("clearFilters"),
    onExport: action("export"),
  },
};

export const WithMultipleFilters: Story = {
  args: {
    filters: {
      search: "admin",
      role: "role-admin",
      status: "active",
      dateRange: {
        from: new Date("2024-01-01"),
        to: new Date("2024-01-31"),
      },
      sortBy: "full_name",
      sortOrder: "asc",
    },
    roles: sampleRoles,
    onFiltersChange: action("filtersChange"),
    onClearFilters: action("clearFilters"),
    onExport: action("export"),
  },
};

export const WithCustomSorting: Story = {
  args: {
    filters: {
      search: "",
      role: null,
      status: null,
      dateRange: null,
      sortBy: "email",
      sortOrder: "asc",
    },
    roles: sampleRoles,
    onFiltersChange: action("filtersChange"),
    onClearFilters: action("clearFilters"),
    onExport: action("export"),
  },
};

export const NoRoles: Story = {
  args: {
    filters: {
      search: "",
      role: null,
      status: null,
      dateRange: null,
      sortBy: "created_at",
      sortOrder: "desc",
    },
    roles: [],
    onFiltersChange: action("filtersChange"),
    onClearFilters: action("clearFilters"),
    onExport: action("export"),
  },
};
