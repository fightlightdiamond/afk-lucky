import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { UserFilters } from "@/components/admin/UserFilters";
import { UserFilters as UserFiltersType, Role, UserRole } from "@/types/user";

// Interactive wrapper for Storybook
const InteractiveUserFilters = (props: {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
  onExport: (format: "csv" | "excel", fields?: string[]) => void;
}) => {
  const [filters, setFilters] = useState<UserFiltersType>(props.filters);

  const handleFiltersChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters);
    props.onFiltersChange(newFilters);
  };

  const handleExport = async (format: "csv" | "excel", fields?: string[]) => {
    props.onExport(format, fields);
  };

  return (
    <UserFilters
      {...props}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onExport={handleExport}
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
          "A comprehensive filter component for the user management table with advanced search, role filtering, status filtering, date range selection, activity filters, and export functionality. Features responsive design and accessibility support.",
      },
    },
  },
  argTypes: {
    filters: {
      description: "Current filter state object",
      control: { type: "object" },
    },
    roles: {
      description: "Available roles for filtering",
      control: { type: "object" },
    },
    isLoading: {
      description: "Whether filters are in loading state",
      control: { type: "boolean" },
    },
    totalRecords: {
      description: "Total number of records for export context",
      control: { type: "number" },
    },
    onFiltersChange: {
      description: "Callback when filters change",
      action: "filtersChange",
    },
    onExport: {
      description: "Callback when export is requested",
      action: "export",
    },
    onImport: {
      description: "Callback when import is requested",
      action: "import",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UserFilters>;

const sampleRoles: Role[] = [
  {
    id: "role-admin",
    name: UserRole.ADMIN,
    description: "System Administrator",
    permissions: [
      "user:read",
      "user:write",
      "user:delete",
      "role:manage",
      "system:admin",
    ],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-editor",
    name: UserRole.EDITOR,
    description: "Content Editor",
    permissions: ["content:read", "content:write", "user:read"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-moderator",
    name: UserRole.MODERATOR,
    description: "Content Moderator",
    permissions: ["content:moderate", "user:moderate", "user:read"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-user",
    name: UserRole.USER,
    description: "Regular User",
    permissions: ["user:read"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const defaultFilters: UserFiltersType = {
  search: "",
  role: null,
  status: null,
  dateRange: null,
  activityDateRange: null,
  sortBy: "created_at",
  sortOrder: "desc",
  hasAvatar: null,
  locale: null,
  group_id: null,
  activity_status: null,
};

export const Default: Story = {
  args: {
    filters: defaultFilters,
    roles: sampleRoles,
    isLoading: false,
    totalRecords: 150,
    onFiltersChange: fn(),
    onExport: fn(),
    onImport: fn(),
  },
};

export const WithSearchTerm: Story = {
  args: {
    filters: {
      ...defaultFilters,
      search: "john doe",
    },
    roles: sampleRoles,
    isLoading: false,
    totalRecords: 5,
    onFiltersChange: fn(),
    onExport: fn(),
    onImport: fn(),
  },
};

export const WithRoleFilter: Story = {
  args: {
    filters: {
      ...defaultFilters,
      role: "role-admin",
    },
    roles: sampleRoles,
    isLoading: false,
    totalRecords: 12,
    onFiltersChange: fn(),
    onExport: fn(),
    onImport: fn(),
  },
};

export const WithStatusFilter: Story = {
  args: {
    filters: {
      ...defaultFilters,
      status: "active",
    },
    roles: sampleRoles,
    isLoading: false,
    totalRecords: 128,
    onFiltersChange: fn(),
    onExport: fn(),
    onImport: fn(),
  },
};

export const WithActivityFilter: Story = {
  args: {
    filters: {
      ...defaultFilters,
      activity_status: "never",
    },
    roles: sampleRoles,
    isLoading: false,
    totalRecords: 23,
    onFiltersChange: fn(),
    onExport: fn(),
    onImport: fn(),
  },
};

export const WithDateRange: Story = {
  args: {
    filters: {
      ...defaultFilters,
      dateRange: {
        from: new Date("2024-01-01"),
        to: new Date("2024-01-31"),
      },
    },
    roles: sampleRoles,
    isLoading: false,
    totalRecords: 45,
    onFiltersChange: fn(),
    onExport: fn(),
    onImport: fn(),
  },
};

export const WithActivityDateRange: Story = {
  args: {
    filters: {
      ...defaultFilters,
      activityDateRange: {
        from: new Date("2024-01-10"),
        to: new Date("2024-01-16"),
      },
    },
    roles: sampleRoles,
    isLoading: false,
    totalRecords: 67,
    onFiltersChange: fn(),
    onExport: fn(),
    onImport: fn(),
  },
};

export const WithMultipleFilters: Story = {
  args: {
    filters: {
      ...defaultFilters,
      search: "admin",
      role: "role-admin",
      status: "active",
      activity_status: "online",
      hasAvatar: true,
      dateRange: {
        from: new Date("2024-01-01"),
        to: new Date("2024-01-31"),
      },
      sortBy: "full_name",
      sortOrder: "asc",
    },
    roles: sampleRoles,
    isLoading: false,
    totalRecords: 3,
    onFiltersChange: fn(),
    onExport: fn(),
    onImport: fn(),
  },
};

export const WithCustomSorting: Story = {
  args: {
    filters: {
      ...defaultFilters,
      sortBy: "last_login",
      sortOrder: "desc",
    },
    roles: sampleRoles,
    isLoading: false,
    totalRecords: 150,
    onFiltersChange: fn(),
    onExport: fn(),
    onImport: fn(),
  },
};

export const LoadingState: Story = {
  args: {
    filters: defaultFilters,
    roles: sampleRoles,
    isLoading: true,
    totalRecords: 0,
    onFiltersChange: fn(),
    onExport: fn(),
    onImport: fn(),
  },
};

export const NoRoles: Story = {
  args: {
    filters: defaultFilters,
    roles: [],
    isLoading: false,
    totalRecords: 150,
    onFiltersChange: fn(),
    onExport: fn(),
    onImport: fn(),
  },
};

export const MobileView: Story = {
  args: {
    filters: {
      ...defaultFilters,
      search: "user",
      role: "role-user",
      status: "active",
    },
    roles: sampleRoles,
    isLoading: false,
    totalRecords: 89,
    onFiltersChange: fn(),
    onExport: fn(),
    onImport: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const WithoutExportImport: Story = {
  args: {
    filters: defaultFilters,
    roles: sampleRoles,
    isLoading: false,
    totalRecords: 150,
    onFiltersChange: fn(),
    // No onExport or onImport props
  },
};
