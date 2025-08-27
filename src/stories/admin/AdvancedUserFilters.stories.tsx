import type { Meta, StoryObj } from "@storybook/react";
import { AdvancedUserFilters } from "@/components/admin/filters/AdvancedUserFilters";
import { UserFilters } from "@/types/user";

const meta: Meta<typeof AdvancedUserFilters> = {
  title: "Admin/AdvancedUserFilters",
  component: AdvancedUserFilters,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockRoles = [
  { id: "1", name: "Admin", description: "Full system access" },
  { id: "2", name: "User", description: "Standard user access" },
  { id: "3", name: "Editor", description: "Content editing access" },
  { id: "4", name: "Moderator", description: "Community moderation access" },
];

const defaultFilters: UserFilters = {
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
    onFiltersChange: (filters) => console.log("Filters changed:", filters),
    roles: mockRoles,
    isLoading: false,
    showPresets: true,
  },
};

export const WithActiveFilters: Story = {
  args: {
    filters: {
      ...defaultFilters,
      search: "john@example.com",
      role: "1",
      status: "active",
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    },
    onFiltersChange: (filters) => console.log("Filters changed:", filters),
    roles: mockRoles,
    isLoading: false,
    showPresets: true,
  },
};

export const Loading: Story = {
  args: {
    filters: defaultFilters,
    onFiltersChange: (filters) => console.log("Filters changed:", filters),
    roles: mockRoles,
    isLoading: true,
    showPresets: true,
  },
};

export const WithoutPresets: Story = {
  args: {
    filters: defaultFilters,
    onFiltersChange: (filters) => console.log("Filters changed:", filters),
    roles: mockRoles,
    isLoading: false,
    showPresets: false,
  },
};

export const ManyRoles: Story = {
  args: {
    filters: defaultFilters,
    onFiltersChange: (filters) => console.log("Filters changed:", filters),
    roles: [
      ...mockRoles,
      { id: "5", name: "Author", description: "Content creation access" },
      { id: "6", name: "Reviewer", description: "Content review access" },
      { id: "7", name: "Publisher", description: "Content publishing access" },
      { id: "8", name: "Analyst", description: "Analytics access" },
      { id: "9", name: "Support", description: "Customer support access" },
      { id: "10", name: "Manager", description: "Team management access" },
    ],
    isLoading: false,
    showPresets: true,
  },
};
