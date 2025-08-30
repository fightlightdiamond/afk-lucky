import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserManagementPage } from "@/components/admin/UserManagementPage";
import { User, Role, UserRole, UserStatus, ActivityStatus } from "@/types/user";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

const meta: Meta<typeof UserManagementPage> = {
  title: "Admin/UserManagementPage",
  component: UserManagementPage,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Complete user management page integrating all components: filters, table, bulk operations, dialogs, and pagination. This is the main admin interface for managing users.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UserManagementPage>;

// Sample data for the complete page
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

const generateSampleUsers = (count: number): User[] => {
  const firstNames = [
    "John",
    "Jane",
    "Bob",
    "Alice",
    "Charlie",
    "Diana",
    "Eve",
    "Frank",
    "Grace",
    "Henry",
  ];
  const lastNames = [
    "Doe",
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
  ];
  const domains = ["example.com", "test.org", "demo.net", "sample.io"];

  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName =
      lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const domain = domains[i % domains.length];
    const role = sampleRoles[i % sampleRoles.length];
    const isActive = Math.random() > 0.2; // 80% active users
    const hasLoggedIn = Math.random() > 0.3; // 70% have logged in

    return {
      id: `user-${i + 1}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${
        i > 9 ? i : ""
      }@${domain}`,
      first_name: firstName,
      last_name: lastName,
      is_active: isActive,
      created_at: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      last_login: hasLoggedIn
        ? new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ).toISOString()
        : null,
      last_logout: hasLoggedIn
        ? new Date(
            Date.now() - Math.random() * 24 * 60 * 60 * 1000
          ).toISOString()
        : null,
      avatar:
        Math.random() > 0.5
          ? `https://images.unsplash.com/photo-${
              1472099645785 + i
            }?w=150&h=150&fit=crop&crop=face`
          : null,
      role_id: role.id,
      role: role,
      full_name: `${firstName} ${lastName}`,
      display_name: `${firstName} ${lastName}`,
      status: isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE,
      activity_status: hasLoggedIn
        ? Math.random() > 0.5
          ? ActivityStatus.ONLINE
          : ActivityStatus.OFFLINE
        : ActivityStatus.NEVER,
      age: 18 + Math.floor(Math.random() * 50),
      locale: ["en", "es", "fr", "de"][i % 4],
      birthday: new Date(
        1970 + Math.random() * 30,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      )
        .toISOString()
        .split("T")[0],
      address: `${100 + i} Main St, City ${i % 10}, State ${
        Math.floor(i / 10) % 5
      }`,
    };
  });
};

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Default user management page with standard configuration.",
      },
    },
  },
};

export const WithManyUsers: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "User management page with a large dataset to demonstrate pagination and performance.",
      },
    },
    mockData: {
      users: generateSampleUsers(150),
      roles: sampleRoles,
    },
  },
};

export const EmptyState: Story = {
  parameters: {
    docs: {
      description: {
        story: "User management page when no users exist in the system.",
      },
    },
    mockData: {
      users: [],
      roles: sampleRoles,
    },
  },
};

export const LoadingState: Story = {
  parameters: {
    docs: {
      description: {
        story: "User management page in loading state while fetching data.",
      },
    },
    mockData: {
      loading: true,
    },
  },
};

export const ErrorState: Story = {
  parameters: {
    docs: {
      description: {
        story: "User management page when there's an error loading data.",
      },
    },
    mockData: {
      error: new Error("Failed to load users"),
    },
  },
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "User management page optimized for mobile devices with responsive design.",
      },
    },
    mockData: {
      users: generateSampleUsers(20),
      roles: sampleRoles,
    },
  },
};

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
    docs: {
      description: {
        story: "User management page on tablet-sized screens.",
      },
    },
    mockData: {
      users: generateSampleUsers(30),
      roles: sampleRoles,
    },
  },
};

export const WithPrefilledSearch: Story = {
  parameters: {
    docs: {
      description: {
        story: "User management page with search and filters already applied.",
      },
    },
    mockData: {
      users: generateSampleUsers(50).filter(
        (u) => u.role?.name === UserRole.ADMIN
      ),
      roles: sampleRoles,
      initialFilters: {
        search: "admin",
        role: "role-admin",
        status: "active",
      },
    },
  },
};

export const AccessibilityDemo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "User management page demonstrating accessibility features. Test with keyboard navigation and screen readers.",
      },
    },
    mockData: {
      users: generateSampleUsers(10),
      roles: sampleRoles,
    },
  },
  play: async ({ canvasElement }) => {
    // Focus the search input for accessibility testing
    const canvas = canvasElement;
    const searchInput = canvas.querySelector(
      'input[placeholder*="Search"]'
    ) as HTMLElement;
    if (searchInput) {
      searchInput.focus();
    }
  },
};

export const PerformanceTest: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "User management page with a very large dataset to test performance optimizations like virtual scrolling.",
      },
    },
    mockData: {
      users: generateSampleUsers(1000),
      roles: sampleRoles,
    },
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-muted rounded-lg">
          <h2 className="text-2xl font-bold mb-4">
            User Management System Demo
          </h2>
          <p className="text-muted-foreground mb-4">
            This is a fully interactive demo of the complete user management
            system. Try all the features:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Search and filter users by various criteria</li>
            <li>Sort users by different columns</li>
            <li>Select users and perform bulk operations</li>
            <li>Create, edit, and delete users</li>
            <li>Toggle user status (active/inactive)</li>
            <li>Export user data</li>
            <li>Import users from CSV/Excel files</li>
            <li>Navigate through paginated results</li>
          </ul>
        </div>

        <UserManagementPage />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fully interactive demo of the complete user management system with all features enabled.",
      },
    },
  },
};
