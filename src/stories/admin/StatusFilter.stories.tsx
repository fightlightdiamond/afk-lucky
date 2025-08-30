import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { StatusFilter } from "@/components/admin/filters/StatusFilter";

// Interactive wrapper for Storybook
const InteractiveStatusFilter = (props: any) => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(
    props.selectedStatus || null
  );

  const handleStatusChange = (status: string | null) => {
    setSelectedStatus(status);
    props.onStatusChange(status);
  };

  return (
    <StatusFilter
      {...props}
      selectedStatus={selectedStatus}
      onStatusChange={handleStatusChange}
    />
  );
};

const meta: Meta<typeof StatusFilter> = {
  title: "Admin/Filters/StatusFilter",
  component: InteractiveStatusFilter,
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
    selectedStatus: {
      description: "Currently selected status",
      control: {
        type: "select",
        options: [null, "active", "inactive", "banned"],
      },
    },
    disabled: {
      description: "Whether the filter is disabled",
      control: { type: "boolean" },
    },
    showCounts: {
      description: "Whether to show user counts for each status",
      control: { type: "boolean" },
    },
    statusCounts: {
      description: "User counts for each status",
      control: { type: "object" },
    },
    onStatusChange: {
      description: "Callback when selected status changes",
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
  banned: 7,
};

export const Default: Story = {
  args: {
    selectedStatus: null,
    disabled: false,
    showCounts: false,
    onStatusChange: fn(),
  },
};

export const WithActiveSelection: Story = {
  args: {
    selectedStatus: "active",
    disabled: false,
    showCounts: false,
    onStatusChange: fn(),
  },
};

export const WithInactiveSelection: Story = {
  args: {
    selectedStatus: "inactive",
    disabled: false,
    showCounts: false,
    onStatusChange: fn(),
  },
};

export const WithBannedSelection: Story = {
  args: {
    selectedStatus: "banned",
    disabled: false,
    showCounts: false,
    onStatusChange: fn(),
  },
};

export const WithCounts: Story = {
  args: {
    selectedStatus: null,
    disabled: false,
    showCounts: true,
    statusCounts: sampleStatusCounts,
    onStatusChange: fn(),
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
    selectedStatus: "active",
    disabled: false,
    showCounts: true,
    statusCounts: sampleStatusCounts,
    onStatusChange: fn(),
  },
};

export const Disabled: Story = {
  args: {
    selectedStatus: "active",
    disabled: true,
    showCounts: true,
    statusCounts: sampleStatusCounts,
    onStatusChange: fn(),
  },
};

export const ZeroCounts: Story = {
  args: {
    selectedStatus: null,
    disabled: false,
    showCounts: true,
    statusCounts: {
      active: 0,
      inactive: 0,
      banned: 0,
    },
    onStatusChange: fn(),
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
    selectedStatus: null,
    disabled: false,
    showCounts: true,
    statusCounts: {
      active: 12567,
      inactive: 3421,
      banned: 89,
    },
    onStatusChange: fn(),
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
  render: (args) => {
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [showCounts, setShowCounts] = useState(true);
    const [disabled, setDisabled] = useState(false);

    const handleStatusChange = (status: string | null) => {
      setSelectedStatus(status);
      args.onStatusChange?.(status);
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
            selectedStatus={selectedStatus}
            disabled={disabled}
            showCounts={showCounts}
            statusCounts={showCounts ? sampleStatusCounts : undefined}
            onStatusChange={handleStatusChange}
          />
        </div>

        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-medium">
            Current Filter: {selectedStatus || "All Statuses"}
          </h4>
          <p className="text-sm text-muted-foreground">
            {getStatusDescription(selectedStatus)}
          </p>
          {showCounts && selectedStatus && (
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
