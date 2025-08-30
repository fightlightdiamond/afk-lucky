import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { FilterPresets } from "@/components/admin/filters/FilterPresets";
import { UserFilters } from "@/types/user";

// Interactive wrapper for Storybook
const InteractiveFilterPresets = (props: any) => {
  const [currentFilters, setCurrentFilters] = useState<UserFilters>(
    props.currentFilters
  );

  const handlePresetApply = (filters: UserFilters) => {
    setCurrentFilters(filters);
    props.onPresetApply(filters);
  };

  return (
    <FilterPresets
      {...props}
      currentFilters={currentFilters}
      onPresetApply={handlePresetApply}
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
          "A filter presets component providing quick access to commonly used filter combinations. Features predefined presets like 'Active Users', 'Recently Created', 'Never Logged In', and custom preset management.",
      },
    },
  },
  argTypes: {
    currentFilters: {
      description: "Current filter state",
      control: { type: "object" },
    },
    showCustomPresets: {
      description: "Whether to show custom preset management",
      control: { type: "boolean" },
    },
    disabled: {
      description: "Whether the presets are disabled",
      control: { type: "boolean" },
    },
    onPresetApply: {
      description: "Callback when a preset is applied",
      action: "presetApply",
    },
    onPresetSave: {
      description: "Callback when a custom preset is saved",
      action: "presetSave",
    },
    onPresetDelete: {
      description: "Callback when a custom preset is deleted",
      action: "presetDelete",
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
  status: "active",
  role: "role-admin",
};

export const Default: Story = {
  args: {
    currentFilters: defaultFilters,
    showCustomPresets: true,
    disabled: false,
    onPresetApply: fn(),
    onPresetSave: fn(),
    onPresetDelete: fn(),
  },
};

export const WithActiveFilters: Story = {
  args: {
    currentFilters: activeFilters,
    showCustomPresets: true,
    disabled: false,
    onPresetApply: fn(),
    onPresetSave: fn(),
    onPresetDelete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Filter presets with some filters already applied.",
      },
    },
  },
};

export const WithoutCustomPresets: Story = {
  args: {
    currentFilters: defaultFilters,
    showCustomPresets: false,
    disabled: false,
    onPresetApply: fn(),
    onPresetSave: fn(),
    onPresetDelete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Filter presets without custom preset management functionality.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    currentFilters: activeFilters,
    showCustomPresets: true,
    disabled: true,
    onPresetApply: fn(),
    onPresetSave: fn(),
    onPresetDelete: fn(),
  },
};

export const InteractiveDemo: Story = {
  render: (args) => {
    const [currentFilters, setCurrentFilters] =
      useState<UserFilters>(defaultFilters);
    const [showCustomPresets, setShowCustomPresets] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [customPresets, setCustomPresets] = useState([
      {
        id: "1",
        name: "My Admins",
        filters: { ...defaultFilters, role: "role-admin", status: "active" },
      },
      {
        id: "2",
        name: "Inactive Users",
        filters: { ...defaultFilters, status: "inactive" },
      },
    ]);

    const handlePresetApply = (filters: UserFilters) => {
      setCurrentFilters(filters);
      args.onPresetApply?.(filters);
    };

    const handlePresetSave = (name: string, filters: UserFilters) => {
      const newPreset = {
        id: Date.now().toString(),
        name,
        filters,
      };
      setCustomPresets((prev) => [...prev, newPreset]);
      args.onPresetSave?.(name, filters);
    };

    const handlePresetDelete = (presetId: string) => {
      setCustomPresets((prev) => prev.filter((p) => p.id !== presetId));
      args.onPresetDelete?.(presetId);
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
      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showCustomPresets}
                onChange={(e) => setShowCustomPresets(e.target.checked)}
              />
              Show Custom Presets
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

          <FilterPresets
            currentFilters={currentFilters}
            showCustomPresets={showCustomPresets}
            disabled={disabled}
            customPresets={customPresets}
            onPresetApply={handlePresetApply}
            onPresetSave={handlePresetSave}
            onPresetDelete={handlePresetDelete}
          />
        </div>

        <div className="p-4 bg-muted rounded-lg space-y-3">
          <h4 className="font-medium">Current Filter State:</h4>
          <p className="text-sm text-muted-foreground">
            {getActiveFiltersDescription()}
          </p>

          <div className="text-xs space-y-1">
            {currentFilters.search && (
              <p>
                <strong>Search:</strong> "{currentFilters.search}"
              </p>
            )}
            {currentFilters.role && (
              <p>
                <strong>Role:</strong> {currentFilters.role}
              </p>
            )}
            {currentFilters.status && (
              <p>
                <strong>Status:</strong> {currentFilters.status}
              </p>
            )}
            {currentFilters.activity_status && (
              <p>
                <strong>Activity:</strong> {currentFilters.activity_status}
              </p>
            )}
            {currentFilters.dateRange && (
              <p>
                <strong>Date Range:</strong> Selected
              </p>
            )}
          </div>
        </div>

        {customPresets.length > 0 && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium">Custom Presets:</h4>
            <ul className="text-sm space-y-1">
              {customPresets.map((preset) => (
                <li
                  key={preset.id}
                  className="flex items-center justify-between"
                >
                  <span>{preset.name}</span>
                  <button
                    onClick={() => handlePresetDelete(preset.id)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Tip:</strong> Use presets to quickly apply common filter
            combinations!
          </p>
        </div>
      </div>
    );
  },
};
