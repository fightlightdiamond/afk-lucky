import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { FilterPresets, FilterPreset } from "@/components/admin/filters/FilterPresets";
import { UserFilters, UserStatus } from "@/types/user";

// Interactive wrapper for Storybook
const InteractiveFilterPresets = (props: {
  presets?: FilterPreset[];
  currentFilters?: UserFilters;
  onPresetSelect: (filters: Partial<UserFilters>) => void;
  disabled?: boolean;
}) => {
  const [currentFilters, setCurrentFilters] = useState<UserFilters>(
    props.currentFilters || { search: '', status: null, role: null, dateRange: null, activityDateRange: null, sortBy: 'created_at', sortOrder: 'desc', activity_status: null }
  );

  const handlePresetSelect = (filters: Partial<UserFilters>) => {
    setCurrentFilters({ ...currentFilters, ...filters });
    props.onPresetSelect(filters);
  };

  return (
    <FilterPresets
      {...props}
      currentFilters={currentFilters}
      onPresetSelect={handlePresetSelect}
    />
  );
};

const meta: Meta<typeof FilterPresets> = {
  title: "Admin/Filters/FilterPresets",
  component: InteractiveFilterPresets,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Filter presets help users quickly apply common filter combinations. Features predefined presets like 'Active Users', 'Recently Created', 'Never Logged In', and custom preset management.",
      },
    },
  },
  argTypes: {
    currentFilters: {
      description: "Current filter state",
      control: { type: "object" },
    },
    disabled: {
      description: "Whether the presets are disabled",
      control: { type: "boolean" },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FilterPresets>;

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

const activeFilters: UserFilters = {
  ...defaultFilters,
  search: "admin",
  status: UserStatus.ACTIVE,
  role: "role-admin",
};

export const Default: Story = {
  args: {
    presets: undefined, 
    currentFilters: {
      search: "",
      status: null,
      role: null,
      dateRange: null,
      activityDateRange: null,
      sortBy: "created_at",
      sortOrder: "desc",
      activity_status: null,
    },
    onPresetSelect: fn(),
    disabled: false,
  },
};

export const WithActiveFilter: Story = {
  args: {
    currentFilters: activeFilters,
    disabled: false,
  },
};

export const WithCustomPresets: Story = {
  args: {
    presets: [
      {
        id: "custom-1",
        label: "VIP Users",
        description: "High-value users",
        filters: {
          role: "admin",
          status: UserStatus.ACTIVE,
        },
      },
    ],
  },
};

export const WithoutCustomPresets: Story = {
  args: {
    currentFilters: defaultFilters,
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const InteractiveDemo: Story = {
  render: function InteractiveDemoRender(args) {
    const [currentFilters, setCurrentFilters] = useState<UserFilters>(defaultFilters);

    const handlePresetSelect = (filters: Partial<UserFilters>) => {
      setCurrentFilters({ ...currentFilters, ...filters });
      args.onPresetSelect?.(filters);
    };

    const getActiveFiltersDescription = () => {
      const activeCount = Object.values(currentFilters).filter((value) => {
        if (value === null || value === "" || value === undefined) return false;
        if (typeof value === "object" && value !== null) {
          return Object.values(value).some((v) => v !== null && v !== "");
        }
        return true;
      }).length;

      return activeCount > 0
        ? `${activeCount} filter(s) active`
        : "No filters active";
    };

    return (
      <div className="p-4 space-y-6">
        <div className="text-sm text-muted-foreground">
          This story demonstrates the FilterPresets component with interactive
          state management. Try applying different presets and see how they
          affect the current filters.
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Filter Presets Demo</h3>
          </div>

          <FilterPresets
            {...args}
            currentFilters={currentFilters}
            onPresetSelect={handlePresetSelect}
          />

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2">Current Filters:</div>
            <div className="text-sm text-muted-foreground mb-2">
              {getActiveFiltersDescription()}
            </div>
            <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(currentFilters, null, 2)}
            </pre>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Tip:</strong> Click presets to apply filters quickly.
          </p>
        </div>
      </div>
    );
  },
};
