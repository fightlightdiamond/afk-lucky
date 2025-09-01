import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { StatusFilter, type StatusFilterValue } from "@/components/admin/filters/StatusFilter";

// Interactive wrapper for Storybook
const StatusFilterWrapper = (args: React.ComponentProps<typeof StatusFilter>) => {
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterValue>(
    args.value || "all"
  );

  const handleStatusChange = (status: StatusFilterValue) => {
    setSelectedStatus(status);
    args.onChange(status);
  };

  return (
    <StatusFilter
      {...args}
      value={selectedStatus}
      onChange={handleStatusChange}
    />
  );
};

const meta: Meta<typeof StatusFilter> = {
  title: "Admin/Filters/StatusFilter",
  component: StatusFilterWrapper,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A status filter component for filtering users by their account status (active, inactive, banned). Features clear visual indicators and accessibility support.",
      },
    },
  },
  argTypes: {
    value: {
      description: "Currently selected status",
      control: { type: "select" },
      options: ["all", "active", "inactive", "banned", "pending", "suspended"],
    },
    disabled: {
      description: "Whether the filter is disabled",
      control: { type: "boolean" },
    },
    showCounts: {
      description: "Whether to show user counts for each status",
      control: { type: "boolean" },
    },
    counts: {
      description: "User counts for each status",
      control: { type: "object" },
    },
    onChange: {
      description: "Callback when status changes",
      action: "statusChange",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StatusFilter>;

const sampleStatusCounts = {
  active: 145,
  inactive: 23,
  total: 175,
};

export const Default: Story = {
  args: {
    value: "all",
    disabled: false,
    showCounts: false,
    onChange: fn(),
  },
};

export const WithActiveSelection: Story = {
  args: {
    value: "active",
    disabled: false,
    showCounts: false,
    onChange: fn(),
  },
};

export const WithInactiveSelection: Story = {
  args: {
    value: "inactive",
    disabled: false,
    showCounts: false,
    onChange: fn(),
  },
};

export const WithBannedSelection: Story = {
  args: {
    value: "banned",
    disabled: false,
    showCounts: false,
    onChange: fn(),
  },
};

export const WithCounts: Story = {
  args: {
    value: "all",
    disabled: false,
    showCounts: true,
    counts: sampleStatusCounts,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Status filter showing user counts for each status option.",
      },
    },
  },
};

export const WithCountsAndSelection: Story = {
  args: {
    value: "active",
    disabled: false,
    showCounts: true,
    counts: sampleStatusCounts,
    onChange: fn(),
  },
};

export const Disabled: Story = {
  args: {
    value: "active",
    disabled: true,
    showCounts: true,
    counts: sampleStatusCounts,
    onChange: fn(),
  },
};

export const ZeroCounts: Story = {
  args: {
    value: "all",
    disabled: false,
    showCounts: true,
    counts: {
      active: 0,
      inactive: 0,
      total: 0,
    },
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Status filter when all counts are zero.",
      },
    },
  },
};

export const LargeCounts: Story = {
  args: {
    value: "all",
    disabled: false,
    showCounts: true,
    counts: {
      active: 12567,
      inactive: 3421,
      total: 16077,
    },
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Status filter with large user counts to test number formatting.",
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: function InteractiveDemoRender(args) {
    const [selectedStatus, setSelectedStatus] = useState<StatusFilterValue>('all');
    const [disabled, setDisabled] = useState(false);
    const [showCounts, setShowCounts] = useState(true);

    const handleStatusChange = (status: StatusFilterValue) => {
      setSelectedStatus(status);
      args.onChange?.(status);
    };

    const getStatusDescription = (status: string | null) => {
      switch (status) {
        case "active":
          return "Users who can log in and use the system normally.";
        case "inactive":
          return "Users who have been deactivated but not banned.";
        case "banned":
          return "Users who have been banned from the system.";
        default:
          return "All users regardless of their status.";
      }
    };

    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showCounts}
                onChange={(e) => setShowCounts(e.target.checked)}
              />
              Show Counts
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

          <StatusFilter
            value={selectedStatus}
            disabled={disabled}
            showCounts={showCounts}
            counts={showCounts ? { active: 45, inactive: 12, total: 57 } : undefined}
            onChange={handleStatusChange}
          />
        </div>

        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-medium">
            Current Filter: {selectedStatus === 'all' ? 'All Statuses' : selectedStatus}
          </h4>
          <p className="text-sm text-muted-foreground">
            {getStatusDescription(selectedStatus === 'all' ? null : selectedStatus)}
          </p>
          {showCounts && selectedStatus !== 'all' && (
            <p className="text-sm">
              <strong>Count:</strong>{" "}
              {
                sampleStatusCounts[
                  selectedStatus as keyof typeof sampleStatusCounts
                ]
              }{" "}
              users
            </p>
          )}
        </div>
      </div>
    );
  },
};
